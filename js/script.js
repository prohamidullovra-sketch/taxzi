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
    selectedShopItem = null;
    
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

// Создание рулетки с SVG (исправленная версия)
function createRouletteWheel() {
    const svg = document.getElementById('rouletteSvg');
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
        
        // Создаем сегмент
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
        
        // Добавляем текст (укороченные названия)
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
    
    // Центральный круг
    const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    centerCircle.setAttribute("cx", centerX);
    centerCircle.setAttribute("cy", centerY);
    centerCircle.setAttribute("r", "40");
    centerCircle.setAttribute("fill", "#2d3436");
    centerCircle.setAttribute("stroke", "white");
    centerCircle.setAttribute("stroke-width", "3");
    svg.appendChild(centerCircle);
    
    // Текст TAXI в центре
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
    
    // Сбрасываем трансформацию
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * 12);
        const coins = [30, 20, 15, 10, 8, 5, 3, 2, 1, 0, 0, 0][randomIndex];
        
        // Рассчитываем угол так, чтобы указатель указывал на выигравший сегмент
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
            
            // Финальные результаты
            const finalResults = slots.map(() => slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
            slots.forEach((slot, i) => {
                slot.textContent = finalResults[i];
                slot.classList.remove('slot-spinning');
            });
            
            // Проверка выигрыша
            const resultStr = finalResults.join('');
            let winAmount = 0;
            let winMessage = "😔 Попробуйте еще раз!";
            
            if (slotPayouts[resultStr]) {
                winAmount = slotPayouts[resultStr