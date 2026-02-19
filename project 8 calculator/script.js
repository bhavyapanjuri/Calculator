class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.soundEnabled = true;
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert('Cannot divide by zero!');
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        const expression = `${this.previousOperand} ${this.operation} ${this.currentOperand}`;
        this.addToHistory(expression, computation);
        
        this.currentOperand = this.roundResult(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    percentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = this.roundResult(current / 100);
        this.shouldResetScreen = true;
    }

    scientificOperation(operation) {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        let result;
        switch (operation) {
            case 'sin':
                result = Math.sin(current * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(current * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(current * Math.PI / 180);
                break;
            case 'log':
                result = Math.log10(current);
                break;
            case 'ln':
                result = Math.log(current);
                break;
            case 'sqrt':
                if (current < 0) {
                    alert('Cannot calculate square root of negative number!');
                    return;
                }
                result = Math.sqrt(current);
                break;
            case 'power':
                result = Math.pow(current, 2);
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            default:
                return;
        }

        const expression = `${operation}(${this.currentOperand})`;
        this.addToHistory(expression, result);
        
        this.currentOperand = this.roundResult(result);
        this.shouldResetScreen = true;
    }

    roundResult(number) {
        return Math.round(number * 100000000) / 100000000;
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: this.roundResult(result),
            timestamp: new Date().toLocaleString()
        };
        this.history.unshift(historyItem);
        if (this.history.length > 50) {
            this.history.pop();
        }
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        updateHistoryDisplay();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        updateHistoryDisplay();
    }

    playSound() {
        if (this.soundEnabled) {
            const sound = document.getElementById('clickSound');
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }
}

// Initialize calculator
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Number buttons
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.playSound();
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

// Action buttons
document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.playSound();
        const action = button.dataset.action;

        switch (action) {
            case 'clear':
                calculator.clear();
                break;
            case 'delete':
                calculator.delete();
                break;
            case 'decimal':
                calculator.appendNumber('.');
                break;
            case 'equals':
                calculator.compute();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                const operations = {
                    'add': '+',
                    'subtract': '−',
                    'multiply': '×',
                    'divide': '÷'
                };
                calculator.chooseOperation(operations[action]);
                break;
            case 'percentage':
                calculator.percentage();
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
            case 'power':
            case 'pi':
            case 'e':
                calculator.scientificOperation(action);
                break;
        }

        calculator.updateDisplay();
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9) {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '.') {
        calculator.appendNumber('.');
        calculator.updateDisplay();
    }
    if (e.key === 'Enter' || e.key === '=') {
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '+') {
        calculator.chooseOperation('+');
        calculator.updateDisplay();
    }
    if (e.key === '-') {
        calculator.chooseOperation('−');
        calculator.updateDisplay();
    }
    if (e.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    }
    if (e.key === '/') {
        e.preventDefault();
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }
    if (e.key === '%') {
        calculator.percentage();
        calculator.updateDisplay();
    }
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('calculatorTheme') || 'dark';

if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
    calculator.playSound();
    document.body.classList.toggle('light-mode');
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('calculatorTheme', currentTheme);
});

// Mode toggle (Basic/Scientific)
const modeToggle = document.getElementById('modeToggle');
const basicButtons = document.getElementById('basicButtons');
const scientificButtons = document.getElementById('scientificButtons');
let isScientific = false;

modeToggle.addEventListener('click', () => {
    calculator.playSound();
    isScientific = !isScientific;
    
    if (isScientific) {
        basicButtons.classList.add('hidden');
        scientificButtons.classList.remove('hidden');
        modeToggle.innerHTML = '<span>🔢</span>';
    } else {
        basicButtons.classList.remove('hidden');
        scientificButtons.classList.add('hidden');
        modeToggle.innerHTML = '<span>📐</span>';
    }
});

// History panel toggle
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');

historyToggle.addEventListener('click', () => {
    calculator.playSound();
    historyPanel.classList.toggle('active');
});

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (calculator.history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No calculations yet</p>';
        return;
    }

    historyList.innerHTML = calculator.history.map(item => `
        <div class="history-item" onclick="loadFromHistory('${item.result}')">
            <div class="expression">${item.expression}</div>
            <div class="result">= ${item.result}</div>
        </div>
    `).join('');
}

// Load from history
function loadFromHistory(result) {
    calculator.playSound();
    calculator.currentOperand = result.toString();
    calculator.shouldResetScreen = true;
    calculator.updateDisplay();
}

// Clear history
document.getElementById('clearHistory').addEventListener('click', () => {
    calculator.playSound();
    if (confirm('Clear all history?')) {
        calculator.clearHistory();
    }
});

// Initialize display and history
calculator.updateDisplay();
updateHistoryDisplay();

// Close history panel when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!historyPanel.contains(e.target) && !historyToggle.contains(e.target)) {
            historyPanel.classList.remove('active');
        }
    }
});
