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

  // ---- Floating Rate Mode ----
  var lockedBtn = document.getElementById('rate-mode-locked');
  var floatingBtn = document.getElementById('rate-mode-floating');
  var isFloating = false;
  var baseReceiveValue = 0;
  var floatingInterval = null;

  function applyFluctuation() {
    if (!isFloating) return;
    var factor = 1 + (Math.random() - 0.5) * 0.0004;
    var fluctuated = baseReceiveValue * factor;
    receiveInput.value = receiveCurrency === 'BTC' ? fmtBtc(fluctuated) : fmtMoney(fluctuated, receiveCurrency);
  }

  function setRateMode(mode) {
    if (mode === 'floating' && !isFloating) {
      isFloating = true;
      lockedBtn.classList.remove('bg-emerald-500/20', 'text-emerald-400');
      lockedBtn.classList.add('text-gray-400');
      floatingBtn.classList.add('bg-emerald-500/20', 'text-emerald-400');
      floatingBtn.classList.remove('text-gray-400');
      baseReceiveValue = parseFloat(receiveInput.value.replace(/[^0-9.]/g, '')) || 0;
      floatingInterval = setInterval(applyFluctuation, 3000);
    } else if (mode === 'locked' && isFloating) {
      isFloating = false;
      clearInterval(floatingInterval);
      floatingInterval = null;
      floatingBtn.classList.remove('bg-emerald-500/20', 'text-emerald-400');
      floatingBtn.classList.add('text-gray-400');
      lockedBtn.classList.add('bg-emerald-500/20', 'text-emerald-400');
      lockedBtn.classList.remove('text-gray-400');
      calculate();
    }
  }

  if (lockedBtn && floatingBtn) {
    lockedBtn.addEventListener('click', function () { setRateMode('locked'); });
    floatingBtn.addEventListener('click', function () { setRateMode('floating'); });
  }

  var origCalculate = calculate;
  calculate = function () {
    origCalculate();
    if (isFloating) {
      baseReceiveValue = parseFloat(receiveInput.value.replace(/[^0-9.]/g, '')) || 0;
    }
  };
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
    var rawAmount = document.getElementById('transfer-amount').value.trim();
    if (!wallet || rawAmount === '') return;

    var amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount <= 0) return;

    var btcAmount = (amount / 67500).toFixed(6);
    var short = wallet.length > 10 ? wallet.slice(0, 6) + '...' + wallet.slice(-4) : wallet;
    var now = new Date();
    var timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    var row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';
    row.innerHTML =
      '<td class="px-5 py-4"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0"><i data-lucide="arrow-up-right" class="w-4 h-4"></i></div><div><p class="font-medium text-gray-900">Sent Bitcoin</p><p class="text-xs text-gray-400 mt-0.5">To: ' + short + '</p></div></div></td>' +
      '<td class="px-5 py-4 font-medium text-red-500">-' + btcAmount + ' BTC</td>' +
      '<td class="px-5 py-4 text-gray-400">' + timestamp + '</td>' +
      '<td class="px-5 py-4"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Completed</span></td>';

    tableBody.insertBefore(row, tableBody.firstChild);

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

    closeModal();
    document.getElementById('wallet-address').value = '';
    document.getElementById('transfer-amount').value = '';
  });
}

// ---- Sign In Modal ----
(function () {
  var link = document.getElementById('signin-link');
  var modal = document.getElementById('signin-modal');
  var close = document.getElementById('signin-modal-close');
  var form = document.getElementById('signin-form');

  if (!link || !modal) return;

  function openModal(e) {
    e.preventDefault();
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  link.addEventListener('click', openModal);

  if (close) {
    close.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }

  var toSignup = document.getElementById('signin-to-signup');
  if (toSignup) {
    toSignup.addEventListener('click', function () {
      closeModal();
      var signupModal = document.getElementById('signup-modal');
      if (signupModal) signupModal.classList.remove('hidden');
    });
  }
})();

// ---- Sign Up Modal ----
(function () {
  var navLink = document.getElementById('getstarted-link');
  var cardLink = document.getElementById('getstarted-card');
  var modal = document.getElementById('signup-modal');
  var close = document.getElementById('signup-modal-close');
  var form = document.getElementById('signup-form');
  var toSignin = document.getElementById('signup-to-signin');

  function openModal(e) {
    e.preventDefault();
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal() {
    if (modal) modal.classList.add('hidden');
  }

  if (navLink) navLink.addEventListener('click', openModal);
  if (cardLink) cardLink.addEventListener('click', openModal);
  if (close) close.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }

  if (toSignin) {
    toSignin.addEventListener('click', function () {
      closeModal();
      var signinModal = document.getElementById('signin-modal');
      if (signinModal) signinModal.classList.remove('hidden');
    });
  }
})();

// ---- Chat Widget ----
(function () {
  var chatWidget = document.getElementById('chat-widget');
  var chatPopup = document.getElementById('chat-popup');
  var chatClose = document.getElementById('chat-close');
  var chatInput = document.getElementById('chat-input');
  var chatSend = document.getElementById('chat-send');
  var chatMessages = document.getElementById('chat-messages');

  if (!chatWidget || !chatPopup) return;

  function toggleChat(e) {
    e.stopPropagation();
    chatPopup.classList.toggle('hidden');
    if (!chatPopup.classList.contains('hidden') && chatInput) {
      chatInput.focus();
    }
  }

  chatWidget.addEventListener('click', toggleChat);

  if (chatClose) {
    chatClose.addEventListener('click', function (e) {
      e.stopPropagation();
      chatPopup.classList.add('hidden');
    });
  }

  function addMessage(text, isUser) {
    var div = document.createElement('div');
    if (isUser) {
      div.className = 'flex justify-end';
      div.innerHTML = '<div class="bg-emerald-600 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]"><p class="text-sm text-white">' + text + '</p></div>';
    } else {
      div.className = 'flex items-start gap-3';
      div.innerHTML = '<div class="w-7 h-7 rounded-full bg-[#fcd535] flex items-center justify-center shrink-0"><i data-lucide="headphones" class="w-3.5 h-3.5 text-black"></i></div><div class="bg-[#2b3139] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]"><p class="text-sm text-gray-200">' + text + '</p></div>';
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function sendMessage() {
    var text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, true);
    chatInput.value = '';
    setTimeout(function () {
      addMessage('Thanks for reaching out! Our team will get back to you shortly. In the meantime, check our FAQ or dashboard for instant answers.');
    }, 1000);
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage();
    });
  }
})();
