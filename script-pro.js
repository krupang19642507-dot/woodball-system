/**
 * WOODBALL MANAGEMENT SYSTEM v2.0 PRO
 * Professional Mobile-Optimized JavaScript Engine
 * Compatible with iOS Safari, Android Chrome, and all mobile browsers
 */

const APP_VERSION = "2.0.0";
const STORAGE_KEY = "woodball_pro_data_v2";
const MAX_PLAYERS = 12;
const MIN_PLAYERS = 2;
const TOTAL_GATES = 12;

let appState = {
    developer: null,
    event: null,
    players: [],
    scores: [],
    results: [],
    lastUpdated: null
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('scroll', handleScrollButton);
window.addEventListener('resize', handleResize);

function initializeApp() {
    try {
        loadAppState();
        updateStatistics();
        generatePlayerInputs();
        setupEventListeners();
        updateWhatsAppButton();
        
        // Add service worker for offline support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }
        
        console.log('✓ Woodball System Initialized v' + APP_VERSION);
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('registerMessage', '❌ เกิดข้อผิดพลาดในการเริ่มต้น', 'error');
    }
}

// ==================== STATE MANAGEMENT ====================
function saveAppState() {
    try {
        const dataToSave = {
            developer: appState.developer,
            event: appState.event,
            players: appState.players,
            scores: appState.scores,
            results: appState.results,
            lastUpdated: new Date().toISOString(),
            version: APP_VERSION
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        return true;
    } catch (error) {
        console.error('Save state error:', error);
        return false;
    }
}

function loadAppState() {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) return;
        
        const data = JSON.parse(rawData);
        appState = {
            developer: data.developer || null,
            event: data.event || null,
            players: Array.isArray(data.players) ? data.players : [],
            scores: Array.isArray(data.scores) ? data.scores : [],
            results: Array.isArray(data.results) ? data.results : [],
            lastUpdated: data.lastUpdated || null
        };
    } catch (error) {
        console.error('Load state error:', error);
    }
}

function clearAppState() {
    if (!confirm('⚠️ คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้')) {
        return false;
    }
    
    try {
        localStorage.removeItem(STORAGE_KEY);
        appState = {
            developer: null,
            event: null,
            players: [],
            scores: [],
            results: [],
            lastUpdated: null
        };
        showMessage('dataMessage', '✓ ลบข้อมูลทั้งหมดเรียบร้อยแล้ว', 'success');
        setTimeout(() => goToPage('menuPage'), 1000);
        return true;
    } catch (error) {
        console.error('Clear state error:', error);
        showMessage('dataMessage', '❌ ไม่สามารถลบข้อมูลได้', 'error');
        return false;
    }
}

// ==================== NAVIGATION ====================
function goToPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Trigger specific initialization based on page
        if (pageId === 'resultsPage') {
            sortAndDisplayResults();
        }
    }
}

// ==================== MESSAGE HANDLING ====================
function showMessage(elementId, text, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = text;
    element.className = `message show ${type}`;
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('show');
    }
}

// ==================== REGISTRATION ====================
document.getElementById('registerForm')?.addEventListener('submit', handleRegistration);

function handleRegistration(e) {
    e.preventDefault();
    
    const devName = document.getElementById('devName')?.value.trim();
    const devPhone = document.getElementById('devPhone')?.value.trim();
    const devEmail = document.getElementById('devEmail')?.value.trim();
    const eventName = document.getElementById('eventName')?.value.trim();
    const eventVenue = document.getElementById('eventVenue')?.value.trim();
    const eventDate = document.getElementById('eventDate')?.value;
    const eventCategory = document.getElementById('eventCategory')?.value;
    
    // Validation
    if (!devName || !devPhone || !eventName || !eventVenue || !eventDate) {
        showMessage('registerMessage', '❌ กรุณากรอกข้อมูลที่จำเป็นให้ครบทุกช่อง', 'error');
        return;
    }
    
    // Phone number validation
    const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
    const cleanPhone = devPhone.replace(/[-\s]/g, '');
    if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 10) {
        showMessage('registerMessage', '❌ กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (10 หลักขึ้นไป)', 'error');
        return;
    }
    
    // Email validation if provided
    if (devEmail && !validateEmail(devEmail)) {
        showMessage('registerMessage', '❌ กรุณากรอกอีเมลให้ถูกต้อง', 'error');
        return;
    }
    
    // Save to state
    appState.developer = {
        name: devName,
        phone: cleanPhone,
        email: devEmail || null,
        registeredAt: new Date().toISOString()
    };
    
    appState.event = {
        name: eventName,
        venue: eventVenue,
        date: eventDate,
        category: eventCategory || 'ทั่วไป'
    };
    
    saveAppState();
    showMessage('registerMessage', '✓ บันทึกข้อมูลลงทะเบียนเรียบร้อยแล้ว', 'success');
    
    setTimeout(() => {
        document.getElementById('registerForm').reset();
        goToPage('scoreCardPage');
    }, 1500);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== SCORE CARD ====================
function increasePlayerCount() {
    const input = document.getElementById('playerCount');
    if (input && Number(input.value) < MAX_PLAYERS) {
        input.value = Number(input.value) + 1;
        generatePlayerInputs();
    }
}

function decreasePlayerCount() {
    const input = document.getElementById('playerCount');
    if (input && Number(input.value) > MIN_PLAYERS) {
        input.value = Number(input.value) - 1;
        generatePlayerInputs();
    }
}

function generatePlayerInputs() {
    const playerCount = Math.min(Math.max(Number(document.getElementById('playerCount')?.value || 4), MIN_PLAYERS), MAX_PLAYERS);
    const container = document.getElementById('playerNamesContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 1; i <= playerCount; i++) {
        const div = document.createElement('div');
        div.className = 'player-input-group';
        div.innerHTML = `
            <label for="playerName${i}">👤 ผู้เล่นคนที่ ${i}</label>
            <input 
                type="text" 
                id="playerName${i}" 
                class="player-input"
                placeholder="กรอกชื่อผู้เล่น" 
                autocomplete="name"
                required
            />
        `;
        container.appendChild(div);
    }
    
    generateScoreTable(playerCount);
}

function generateScoreTable(playerCount) {
    const tableBody = document.getElementById('scoreTableBody');
    const headerContainer = document.getElementById('playerColsHeader');
    
    if (!tableBody || !headerContainer) return;
    
    // Generate header
    let headers = '';
    for (let i = 1; i <= playerCount; i++) {
        headers += `<th>Player ${i}</th>`;
    }
    headerContainer.innerHTML = headers;
    
    // Clear body
    tableBody.innerHTML = '';
    
    // Gate data
    const gates = [
        { gate: 1, par: 4, distance: 46 },
        { gate: 2, par: 5, distance: 85 },
        { gate: 3, par: 3, distance: 53 },
        { gate: 4, par: 4, distance: 70 },
        { gate: 5, par: 3, distance: 43 },
        { gate: 6, par: 4, distance: 58 },
        { gate: 7, par: 4, distance: 73 },
        { gate: 8, par: 4, distance: 55 },
        { gate: 9, par: 5, distance: 93 },
        { gate: 10, par: 4, distance: 46 },
        { gate: 11, par: 4, distance: 53 },
        { gate: 12, par: 4, distance: 62 }
    ];
    
    // Generate rows
    gates.forEach(g => {
        const row = document.createElement('tr');
        let cells = `
            <td class="col-gate"><strong>${g.gate}</strong></td>
            <td class="col-par">${g.par}</td>
            <td class="col-distance">${g.distance}</td>
        `;
        
        for (let i = 1; i <= playerCount; i++) {
            cells += `
                <td>
                    <input 
                        type="number" 
                        min="0" 
                        max="99"
                        value="0" 
                        data-player="${i}" 
                        data-gate="${g.gate}"
                        class="score-input"
                    />
                </td>
            `;
        }
        
        row.innerHTML = cells;
        tableBody.appendChild(row);
    });
    
    // Total row
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.style.backgroundColor = '#e8f5e9';
    let totalCells = `
        <td colspan="3"><strong>📊 คะแนนรวม</strong></td>
    `;
    
    for (let i = 1; i <= playerCount; i++) {
        totalCells += `
            <td class="total-cell" data-total-player="${i}">
                <strong>0</strong>
            </td>
        `;
    }
    
    totalRow.innerHTML = totalCells;
    tableBody.appendChild(totalRow);
    
    // Add event listeners
    addScoreInputListeners();
}

function addScoreInputListeners() {
    const inputs = document.querySelectorAll('.score-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateTotals);
        input.addEventListener('change', updateTotals);
    });
}

function updateTotals() {
    const playerCount = Number(document.getElementById('playerCount')?.value || 4);
    
    for (let player = 1; player <= playerCount; player++) {
        const inputs = document.querySelectorAll(`input[data-player="${player}"][data-gate]`);
        let total = 0;
        
        inputs.forEach(input => {
            total += Number(input.value) || 0;
        });
        
        const totalCell = document.querySelector(`[data-total-player="${player}"]`);
        if (totalCell) {
            totalCell.textContent = total;
        }
    }
}

function calculateAllTotals() {
    updateTotals();
    showMessage('scoreMessage', '✓ คำนวณคะแนนเรียบร้อยแล้ว', 'success');
}

function submitScoreCard() {
    const playerCount = Number(document.getElementById('playerCount')?.value || 4);
    const players = [];
    
    // Collect player names
    for (let i = 1; i <= playerCount; i++) {
        const nameInput = document.getElementById(`playerName${i}`);
        const name = nameInput?.value.trim();
        
        if (!name) {
            showMessage('scoreMessage', `❌ กรุณากรอกชื่อผู้เล่นคนที่ ${i}`, 'error');
            return;
        }
        players.push(name);
    }
    
    // Collect scores
    const scores = [];
    const inputs = document.querySelectorAll('input[data-player][data-gate]');
    const scoresByPlayer = {};
    
    players.forEach((_, idx) => {
        scoresByPlayer[idx + 1] = 0;
    });
    
    inputs.forEach(input => {
        const player = Number(input.dataset.player);
        const value = Number(input.value) || 0;
        scoresByPlayer[player] += value;
    });
    
    players.forEach((name, idx) => {
        scores.push({
            name,
            total: scoresByPlayer[idx + 1]
        });
    });
    
    // Save
    appState.players = players;
    appState.scores = scores;
    saveAppState();
    
    showMessage('scoreMessage', '✓ บันทึกคะแนนเรียบร้อยแล้ว', 'success');
    
    setTimeout(() => {
        sortAndDisplayResults();
        goToPage('resultsPage');
    }, 1000);
}

// ==================== RESULTS ====================
function sortAndDisplayResults() {
    const tableBody = document.getElementById('resultsTableBody');
    const eventInfo = document.getElementById('eventInfoDisplay');
    
    if (!tableBody || !eventInfo) return;
    
    // Check if data exists
    if (!appState.players.length || !appState.scores.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px;">
                    <p style="margin: 0; color: #666;">🔄 ยังไม่มีข้อมูลผลการแข่งขัน</p>
                    <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #999;">กรุณากรอกข้อมูลลงทะเบียนและคะแนนก่อน</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Merge and sort
    const merged = appState.players.map((name, idx) => ({
        name,
        total: appState.scores[idx]?.total ?? 0
    }));
    
    merged.sort((a, b) => a.total - b.total);
    appState.results = merged;
    saveAppState();
    
    // Display event info
    if (appState.event && appState.developer) {
        eventInfo.innerHTML = `
            <h3>📋 ข้อมูลการแข่งขัน</h3>
            <p><strong>🏆 ชื่อกิจกรรม:</strong> ${appState.event.name}</p>
            <p><strong>📍 สถานที่:</strong> ${appState.event.venue}</p>
            <p><strong>📅 วันที่:</strong> ${new Date(appState.event.date).toLocaleDateString('th-TH')}</p>
            <p><strong>📂 หมวดหมู่:</strong> ${appState.event.category}</p>
            <p><strong>👨‍💻 ผู้พัฒนาระบบ:</strong> ${appState.developer.name}</p>
            <p><strong>📱 เบอร์โทร:</strong> ${appState.developer.phone}</p>
        `;
    }
    
    // Display results
    tableBody.innerHTML = merged.map((item, idx) => {
        let rankClass = '';
        let medal = '🎖️';
        let status = 'ผ่าน';
        
        if (idx === 0) {
            rankClass = 'rank-1';
            medal = '🥇';
            status = '🏆 Champion';
        } else if (idx === 1) {
            rankClass = 'rank-2';
            medal = '🥈';
            status = '🎖️ Runner-up';
        } else if (idx === 2) {
            rankClass = 'rank-3';
            medal = '🥉';
            status = '🏅 3rd Place';
        }
        
        return `
            <tr class="${rankClass}">
                <td class="col-rank">${medal}</td>
                <td class="col-name">${item.name}</td>
                <td class="col-score"><strong>${item.total}</strong></td>
                <td class="col-status">${status}</td>
                <td class="col-action">⭐</td>
            </tr>
        `;
    }).join('');
}

function toggleDetailView() {
    const table = document.getElementById('resultsTable');
    if (table) {
        table.classList.toggle('detailed');
        showMessage('resultsMessage', '✓ เปลี่ยนมุมมองเรียบร้อยแล้ว', 'info');
    }
}

// ==================== EXPORT FUNCTIONS ====================
function exportToCSV() {
    if (!appState.results.length) {
        showMessage('resultsMessage', '❌ ยังไม่มีข้อมูลผลการแข่งขัน', 'error');
        return;
    }
    
    const rows = [
        ['อันดับ', 'ชื่อผู้เล่น', 'คะแนนรวม'],
        ...appState.results.map((item, idx) => [idx + 1, item.name, item.total])
    ];
    
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `woodball_results_${getDateString()}.csv`);
    
    showMessage('resultsMessage', '✓ ดาวน์โหลด CSV สำเร็จแล้ว', 'success');
}

function downloadHTML() {
    if (!appState.results.length) {
        showMessage('resultsMessage', '❌ ยังไม่มีข้อมูลผลการแข่งขัน', 'error');
        return;
    }
    
    const html = generateResultsHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    downloadFile(blob, `woodball_results_${getDateString()}.html`);
    
    showMessage('resultsMessage', '✓ ดาวน์โหลด HTML สำเร็จแล้ว', 'success');
}

function exportToPDF() {
    if (!appState.results.length) {
        showMessage('resultsMessage', '❌ ยังไม่มีข้อมูลผลการแข่งขัน', 'error');
        return;
    }
    
    // Using print to PDF (browser native)
    printResults();
}

function printResults() {
    window.print();
}

function exportAllData() {
    const dataExport = {
        version: APP_VERSION,
        exportDate: new Date().toISOString(),
        event: appState.event,
        developer: appState.developer,
        players: appState.players,
        scores: appState.scores,
        results: appState.results
    };
    
    const json = JSON.stringify(dataExport, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    downloadFile(blob, `woodball_backup_${getDateString()}.json`);
    
    showMessage('dataMessage', '✓ ส่งออกข้อมูลทั้งหมดสำเร็จแล้ว', 'success');
}

function resetAllData() {
    clearAppState();
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getDateString() {
    return new Date().toISOString().split('T')[0];
}

function generateResultsHTML() {
    const eventName = appState.event?.name || 'การแข่งขัน Woodball';
    const eventVenue = appState.event?.venue || '-';
    const eventDate = appState.event?.date || '-';
    
    const resultsRows = appState.results.map((item, idx) => {
        let rankClass = '';
        if (idx === 0) rankClass = 'rank-1';
        else if (idx === 1) rankClass = 'rank-2';
        else if (idx === 2) rankClass = 'rank-3';
        
        return `
            <tr class="${rankClass}">
                <td>${idx + 1}</td>
                <td>${item.name}</td>
                <td>${item.total}</td>
            </tr>
        `;
    }).join('');
    
    return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ผลการแข่งขัน Woodball</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 20px; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2ecc71; text-align: center; margin-bottom: 10px; }
        h2 { color: #333; text-align: center; margin: 20px 0; font-size: 1.3rem; }
        .info { background: #f0f8ff; padding: 15px; border-left: 4px solid #2ecc71; border-radius: 5px; margin-bottom: 20px; }
        .info p { margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #2ecc71; color: white; font-weight: bold; }
        .rank-1 { background-color: #fff3cd; }
        .rank-2 { background-color: #f0f0f0; }
        .rank-3 { background-color: #ffe4d6; }
        .footer { text-align: center; color: #666; font-size: 0.9rem; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏆 ผลการแข่งขัน WOODBALL 🏆</h1>
        <h2>${eventName}</h2>
        
        <div class="info">
            <p><strong>📍 สถานที่:</strong> ${eventVenue}</p>
            <p><strong>📅 วันที่:</strong> ${eventDate}</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>อันดับ</th>
                    <th>ชื่อผู้เล่น</th>
                    <th>คะแนนรวม</th>
                </tr>
            </thead>
            <tbody>
                ${resultsRows}
            </tbody>
        </table>
        
        <div class="footer">
            <p>ผลการแข่งขันนี้ถูกสร้างจาก Woodball Management System v${APP_VERSION}</p>
            <p>📅 ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    </div>
</body>
</html>
    `;
}

// ==================== DATA MANAGEMENT ====================
function editDevInfo() {
    goToPage('registerPage');
    if (appState.developer) {
        document.getElementById('devName').value = appState.developer.name || '';
        document.getElementById('devPhone').value = appState.developer.phone || '';
        document.getElementById('devEmail').value = appState.developer.email || '';
    }
}

function editEventInfo() {
    goToPage('registerPage');
    if (appState.event) {
        document.getElementById('eventName').value = appState.event.name || '';
        document.getElementById('eventVenue').value = appState.event.venue || '';
        document.getElementById('eventDate').value = appState.event.date || '';
        document.getElementById('eventCategory').value = appState.event.category || '';
    }
}

function updateStatistics() {
    document.getElementById('totalPlayers').textContent = appState.players.length;
    document.getElementById('totalEvents').textContent = appState.event ? 1 : 0;
    document.getElementById('totalRecords').textContent = appState.results.length;
}

// ==================== UI UTILITIES ====================
function handleScrollButton() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    
    if (window.pageYOffset > 300) {
        btn.classList.add('show');
    } else {
        btn.classList.remove('show');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleResize() {
    // Adjust UI on resize
    const playerCount = Number(document.getElementById('playerCount')?.value || 4);
    if (playerCount > 0) {
        generateScoreTable(playerCount);
    }
}

function updateWhatsAppButton() {
    const btn = document.getElementById('whatsappBtn');
    if (!btn) return;
    
    const phone = appState.developer?.phone || '66XXXXXXXXX';
    const formattedPhone = phone.replace(/^0/, '66');
    const message = encodeURIComponent(`สวัสดีค่ะ\n\nฉันต้องการข้อมูลเพิ่มเติมเกี่ยวกับการแข่งขัน Woodball\n\nขอบคุณค่ะ`);
    btn.href = `https://wa.me/${formattedPhone}?text=${message}`;
}

function setupEventListeners() {
    // Prevent accidental leaving
    window.addEventListener('beforeunload', (e) => {
        if (appState.players.length > 0 || appState.scores.length > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// ==================== MOBILE OPTIMIZATIONS ====================
// Prevent double-tap zoom on buttons
document.addEventListener('touchstart', function() {}, false);

// Handle iOS keyboard
document.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }
    }
});

// ==================== SERVICE WORKER ====================
// Note: Service worker file (sw.js) should be created separately for offline support

console.log('✓ Woodball Pro System Ready');
console.log(`Version: ${APP_VERSION}`);
console.log(`Storage: ${STORAGE_KEY}`);
