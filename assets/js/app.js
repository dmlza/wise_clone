const sendInput = document.getElementById('send-amount');
const receiveInput = document.getElementById('receive-amount');
const localFeeEl = document.getElementById('local-fee');
const transferFeeEl = document.getElementById('transfer-fee');
const totalFeesEl = document.getElementById('total-fees');

const FLAT_FEE = 4.50;
const VARIABLE_RATE = 0.004;
const EXCHANGE_RATE = 67500;

function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

function formatBtc(amount) {
  return amount.toFixed(6);
}

function calculate() {
  const gross = parseFloat(sendInput.value) || 0;

  const variableFee = gross * VARIABLE_RATE;
  const totalFee = FLAT_FEE + variableFee;
  const net = gross - totalFee;
  const btc = net / EXCHANGE_RATE;

  receiveInput.value = formatBtc(btc);

  localFeeEl.textContent = formatCurrency(FLAT_FEE);
  transferFeeEl.textContent = formatCurrency(variableFee);
  totalFeesEl.textContent = formatCurrency(totalFee);
}

sendInput.addEventListener('input', calculate);
calculate();
