// ===========================================
// Calculator Logic
// ===========================================

// Grab the elements we need from the page
const expressionEl = document.getElementById('expression');
const outputEl = document.getElementById('output');
const keys = document.querySelectorAll('.key');

// This object holds the current state of the calculator
const state = {
  firstValue: null,      // the first number in the calculation
  operator: null,        // the operator chosen ( + - * / )
  secondValue: null,      // the second number in the calculation
  currentInput: '0',      // what's currently being typed/shown
  justEvaluated: false,
  waitingForSecondValue: false   // true right after pressing "="
};

// Update the screen to match the current state
function updateScreen() {
  outputEl.textContent = state.currentInput;

  if (state.operator && state.firstValue !== null) {
    const symbol = operatorSymbol(state.operator);
    expressionEl.textContent = `${state.firstValue} ${symbol}`;
  } else {
    expressionEl.textContent = '';
  }
}

// Convert the operator code into the symbol shown on screen
function operatorSymbol(operator) {
  switch (operator) {
    case '+': return '+';
    case '-': return '−';
    case '*': return '×';
    case '/': return '÷';
    default: return '';
  }
}

// Handle a number button press
function inputNumber(digit) {

  if (state.justEvaluated) {
    state.currentInput = digit;
    state.justEvaluated = false;
    return;
  }

  if (state.waitingForSecondValue) {
    state.currentInput = digit;
    state.waitingForSecondValue = false;
    return;
  }

  if (state.currentInput === '0') {
    state.currentInput = digit;
  } else {
    state.currentInput += digit;
  }
}

// Handle the decimal point button
function inputDecimal() {
  if (state.justEvaluated) {
    state.currentInput = '0.';
    state.justEvaluated = false;
    return;
  }

  // Only add a decimal point if there isn't one already
  if (!state.currentInput.includes('.')) {
    state.currentInput += '.';
  }
}

// Handle an operator button press (+, -, *, /)
function inputOperator(operator) {
  // If an operator was already chosen and the user picks a new one
  // before typing a second number, just update the operator.
  if (state.operator && !state.justEvaluated && state.firstValue !== null && state.currentInput === String(state.firstValue)) {
    state.operator = operator;
    updateScreen();
    return;
  }

  // If there's already a pending calculation, evaluate it first
  if (state.operator !== null && !state.justEvaluated) {
    calculate();
  }

  state.firstValue = parseFloat(state.currentInput);
state.operator = operator;
state.justEvaluated = false;
state.waitingForSecondValue = true;
}

// Perform the actual math
function calculate() {
  const first = state.firstValue;
  const second = parseFloat(state.currentInput);
  let result;

  if (state.operator === null || isNaN(second)) return;

  switch (state.operator) {
    case '+':
      result = first + second;
      break;
    case '-':
      result = first - second;
      break;
    case '*':
      result = first * second;
      break;
    case '/':
      // Guard against dividing by zero
      result = second === 0 ? 'Error' : first / second;
      break;
    default:
      return;
  }

  // Round long decimals so the display doesn't overflow
  if (typeof result === 'number') {
    result = Math.round(result * 1e10) / 1e10;
  }

  state.currentInput = String(result);
  state.firstValue = result;
  state.operator = null;
  state.justEvaluated = true;
}

// Clear everything back to the starting state (AC button)
function clearAll() {
  state.firstValue = null;
  state.operator = null;
  state.secondValue = null;
  state.currentInput = '0';
  state.justEvaluated = false;
  state.waitingForSecondValue = false;
}

// Delete the last character typed (DEL button)
function deleteLast() {
  if (state.justEvaluated) {
    clearAll();
    return;
  }

  if (state.currentInput.length > 1) {
    state.currentInput = state.currentInput.slice(0, -1);
  } else {
    state.currentInput = '0';
  }
}

// Handle clicks on any calculator button
function handleKeyPress(event) {
  const button = event.target.closest('.key');
  if (!button) return;

  const action = button.dataset.action;

  switch (action) {
    case 'number':
      inputNumber(button.textContent);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'operator':
      inputOperator(button.dataset.operator);
      break;
    case 'equals':
      calculate();
      break;
    case 'clear':
      clearAll();
      break;
    case 'delete':
      deleteLast();
      break;
  }

  updateScreen();
}

// Allow keyboard input too, for convenience
function handleKeyboard(event) {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
  } else if (key === '.') {
    inputDecimal();
  } else if (['+', '-', '*', '/'].includes(key)) {
    inputOperator(key);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculate();
  } else if (key === 'Backspace') {
    deleteLast();
  } else if (key === 'Escape') {
    clearAll();
  } else {
    return; // ignore other keys
  }

  updateScreen();
}

// Wire up the event listeners
document.querySelector('.keys').addEventListener('click', handleKeyPress);
document.addEventListener('keydown', handleKeyboard);

// Show the initial "0" on load
updateScreen();
