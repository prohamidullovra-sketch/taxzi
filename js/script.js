// Система монет с локальным сохранением
let userBalance = 100;
let selectedShopItem = null;
let currentGame = 'roulette';
let isSpinning = false;
let resultsHistory = [];
let isStyleEditing = false;
let selectedElement = null;

// Фикс для ошибки на строке 420
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleImageFiles(e.target.files);
        });
    }
});
// Фикс ошибок
function showComingSoon() { return false; }
// Инициализация данных пользователя
function initUserData() {
    const userData = JSON.parse(localStorage.getItem('taxiUserData')) || {};
    userBalance = userData.balance || 100;
    resultsHistory = userData.history || [];
    updateBalance();
    
    // Загрузка сохраненных изображений
    const savedImages = JSON.parse(localStorage.getItem('savedImages')) || [];
    savedImages.forEach(imgData => {
        createDraggableImage(imgData.src, imgData);
    });
    
    // Загрузка сохраненных стилей
    const savedStyles = localStorage.getItem('customStyles');
    if (savedStyles) {
        applyCustomCSS(savedStyles);
    }
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
    const wheelElement = document.getElementById('wheel'); // ← переименовал переменную
    
    spinBtn.disabled = true;
    spinBtn.classList.remove('pulse');
    
    wheelElement.style.transition = 'none';
    wheelElement.style.transform = 'rotate(0deg)';
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * 12);
        const coins = [30, 20, 15, 10, 8, 5, 3, 2, 1, 0, 0, 0][randomIndex];
        
        const targetAngle = 360 - (randomIndex * 30) - 15;
        const spinDegrees = 5 * 360 + targetAngle;
        
        wheelElement.style.transition = 'transform 4s cubic-bezier(0.1, 0.3, 0.2, 1)';
        wheelElement.style.transform = `rotate(${spinDegrees}deg)`;    
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
    // Сбрасываем пароль при открытии
    document.getElementById('adminPassword').value = '';
    document.getElementById('moneyFunctions').style.display = 'none';
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    disableStyleEditing();
}

function handleAdminKeypress(event) {
    if (event.key === 'Enter') {
        checkAdminPassword();
    }
}

function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    // Пароль скрыт в коде для безопасности
    const correctPassword = '1111'; // В реальном проекте храните это на сервере
    
    if (password === correctPassword) {
        userBalance += 1000;
        updateBalance();
        
        document.getElementById('moneyFunctions').style.display = 'block';
        
        alert('✅ Админ доступ открыт! +1000 монет');
        saveResult('⚙️ Админ: вход +1000 монет');
    } else {
        alert('❌ Неверный пароль!');
        document.getElementById('adminPassword').value = '';
    }
}

// Функции монет
function addCoins(amount) {
    userBalance += amount;
    updateBalance();
    alert(`✅ +${amount} монет! Баланс: ${userBalance}`);
    saveResult(`⚙️ Админ: +${amount} монет`);
}

function addCustomCoins() {
    const amount = parseInt(document.getElementById('customCoins').value);
    if (amount > 0) {
        addCoins(amount);
        document.getElementById('customCoins').value = '';
    } else {
        alert('Введите число больше 0!');
    }
}

// Табы
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Дизайн
function applyColors() {
    const primary = document.getElementById('primaryColor').value;
    const bg = document.getElementById('bgColor').value;
    const accent = document.getElementById('accentColor').value;
    
    document.body.style.background = `linear-gradient(135deg, ${primary} 0%, ${bg} 100%)`;
    
    document.querySelectorAll('.spin-btn').forEach(btn => {
        btn.style.background = `linear-gradient(45deg, ${accent}, #ee5a24)`;
    });
    
    // Сохраняем цвета
    const colors = { primary, bg, accent };
    localStorage.setItem('customColors', JSON.stringify(colors));
    
    alert('🎨 Цвета применены и сохранены!');
}

function resetDesign() {
    document.body.style.background = '';
    document.querySelectorAll('.spin-btn').forEach(btn => {
        btn.style.background = '';
    });
    localStorage.removeItem('customColors');
    alert('🎨 Дизайн сброшен!');
}

// Изображения
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    handleImageFiles(files);
}

document.getElementById('fileInput').addEventListener('change', function(e) {
    handleImageFiles(e.target.files);
});

function handleImageFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                createDraggableImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

function addImageFromUrl() {
    const url = document.getElementById('imageUrl').value;
    if (url) {
        createDraggableImage(url);
        document.getElementById('imageUrl').value = '';
    }
}

function createDraggableImage(src, savedData = null) {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'draggable-image';
    
    if (savedData) {
        img.style.left = savedData.left || '100px';
        img.style.top = savedData.top || '100px';
        img.style.width = savedData.width || '150px';
        img.style.height = savedData.height || 'auto';
        img.style.transform = savedData.transform || '';
    } else {
        img.style.left = '100px';
        img.style.top = '100px';
        img.style.width = '150px';
    }
    
    makeImageDraggableAndResizable(img);
    document.body.appendChild(img);
    saveImageStructure();
}

function makeImageDraggableAndResizable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isResizing = false;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        if (e.target !== element) return;
        
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Проверяем, кликнули ли на угол для изменения размера
        const rect = element.getBoundingClientRect();
        const cornerSize = 20;
        
        if (e.clientX > rect.right - cornerSize && e.clientY > rect.bottom - cornerSize) {
            isResizing = true;
        } else {
            isResizing = false;
        }
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        
        if (isResizing) {
            // Изменение размера
            const newWidth = e.clientX - element.offsetLeft;
            const newHeight = e.clientY - element.offsetTop;
            
            if (newWidth > 50 && newHeight > 50) {
                element.style.width = newWidth + 'px';
                element.style.height = newHeight + 'px';
            }
        } else {
            // Перетаскивание
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        saveImageStructure();
    }
}

function saveImageStructure() {
    const images = document.querySelectorAll('.draggable-image');
    const imageData = Array.from(images).map(img => ({
        src: img.src,
        left: img.style.left,
        top: img.style.top,
        width: img.style.width,
        height: img.style.height,
        transform: img.style.transform
    }));
    
    localStorage.setItem('savedImages', JSON.stringify(imageData));
    alert('💾 Структура изображений сохранена!');
}

function loadImageStructure() {
    const savedImages = JSON.parse(localStorage.getItem('savedImages')) || [];
    
    // Удаляем текущие изображения
    document.querySelectorAll('.draggable-image').forEach(img => img.remove());
    
    // Создаем сохраненные изображения
    savedImages.forEach(imgData => {
        createDraggableImage(imgData.src, imgData);
    });
    
    alert('📂 Структура изображений загружена!');
}

// Стили
function exportStyles() {
    const styles = {
        customCSS: localStorage.getItem('customStyles') || '',
        colors: JSON.parse(localStorage.getItem('customColors')) || {}
    };
    
    const dataStr = JSON.stringify(styles, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'taxi-casino-styles.json';
    link.href = url;
    link.click();
    
    alert('📥 Стили экспортированы!');
}

function importStyles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const styles = JSON.parse(e.target.result);
                
                if (styles.customCSS) {
                    localStorage.setItem('customStyles', styles.customCSS);
                    applyCustomCSS(styles.customCSS);
                }
                
                if (styles.colors) {
                    localStorage.setItem('customColors', JSON.stringify(styles.colors));
                    applyColorsFromStorage();
                }
                
                alert('📤 Стили импортированы и применены!');
            } catch (error) {
                alert('❌ Ошибка при импорте стилей!');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function applyCustomCSS(css) {
    let styleElement = document.getElementById('custom-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-styles';
        document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
}

function applyColorsFromStorage() {
    const colors = JSON.parse(localStorage.getItem('customColors'));
    if (colors) {
        document.getElementById('primaryColor').value = colors.primary;
        document.getElementById('bgColor').value = colors.bg;
        document.getElementById('accentColor').value = colors.accent;
        applyColors();
    }
}

function enableStyleEditing() {
    isStyleEditing = !isStyleEditing;
    
    if (isStyleEditing) {
        document.querySelectorAll('.game-btn, .balance-container, .shop, .result, .spin-btn').forEach(el => {
            el.classList.add('editable-element');
            el.addEventListener('click', handleElementClick);
        });
        
        document.getElementById('styleEditor').style.display = 'block';
        document.getElementById('cssEditor').value = localStorage.getItem('customStyles') || '';
        
        alert('✏️ Режим редактирования включен! Кликайте на элементы для изменения.');
    } else {
        disableStyleEditing();
    }
}

function disableStyleEditing() {
    isStyleEditing = false;
    document.querySelectorAll('.editable-element').forEach(el => {
        el.classList.remove('editable-element', 'editing');
        el.removeEventListener('click', handleElementClick);
    });
    document.getElementById('styleEditor').style.display = 'none';
}

function handleElementClick(event) {
    if (!isStyleEditing) return;
    
    event.stopPropagation();
    selectedElement = event.currentTarget;
    
    // Убираем выделение с других элементов
    document.querySelectorAll('.editable-element').forEach(el => {
        el.classList.remove('editing');
    });
    
    // Выделяем текущий элемент
    selectedElement.classList.add('editing');
    
    // Показываем контекстное меню
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
}

function editElementStyle() {
    if (!selectedElement) return;
    
    const currentStyle = window.getComputedStyle(selectedElement);
    const cssText = `
/* Стили для ${selectedElement.className} */
.${selectedElement.className.split(' ')[0]} {
    background: ${currentStyle.background};
    color: ${currentStyle.color};
    border: ${currentStyle.border};
    /* Добавьте другие свойства по необходимости */
}
    `.trim();
    
    document.getElementById('cssEditor').value = cssText;
    hideContextMenu();
}

function deleteElement() {
    if (selectedElement && confirm('Удалить этот элемент?')) {
        selectedElement.remove();
        hideContextMenu();
    }
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
    if (selectedElement) {
        selectedElement.classList.remove('editing');
        selectedElement = null;
    }
}

function applyCustomStyles() {
    const css = document.getElementById('cssEditor').value;
    localStorage.setItem('customStyles', css);
    applyCustomCSS(css);
    alert('✅ Пользовательские стили применены и сохранены!');
}

// Игры
function showGame(game) {
    currentGame = game;
    
    // Скрываем все игровые области
    const areas = document.querySelectorAll('.game-area');
    if (areas) {
        areas.forEach(area => area.classList.remove('active'));
    }
    
    // Показываем выбранную игру
    const gameElement = document.getElementById(`${game}-game`);
    if (gameElement) {
        gameElement.classList.add('active');
    }
    
    // Обновляем активные кнопки
    const buttons = document.querySelectorAll('.game-btn');
    if (buttons) {
        buttons.forEach(btn => btn.classList.remove('active'));
        if (event && event.target) {
            event.target.classList.add('active');
        }
    }
    
    // Инициализация игр
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

// ==================== САПЁР ====================

let minesweeperBoard = [];
let minesweeperGameOver = false;

function initMinesweeper() {
    const board = document.getElementById('minesweeperBoard');
    const resultDiv = document.getElementById('minesweeperResult');
    board.innerHTML = '';
    minesweeperGameOver = false;
    
    resultDiv.innerHTML = '<div class="result-text">Найдите все безопасные клетки!</div>';
    
    minesweeperBoard = Array(8).fill().map(() => Array(8).fill(0));
    
    let minesPlaced = 0;
    while (minesPlaced < 10) {
        const x = Math.floor(Math.random() * 8);
        const y = Math.floor(Math.random() * 8);
        if (minesweeperBoard[y][x] !== 'X') {
            minesweeperBoard[y][x] = 'X';
            minesPlaced++;
        }
    }
    
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
        cell.classList.add('mine');
        cell.textContent = '💣';
        minesweeperGameOver = true;
        
        document.getElementById('minesweeperResult').innerHTML = `
            <div class="result-text">💥 Вы проиграли! Мина взорвалась</div>
            <div style="font-size: 14px; color: #666;">Начните новую игру</div>
        `;
        
        document.querySelectorAll('.minesweeper-cell').forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            if (minesweeperBoard[y][x] === 'X') {
                cell.classList.add('mine');
                cell.textContent = '💣';
            }
        });
    } else {
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
            const colors = ['', 'blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];
            cell.style.color = colors[mineCount];
        }
        
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
    
    match3Board = Array(8).fill().map(() => Array(8).fill(''));
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            match3Board[y][x] = match3Symbols[Math.floor(Math.random() * match3Symbols.length)];
        }
    }
    
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
        selectedMatch3Cell = { x, y };
        cell.classList.add('selected');
        document.getElementById('match3Result').innerHTML = `
            <div class="result-text">Теперь выберите соседнюю клетку для обмена</div>
        `;
    } else {
        const dx = Math.abs(x - selectedMatch3Cell.x);
        const dy = Math.abs(y - selectedMatch3Cell.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            swapMatch3Cells(selectedMatch3Cell.x, selectedMatch3Cell.y, x, y);
        } else {
            document.getElementById('match3Result').innerHTML = `
                <div class="result-text">Можно обменивать только соседние клетки</div>
            `;
        }
        
        document.querySelectorAll('.match3-cell').forEach(c => c.classList.remove('selected'));
        selectedMatch3Cell = null;
    }
}

function swapMatch3Cells(x1, y1, x2, y2) {
    const temp = match3Board[y1][x1];
    match3Board[y1][x1] = match3Board[y2][x2];
    match3Board[y2][x2] = temp;
    
    document.querySelector(`.match3-cell[data-x="${x1}"][data-y="${y1}"]`).textContent = match3Board[y1][x1];
    document.querySelector(`.match3-cell[data-x="${x2}"][data-y="${y2}"]`).textContent = match3Board[y2][x2];
    
    checkMatch3Combinations();
}

function checkMatch3Combinations() {
    let combinationsFound = 0;
    let totalScore = 0;
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 6; x++) {
            if (match3Board[y][x] !== '' && 
                match3Board[y][x] === match3Board[y][x+1] && 
                match3Board[y][x] === match3Board[y][x+2]) {
                
                combinationsFound++;
                totalScore += 10;
                
                for (let i = 0; i < 3; i++) {
                    match3Board[y][x+i] = '';
                    document.querySelector(`.match3-cell[data-x="${x+i}"][data-y="${y}"]`).textContent = '';
                }
            }
        }
    }
    
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 6; y++) {
            if (match3Board[y][x] !== '' && 
                match3Board[y][x] === match3Board[y+1][x] && 
                match3Board[y][x] === match3Board[y+2][x]) {
                
                combinationsFound++;
                totalScore += 10;
                
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
        
        setTimeout(fillMatch3EmptyCells, 500);
    }
}

function fillMatch3EmptyCells() {
    for (let x = 0; x < 8; x++) {
        for (let y = 7; y >= 0; y--) {
            if (match3Board[y][x] === '') {
                for (let ny = y; ny > 0; ny--) {
                    match3Board[ny][x] = match3Board[ny-1][x];
                }
                match3Board[0][x] = match3Symbols[Math.floor(Math.random() * match3Symbols.length)];
            }
        }
    }
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            document.querySelector(`.match3-cell[data-x="${x}"][data-y="${y}"]`).textContent = match3Board[y][x];
        }
    }
    
    setTimeout(checkMatch3Combinations, 300);
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

// Закрытие контекстного меню при клике вне его
document.addEventListener('click', function(e) {
    if (!e.target.closest('#contextMenu') && !e.target.closest('.editable-element')) {
        hideContextMenu();
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createFloatingElements();
    createRouletteWheel();
    initUserData();
    
    // Загружаем сохраненные цвета
    applyColorsFromStorage();
});
