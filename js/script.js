// Система монет с локальным сохранением
let userBalance = 100;
let selectedShopItem = null;
let currentGame = 'roulette';
let isSpinning = false;
let resultsHistory = [];

// Инициализация данных пользователя
function initUserData() {
    const userData = JSON.parse(localStorage.getItem('taxiUserData')) || {};
    userBalance = userData.balance || 100;
    resultsHistory = userData.history || [];
    updateBalance();
}

// Сохранение данных пользователя
function saveUserData() {
    const userData = {
        balance: userBalance,
        history: resultsHistory,
        lastPlay: new Date().toISOString()
    };
    localStorage.setItem('taxiUserData', JSON.stringify(userData));
}

// Обновляем баланс на странице
function updateBalance() {
    document.getElementById('balance').textContent = userBalance + ' монет';
    saveUserData();
}

// Создание рулетки с SVG
function createRouletteWheel() {
    const svg = document.getElementById('rouletteSvg');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    const segments = [
        { coins: 30, text: "ДЖЕКПОТ", color: "#ff6b6b" },
        { coins: 20, text: "20", color: "#4ecdc4" },
        { coins: 15, text: "15", color: "#45b7d1" },
        { coins: 10, text: "10", color: "#96ceb4" },
        { coins: 8, text: "8", color: "#ffeaa7" },
        { coins: 5, text: "5", color: "#fd79a8" },
        { coins: 3, text: "3", color: "#a29bfe" },
        { coins: 2, text: "2", color: "#fd9644" },
        { coins: 1, text: "1", color: "#2bcbba" },
        { coins: 0, text: "0", color: "#fc5c65" },
        { coins: 0, text: "0", color: "#3867d6" },
        { coins: 0, text: "0", color: "#8854d0" }
    ];

    const centerX = 200;
    const centerY = 200;
    const radius = 180;
    
    segments.forEach((segment, index) => {
        const angle = (index * 30) * Math.PI / 180;
        const nextAngle = ((index + 1) * 30) * Math.PI / 180;
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const x1 = centerX + radius * Math.sin(angle);
        const y1 = centerY - radius * Math.cos(angle);
        const x2 = centerX + radius * Math.sin(nextAngle);
        const y2 = centerY - radius * Math.cos(nextAngle);
        
        path.setAttribute("d", `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`);
        path.setAttribute("fill", segment.color);
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", "2");
        svg.appendChild(path);
        
        const textAngle = (index * 30 + 15) * Math.PI / 180;
        const textRadius = radius * 0.7;
        const textX = centerX + textRadius * Math.sin(textAngle);
        const textY = centerY - textRadius * Math.cos(textAngle);
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textX);
        text.setAttribute("y", textY);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-weight", segment.coins === 30 ? "bold" : "normal");
        text.setAttribute("font-size", segment.coins === 30 ? "14" : "12");
        text.setAttribute("transform", `rotate(${index * 30 + 15}, ${textX}, ${textY})`);
        text.textContent = segment.text;
        svg.appendChild(text);
    });
    
    const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    centerCircle.setAttribute("cx", centerX);
    centerCircle.setAttribute("cy", centerY);
    centerCircle.setAttribute("r", "40");
    centerCircle.setAttribute("fill", "#2d3436");
    centerCircle.setAttribute("stroke", "white");
    centerCircle.setAttribute("stroke-width", "3");
    svg.appendChild(centerCircle);
    
    const taxiText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    taxiText.setAttribute("x", centerX);
    taxiText.setAttribute("y", centerY + 5);
    taxiText.setAttribute("text-anchor", "middle");
    taxiText.setAttribute("fill", "white");
    taxiText.setAttribute("font-weight", "bold");
    taxiText.setAttribute("font-size", "16");
    taxiText.textContent = "TAXI";
    svg.appendChild(taxiText);
}

function spinRoulette() {
    if (isSpinning || userBalance < 5) return;
    
    userBalance -= 5;
    updateBalance();
    isSpinning = true;
    
    const resultDiv = document.getElementById('result');
    const spinBtn = document.getElementById('spinBtn');
    
    spinBtn.disabled = true;
    spinBtn.classList.remove('pulse');
    
    const wheel = document.getElementById('wheel');
    
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * 12);
        const coins = [30, 20, 15, 10, 8, 5, 3, 2, 1, 0, 0, 0][randomIndex];
        
        const targetAngle = 360 - (randomIndex * 30) - 15;
        const spinDegrees = 5 * 360 + targetAngle;
        
        wheel.style.transition = 'transform 4s cubic-bezier(0.1, 0.3, 0.2, 1)';
        wheel.style.transform = `rotate(${spinDegrees}deg)`;
        
        setTimeout(() => {
            userBalance += coins;
            updateBalance();
            
            const segments = [
                { coins: 30, text: "ДЖЕКПОТ" },
                { coins: 20, text: "20 МОНЕТ" },
                { coins: 15, text: "15 МОНЕТ" },
                { coins: 10, text: "10 МОНЕТ" },
                { coins: 8, text: "8 МОНЕТ" },
                { coins: 5, text: "5 МОНЕТ" },
                { coins: 3, text: "3 МОНЕТЫ" },
                { coins: 2, text: "2 МОНЕТЫ" },
                { coins: 1, text: "1 МОНЕТА" },
                { coins: 0, text: "ПУСТО" },
                { coins: 0, text: "ПУСТО" },
                { coins: 0, text: "ПУСТО" }
            ];
            
            const wonSegment = segments[randomIndex];
            const message = coins > 0 ? 
                `🎉 Вы выиграли ${coins} монет! (${wonSegment.text})` : 
                `😔 ${wonSegment.text}. Попробуйте еще раз!`;
            
            resultDiv.innerHTML = `
                <div class="result-text">${message}</div>
                <div style="font-size: 14px; color: #666;">Баланс: ${userBalance} монет</div>
            `;
            
            resultDiv.className = 'result ' + (coins > 0 ? 'win-glow' : '');
            
            saveResult(`🎯 Рулетка: ${message}`);
            
            setTimeout(() => {
                spinBtn.classList.add('pulse');
                spinBtn.disabled = false;
                isSpinning = false;
            }, 2000);
            
        }, 4000);
    }, 50);
}

// Однорукий бандит
const slotSymbols = ['🍒', '🍋', '⭐', '🍉', '🔔', '💎'];
const slotPayouts = {
    '🍒🍒🍒': 50,
    '⭐⭐⭐': 100,
    '💎💎💎': 200,
    '🔔🔔🔔': 75
};

function spinSlots() {
    if (isSpinning || userBalance < 10) return;
    
    userBalance -= 10;
    updateBalance();
    isSpinning = true;
    
    const slots = [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')];
    const spinBtn = document.getElementById('spinSlotBtn');
    
    spinBtn.disabled = true;
    slots.forEach(slot => slot.classList.add('slot-spinning'));
    
    const spinDuration = 2000;
    const spinInterval = 100;
    
    let spins = 0;
    const maxSpins = spinDuration / spinInterval;
    
    const spinIntervalId = setInterval(() => {
        slots.forEach((slot, index) => {
            if (spins > maxSpins * (index + 1) / 3) return;
            slot.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        });
        
        spins++;
        if (spins >= maxSpins) {
            clearInterval(spinIntervalId);
            
            const finalResults = slots.map(() => slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
            slots.forEach((slot, i) => {
                slot.textContent = finalResults[i];
                slot.classList.remove('slot-spinning');
            });
            
            const resultStr = finalResults.join('');
            let winAmount = 0;
            let winMessage = "😔 Попробуйте еще раз!";
            
            if (slotPayouts[resultStr]) {
                winAmount = slotPayouts[resultStr];
                winMessage = `🎉 Выигрыш ${winAmount} монет!`;
            } else if (finalResults[0] === finalResults[1] || finalResults[1] === finalResults[2]) {
                winAmount = 15;
                winMessage = `👍 Две одинаковые! +15 монет`;
            }
            
            userBalance += winAmount;
            updateBalance();
            
            document.getElementById('result').innerHTML = `
                <div class="result-text">${winMessage}</div>
                <div style="font-size: 14px; color: #666;">Баланс: ${userBalance} монет</div>
            `;
            
            saveResult(`🎰 Слоты: ${winMessage}`);
            
            spinBtn.disabled = false;
            isSpinning = false;
        }
    }, spinInterval);
}

// Магазин
function selectShopItem(index) {
    document.querySelectorAll('.shop-item').forEach(item => item.classList.remove('selected'));
    document.querySelectorAll('.shop-item')[index].classList.add('selected');
    selectedShopItem = index;
}

function buyItem() {
    if (selectedShopItem === null) return;
    
    const prices = [50, 100, 200, 1000];
    const items = [
        "🎁 Промо на 6ч",
        "☕ Промо на 12ч", 
        "🚕 Промо на 24ч",
        "💵 Вывод денег"
    ];
    
    const price = prices[selectedShopItem];
    const item = items[selectedShopItem];
    
    if (userBalance >= price) {
        userBalance -= price;
        updateBalance();
        
        document.getElementById('result').innerHTML = `
            <div class="result-text">🎉 Поздравляем с покупкой!</div>
            <div style="font-size: 14px; color: #666;">Вы приобрели: ${item}</div>
        `;
        
        saveResult(`🛍️ Куплен: ${item}`);
        selectedShopItem = null;
        document.querySelectorAll('.shop-item').forEach(item => item.classList.remove('selected'));
    } else {
        document.getElementById('result').innerHTML = `
            <div class="result-text">❌ Недостаточно монет</div>
            <div style="font-size: 14px; color: #666;">Нужно: ${price} монет</div>
        `;
    }
}

// Админ панель
function showAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminPassword').focus();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function handleAdminKeypress(event) {
    if (event.key === 'Enter') {
        checkAdminPassword();
    }
}

function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === '1111') {
        userBalance += 1000;
        updateBalance();
        
        document.getElementById('result').innerHTML = `
            <div class="result-text">⚙️ Админ доступ разрешен!</div>
            <div style="font-size: 14px; color: #666;">+1000 монет! Баланс: ${userBalance} монет</div>
        `;
        
        saveResult('⚙️ Админ панель: доступ разрешен +1000 монет');
        closeAdminPanel();
    } else {
        alert('❌ Неверный пароль!');
        document.getElementById('adminPassword').value = '';
    }
}

// Переключение игр
function showGame(game) {
    currentGame = game;
    
    document.querySelectorAll('.game-area').forEach(area => {
        area.classList.remove('active');
    });
    
    document.getElementById(`${game}-game`).classList.add('active');
    
    document.querySelectorAll('.game-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (game === 'roulette') {
        createRouletteWheel();
    } else if (game === 'minesweeper') {
        initMinesweeper();
    } else if (game === 'match3') {
        initMatch3();
    }
}

function saveResult(text) {
    const resultData = {
        text: text,
        balance: userBalance,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    resultsHistory.unshift(resultData);
    if (resultsHistory.length > 20) resultsHistory = resultsHistory.slice(0, 20);
    saveUserData();
}

function displayHistory() {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '';
    
    if (resultsHistory.length === 0) {
        historyDiv.innerHTML = '<div style="text-align: center; color: #666;">История пуста</div>';
        return;
    }
    
    resultsHistory.forEach((item) => {
        const historyItem = document.createElement('div');
        historyItem.style.padding = '10px';
        historyItem.style.borderBottom = '1px solid #eee';
        historyItem.style.textAlign = 'center';
        historyItem.innerHTML = `
            <div>${item.text}</div>
            <small style="color: #666;">${item.timestamp}</small>
        `;
        historyDiv.appendChild(historyItem);
    });
}

function toggleHistory() {
    const historyDiv = document.getElementById('history');
    if (historyDiv.style.display === 'block') {
        historyDiv.style.display = 'none';
    } else {
        displayHistory();
        historyDiv.style.display = 'block';
    }
}

// Плавающие элементы
function createFloatingElements() {
    const container = document.getElementById('floatingElements');
    const elements = ['🚗', '🚕', '🚙', '💎', '⭐', '🎰'];
    
    for (let i = 0; i < 15; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.textContent = elements[Math.floor(Math.random() * elements.length)];
        element.style.left = Math.random() * 100 + 'vw';
        element.style.animationDelay = Math.random() * 20 + 's';
        element.style.fontSize = (Math.random() * 20 + 16) + 'px';
        container.appendChild(element);
    }
}

// ==================== САПЁР ====================

let minesweeperBoard = [];
let minesweeperGameOver = false;

function initMinesweeper() {
    const board = document.getElementById('minesweeperBoard');
    const resultDiv = document.getElementById('minesweeperResult');
    board.innerHTML = '';
    minesweeperGameOver = false;
    
    resultDiv.innerHTML = '<div class="result-text">Найдите все безопасные клетки!</div>';
    
    // Создаем поле 8x8 с 10 минами
    minesweeperBoard = Array(8).fill().map(() => Array(8).fill(0));
    
    // Расставляем мины
    let minesPlaced = 0;
    while (minesPlaced < 10) {
        const x = Math.floor(Math.random() * 8);
        const y = Math.floor(Math.random() * 8);
        if (minesweeperBoard[y][x] !== 'X') {
            minesweeperBoard[y][x] = 'X';
            minesPlaced++;
        }
    }
    
    // Создаем клетки
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.className = 'minesweeper-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', () => revealMinesweeperCell(x, y));
            board.appendChild(cell);
        }
    }
}

function revealMinesweeperCell(x, y) {
    if (minesweeperGameOver) return;
    
    const cell = document.querySelector(`.minesweeper-cell[data-x="${x}"][data-y="${y}"]`);
    if (cell.classList.contains('revealed')) return;
    
    cell.classList.add('revealed');
    
    if (minesweeperBoard[y][x] === 'X') {
        // Игрок наступил на мину
        cell.classList.add('mine');
        cell.textContent = '💣';
        minesweeperGameOver = true;
        
        document.getElementById('minesweeperResult').innerHTML = `
            <div class="result-text">💥 Вы проиграли! Мина взорвалась</div>
            <div style="font-size: 14px; color: #666;">Начните новую игру</div>
        `;
        
        // Показываем все мины
        document.querySelectorAll('.minesweeper-cell').forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            if (minesweeperBoard[y][x] === 'X') {
                cell.classList.add('mine');
                cell.textContent = '💣';
            }
        });
    } else {
        // Подсчитываем мины вокруг
        let mineCount = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const newX = x + dx;
                const newY = y + dy;
                if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                    if (minesweeperBoard[newY][newX] === 'X') {
                        mineCount++;
                    }
                }
            }
        }
        
        if (mineCount > 0) {
            cell.textContent = mineCount;
            // Разные цвета для разных чисел
            const colors = ['', 'blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];
            cell.style.color = colors[mineCount];
        }
        
        // Если нет мин вокруг, открываем соседние клетки
        if (mineCount === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const newX = x + dx;
                    const newY = y + dy;
                    if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                        if (!document.querySelector(`.minesweeper-cell[data-x="${newX}"][data-y="${newY}"]`).classList.contains('revealed')) {
                            revealMinesweeperCell(newX, newY);
                        }
                    }
                }
            }
        }
        
        // Проверяем победу
        checkMinesweeperWin();
    }
}

function checkMinesweeperWin() {
    let unrevealedSafeCells = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.querySelector(`.minesweeper-cell[data-x="${x}"][data-y="${y}"]`);
            if (!cell.classList.contains('revealed') && minesweeperBoard[y][x] !== 'X') {
                unrevealedSafeCells++;
            }
        }
    }
    
    if (unrevealedSafeCells === 0) {
        // Победа!
        minesweeperGameOver = true;
        const winAmount = 30;
        userBalance += winAmount;
        updateBalance();
        
        document.getElementById('minesweeperResult').innerHTML = `
            <div class="result-text">🎉 Победа! Вы нашли все мины!</div>
            <div style="font-size: 14px; color: #666;">+${winAmount} монет! Баланс: ${userBalance} монет</div>
        `;
        
        saveResult(`💣 Сапёр: Победа! +${winAmount} монет`);
    }
}

// ==================== ТРИ В РЯД ====================

let match3Board = [];
let selectedMatch3Cell = null;
const match3Symbols = ['🍒', '🍋', '🍉', '⭐', '🔔', '💎'];

function initMatch3() {
    const board = document.getElementById('match3Board');
    const resultDiv = document.getElementById('match3Result');
    board.innerHTML = '';
    selectedMatch3Cell = null;
    
    resultDiv.innerHTML = '<div class="result-text">Выберите два элемента для обмена</div>';
    
    // Создаем поле 8x8
    match3Board = Array(8).fill().map(() => Array(8).fill(''));
    
    // Заполняем случайными символами
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            match3Board[y][x] = match3Symbols[Math.floor(Math.random() * match3Symbols.length)];
        }
    }
    
    // Создаем клетки
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.className = 'match3-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.textContent = match3Board[y][x];
            cell.addEventListener('click', () => selectMatch3Cell(x, y));
            board.appendChild(cell);
        }
    }
}

function selectMatch3Cell(x, y) {
    const cell = document.querySelector(`.match3-cell[data-x="${x}"][data-y="${y}"]`);
    
    if (selectedMatch3Cell === null) {
        // Первое нажатие - выбираем клетку
        selectedMatch3Cell = { x, y };
        cell.classList.add('selected');
        document.getElementById('match3Result').innerHTML = `
            <div class="result-text">Теперь выберите соседнюю клетку для обмена</div>
        `;
    } else {
        // Второе нажатие - проверяем можно ли обменять
        const dx = Math.abs(x - selectedMatch3Cell.x);
        const dy = Math.abs(y - selectedMatch3Cell.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Соседние клетки - производим обмен
            swapMatch3Cells(selectedMatch3Cell.x, selectedMatch3Cell.y, x, y);
        } else {
            document.getElementById('match3Result').innerHTML = `
                <div class="result-text">Можно обменивать только соседние клетки</div>
            `;
        }
        
        // Сбрасываем выбор
        document.querySelectorAll('.match3-cell').forEach(c => c.classList.remove('selected'));
        selectedMatch3Cell = null;
    }
}

function swapMatch3Cells(x1, y1, x2, y2) {
    // Меняем местами
    const temp = match3Board[y1][x1];
    match3Board[y1][x1] = match3Board[y2][x2];
    match3Board[y2][x2] = temp;
    
    // Обновляем отображение
    document.querySelector(`.match3-cell[data-x="${x1}"][data-y="${y1}"]`).textContent = match3Board[y1][x1];
    document.querySelector(`.match3-cell[data-x="${x2}"][data-y="${y2}"]`).textContent = match3Board[y2][x2];
    
    // Проверяем комбинации
    checkMatch3Combinations();
}

function checkMatch3Combinations() {
    let combinationsFound = 0;
    let totalScore = 0;
    
    // Проверяем горизонтальные комбинации
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 6; x++) {
            if (match3Board[y][x] !== '' && 
                match3Board[y][x] === match3Board[y][x+1] && 
                match3Board[y][x] === match3Board[y][x+2]) {
                
                combinationsFound++;
                totalScore += 10;
                
                // Удаляем комбинацию
                for (let i = 0; i < 3; i++) {
                    match3Board[y][x+i] = '';
                    document.querySelector(`.match3-cell[data-x="${x+i}"][data-y="${y}"]`).textContent = '';
                }
            }
        }
    }
    
    // Проверяем вертикальные комбинации
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 6; y++) {
            if (match3Board[y][x] !== '' && 
                match3Board[y][x] === match3Board[y+1][x] && 
                match3Board[y][x] === match3Board[y+2][x]) {
                
                combinationsFound++;
                totalScore += 10;
                
                // Удаляем комбинацию
                for (let i = 0; i < 3; i++) {
                    match3Board[y+i][x] = '';
                    document.querySelector(`.match3-cell[data-x="${x}"][data-y="${y+i}"]`).textContent = '';
                }
            }
        }
    }
    
    if (combinationsFound > 0) {
        userBalance += totalScore;
        updateBalance();
        
        document.getElementById('match3Result').innerHTML = `
            <div class="result-text">🎉 Найдено ${combinationsFound} комбинаций!</div>
            <div style="font-size: 14px; color: #666;">+${totalScore} монет! Баланс: ${userBalance} монет</div>
        `;
        
        saveResult(`🧩 Три в ряд: ${combinationsFound} комбинаций! +${totalScore} монет`);
        
        // Заполняем пустые клетки
        setTimeout(fillMatch3EmptyCells, 500);
    }
}

function fillMatch3EmptyCells() {
    for (let x = 0; x < 8; x++) {
        for (let y = 7; y >= 0; y--) {
            if (match3Board[y][x] === '') {
                // Сдвигаем элементы вниз
                for (let ny = y; ny > 0; ny--) {
                    match3Board[ny][x] = match3Board[ny-1][x];
                }
                // Новый элемент сверху
                match3Board[0][x] = match3Symbols[Math.floor(Math.random() * match3Symbols.length)];
            }
        }
    }
    
    // Обновляем отображение
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            document.querySelector(`.match3-cell[data-x="${x}"][data-y="${y}"]`).textContent = match3Board[y][x];
        }
    }
    
    // Снова проверяем комбинации
    setTimeout(checkMatch3Combinations, 300);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createFloatingElements();
    createRouletteWheel();
    initUserData();
});
