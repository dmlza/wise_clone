const sendInput = document.getElementById('send-amount');

const FLAT_FEE = 4.50;
const VARIABLE_RATE = 0.004;

const RATES = {
  'USD': { 'EUR': 0.92, 'GBP': 0.79, 'BTC': 1 / 67500 },
  'EUR': { 'USD': 1.09, 'GBP': 0.86, 'BTC': 1 / 61900 },
  'GBP': { 'USD': 1.27, 'EUR': 1.16, 'BTC': 1 / 78300 },
  'BTC': { 'USD': 67500, 'EUR': 61900, 'GBP': 78300 }
};

const SYMBOLS = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'BTC': '₿' };

// ---- Calculator (index.html) ----
if (sendInput) {
  const receiveInput = document.getElementById('receive-amount');
  const localFeeEl = document.getElementById('local-fee');
  const transferFeeEl = document.getElementById('transfer-fee');
  const totalFeesEl = document.getElementById('total-fees');
  const rateDisplayEl = document.getElementById('rate-display');
  const sendCurrencyLabel = document.getElementById('send-currency-label');
  const receiveCurrencyLabel = document.getElementById('receive-currency-label');
  const sendDropdown = document.getElementById('send-currency-dropdown');
  const receiveDropdown = document.getElementById('receive-currency-dropdown');
  const sendCurrencyBtn = document.getElementById('send-currency-btn');
  const receiveCurrencyBtn = document.getElementById('receive-currency-btn');

  let sendCurrency = 'USD';
  let receiveCurrency = 'BTC';

  function fmtMoney(amount, currency) {
    return (SYMBOLS[currency] || '$') + amount.toFixed(2);
  }

  function fmtBtc(amount) {
    return amount.toFixed(6);
  }

  function getRate(from, to) {
    return (RATES[from] && RATES[from][to]) || 1;
  }

  function formatRate(value, from, to) {
    if (to === 'BTC') return value.toFixed(6);
    if (from === 'BTC') return value.toFixed(2);
    return value.toFixed(2);
  }

  function calculate() {
    const gross = parseFloat(sendInput.value) || 0;
    localStorage.setItem('lastSendAmount', gross);
    const rate = getRate(sendCurrency, receiveCurrency);

    const variableFee = gross * VARIABLE_RATE;
    const totalFee = FLAT_FEE + variableFee;
    const net = gross - totalFee;
    const converted = net * rate;

    receiveInput.value = receiveCurrency === 'BTC' ? fmtBtc(converted) : fmtMoney(converted, receiveCurrency);

    localFeeEl.textContent = fmtMoney(FLAT_FEE, sendCurrency);
    transferFeeEl.textContent = fmtMoney(variableFee, sendCurrency);
    totalFeesEl.textContent = fmtMoney(totalFee, sendCurrency);
    rateDisplayEl.textContent = `1 ${sendCurrency} = ${formatRate(rate, sendCurrency, receiveCurrency)} ${receiveCurrency}`;
  }

  function setSendCurrency(currency) {
    sendCurrency = currency;
    sendCurrencyLabel.textContent = currency === 'BTC' ? '₿ BTC' : currency;
    sendDropdown.classList.add('hidden');
    if (currency === receiveCurrency) {
      const next = Object.keys(RATES).find(c => c !== currency) || 'USD';
      setReceiveCurrency(next);
    } else {
      calculate();
    }
  }

  function setReceiveCurrency(currency) {
    receiveCurrency = currency;
    receiveCurrencyLabel.textContent = currency === 'BTC' ? '₿ BTC' : currency;
    receiveDropdown.classList.add('hidden');
    if (currency === sendCurrency) {
      const next = Object.keys(RATES).find(c => c !== currency) || 'BTC';
      setSendCurrency(next);
    } else {
      calculate();
    }
  }

  function setupDropdown(dropdownId, btnId, setter) {
    const dropdown = document.getElementById(dropdownId);
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const other = dropdownId === 'send-currency-dropdown' ? receiveDropdown : sendDropdown;
      other.classList.add('hidden');
      dropdown.classList.toggle('hidden');
    });
    dropdown.querySelectorAll('button').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        setter(opt.dataset.value);
      });
    });
  }

  setupDropdown('send-currency-dropdown', 'send-currency-btn', setSendCurrency);
  setupDropdown('receive-currency-dropdown', 'receive-currency-btn', setReceiveCurrency);

  document.addEventListener('click', function () {
    sendDropdown.classList.add('hidden');
    receiveDropdown.classList.add('hidden');
  });

  sendInput.addEventListener('input', calculate);
  calculate();
}

// ---- Send Money Modal (dashboard.html) ----
var modal = document.getElementById('send-money-modal');
var sendBtn = document.getElementById('send-money-btn');
var closeBtn = document.getElementById('modal-close');
var form = document.getElementById('transfer-form');

if (modal && sendBtn && closeBtn && form) {
  var tableBody = document.querySelector('#recent-transactions tbody');

  function openModal() { modal.classList.remove('hidden'); }
  function closeModal() { modal.classList.add('hidden'); }

  sendBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var wallet = document.getElementById('wallet-address').value.trim();
    var amount = parseFloat(document.getElementById('transfer-amount').value) || 0;
    if (!wallet || amount <= 0) return;

    var short = wallet.length > 10 ? wallet.slice(0, 6) + '...' + wallet.slice(-4) : wallet;

    var row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';
    row.innerHTML =
      '<td class="px-5 py-4"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0"><i data-lucide="bitcoin" class="w-4 h-4"></i></div><div><p class="font-medium text-gray-900">Sent to ' + short + '</p><p class="text-xs text-gray-400 mt-0.5">USD → BTC</p></div></div></td>' +
      '<td class="px-5 py-4 font-medium text-gray-900">$' + amount.toFixed(2) + '</td>' +
      '<td class="px-5 py-4 text-gray-400">' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</td>' +
      '<td class="px-5 py-4"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Pending</span></td>';

    tableBody.insertBefore(row, tableBody.firstChild);

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

    closeModal();
    document.getElementById('wallet-address').value = '';
    document.getElementById('transfer-amount').value = '';
  });
}
