// --- DOM Elements ---
const passwordDisplay = document.getElementById('passwordDisplay');
const passwordLengthSlider = document.getElementById('passwordLength');
const lengthValueDisplay = document.getElementById('lengthValue');
const copyButton = document.getElementById('copyButton');
const refreshButton = document.getElementById('refreshButton');
const strengthBar = document.getElementById('strengthBar');
const copyFeedback = document.getElementById('copyFeedback');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Checkboxes
    const includeUppercaseCheckbox = document.getElementById('includeUppercase');
    const includeLowercaseCheckbox = document.getElementById('includeLowercase');
    const includeNumbersCheckbox = document.getElementById('includeNumbers');
    const includeSymbolsCheckbox = document.getElementById('includeSymbols');
    const checkboxes = [includeUppercaseCheckbox, includeLowercaseCheckbox, includeNumbersCheckbox, includeSymbolsCheckbox];

    // Radio Buttons
    const typeEasySayRadio = document.getElementById('typeEasySay');
    const typeEasyReadRadio = document.getElementById('typeEasyRead');
    const typeAllCharsRadio = document.getElementById('typeAllChars');
    const passwordTypeRadios = document.querySelectorAll('input[name="passwordType"]');

    // --- Character Sets ---
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~';
    const ambiguousChars = 'Il1O0o'; // Characters to exclude for 'Easy to read'

    // --- Event Listeners ---
    passwordLengthSlider.addEventListener('input', (event) => {
        lengthValueDisplay.textContent = event.target.value;
        generatePassword();
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });

    passwordTypeRadios.forEach(radio => {
        radio.addEventListener('change', handlePasswordTypeChange);
    });

    refreshButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyPassword);

    // --- Functions ---
    function handlePasswordTypeChange() {
        const selectedType = document.querySelector('input[name="passwordType"]:checked').value;

        if (selectedType === 'easySay') {
            includeNumbersCheckbox.checked = false;
            includeNumbersCheckbox.disabled = true;
            includeSymbolsCheckbox.checked = false;
            includeSymbolsCheckbox.disabled = true;
            if (!includeUppercaseCheckbox.checked && !includeLowercaseCheckbox.checked) {
                includeLowercaseCheckbox.checked = true;
            }
            includeUppercaseCheckbox.disabled = false;
            includeLowercaseCheckbox.disabled = false;
        } else {
            includeNumbersCheckbox.disabled = false;
            includeSymbolsCheckbox.disabled = false;
            includeUppercaseCheckbox.disabled = false;
            includeLowercaseCheckbox.disabled = false;
        }

        generatePassword();
    }

    function generatePassword() {
        const length = parseInt(passwordLengthSlider.value);
        const includeUppercase = includeUppercaseCheckbox.checked;
        const includeLowercase = includeLowercaseCheckbox.checked;
        const includeNumbers = includeNumbersCheckbox.checked;
        const includeSymbols = includeSymbolsCheckbox.checked;
        const passwordType = document.querySelector('input[name="passwordType"]:checked').value;

        let availableChars = '';
        let guaranteedChars = '';

        if (includeUppercase) {
            availableChars += uppercaseChars;
            guaranteedChars += getRandomChar(uppercaseChars);
        }
        if (includeLowercase) {
            availableChars += lowercaseChars;
            guaranteedChars += getRandomChar(lowercaseChars);
        }
        if (includeNumbers && !typeEasySayRadio.checked) {
            availableChars += numberChars;
            guaranteedChars += getRandomChar(numberChars);
        }
        if (includeSymbols && !typeEasySayRadio.checked) {
            availableChars += symbolChars;
            guaranteedChars += getRandomChar(symbolChars);
        }

        if (passwordType === 'easyRead') {
            availableChars = availableChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
            guaranteedChars = '';
            if (includeUppercase) {
                let filteredUpper = uppercaseChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
                if(filteredUpper) guaranteedChars += getRandomChar(filteredUpper);
            }
            if (includeLowercase) {
                let filteredLower = lowercaseChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
                if(filteredLower) guaranteedChars += getRandomChar(filteredLower);
            }
            if (includeNumbers && !typeEasySayRadio.checked) {
                let filteredNumbers = numberChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
                if(filteredNumbers) guaranteedChars += getRandomChar(filteredNumbers);
            }
            if (includeSymbols && !typeEasySayRadio.checked) {
                let filteredSymbols = symbolChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
                if(filteredSymbols) guaranteedChars += getRandomChar(filteredSymbols);
            }
        }

        if (availableChars === '') {
            passwordDisplay.value = 'Select options';
            updateStrengthIndicator(0);
            return;
        }

        let generatedPassword = guaranteedChars;
        const remainingLength = length - generatedPassword.length;
        
        for (let i = 0; i < remainingLength; i++) {
            if (availableChars.length === 0) break;
            generatedPassword += getRandomChar(availableChars);
        }

        generatedPassword = shuffleString(generatedPassword);

        if (generatedPassword.length > length) {
            generatedPassword = generatedPassword.slice(0, length);
        } else if (generatedPassword.length < length && availableChars.length > 0) {
            while(generatedPassword.length < length) {
                generatedPassword += getRandomChar(availableChars);
            }
            generatedPassword = shuffleString(generatedPassword);
        }

        passwordDisplay.value = generatedPassword;
        updateStrengthIndicator(calculateStrength(generatedPassword, length));
    }

    function getRandomChar(charSet) {
        if (!charSet || charSet.length === 0) return '';
        const randomIndex = Math.floor(Math.random() * charSet.length);
        return charSet[randomIndex];
    }

    function shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    function calculateStrength(password, length) {
        let score = 0;
        let typesUsed = 0;

        if(password && password !== 'Select options') {
            if (/[a-z]/.test(password)) typesUsed++;
            if (/[A-Z]/.test(password)) typesUsed++;
            if (/[0-9]/.test(password)) typesUsed++;
            if (/[^a-zA-Z0-9]/.test(password)) typesUsed++;
        } else {
            return 0;
        }

        score += Math.min(length * 4, 40);

        if (typesUsed > 1) score += typesUsed * 5;
        if (typesUsed >= 3 && length >= 8) score += 15;
        if (typesUsed === 4 && length >= 12) score += 20;

        return Math.min(Math.max(score, 0), 100);
    }

    function updateStrengthIndicator(strengthScore) {
        let colorClass = 'bg-gray-300';
        if (strengthScore >= 75) {
            colorClass = 'bg-green-500';
        } else if (strengthScore >= 40) {
            colorClass = 'bg-yellow-500';
        } else if (strengthScore > 0) {
            colorClass = 'bg-red-500';
        }

        strengthBar.classList.remove('bg-gray-300', 'bg-red-500', 'bg-yellow-500', 'bg-green-500');
        strengthBar.classList.add(colorClass);
        strengthBar.style.width = `${strengthScore > 0 ? strengthScore : 0}%`;
    }

    function copyPassword() {
        if (!passwordDisplay.value || passwordDisplay.value === 'Select options') return;

        navigator.clipboard.writeText(passwordDisplay.value)
            .then(() => {
                copyFeedback.style.opacity = '1';
                setTimeout(() => {
                    copyFeedback.style.opacity = '0';
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy password: ', err);
                alert("Could not copy password to clipboard.");
            });
    }

    // --- Initial Setup ---
    lengthValueDisplay.textContent = passwordLengthSlider.value;
    handlePasswordTypeChange();
});