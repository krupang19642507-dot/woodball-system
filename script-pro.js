// WOODBALL SYSTEM v2.0 - Production Ready Script
// Mobile-first, offline capable, event-ready

const APP_VERSION = '2.0.0';
const STORAGE_KEY = 'woodball_pro_data_v2';
const MAX_PLAYERS = 12;
const MIN_PLAYERS = 2;
const TOTAL_GATES = 12;

let appState = {
    developer: null,
    event: null,
    players: [],
    scores: [],
    results: [],
    lastUpdated: null,
    tabs: {
        summary: true,
        details: false,
        export: false
    }
};

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachGlobalHandlers();
});

function initializeApp() {
    try {
        loadState();
        updateStatsSummary();
        renderDeveloperSummary();
        renderEventSummary();
        renderPlayersList();
        renderScoreDetail();
        updatePodium();
        generatePlayerInputs();
        setupUploadAndExport();
        updateWhatsAppLink();
        handleScroll();
        showLoading(false);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

function attachGlobalHandlers() {
    document.getElementById('registerForm')?.addEventListener('submit', handleRegistration);
    document.getElementById('playerCount')?.addEventListener('input', () => {
        const value = Number(document.getElementById('playerCount').value || 4);
        document.getElementById('playerCountDisplay').textContent = `${Math.min(Math.max(value, MIN_PLAYERS), MAX_PLAYERS)} คน`;
    });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateStatsSummary();
        }
    });
}

// =========================================
// STATE MANAGEMENT
// =========================================
function saveState() {
    try {
        const payload = {
            developer: appState.developer,
            event: appState.event,
            players: appState.players,
            scores: appState.scores,
            results: appState.results,
            lastUpdated: new Date().toISOString(),
            version: APP_VERSION
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return true;
    } catch (error) {
        console.error('Save state failed:', error);
        return false;
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);

        appState = {
            ...appState,
            developer: data.developer || null,
            event: data.event || null,
            players: Array.isArray(data.players) ? data.players : [],
            scores: Array.isArray(data.scores) ? data.scores : [],
            results: Array.isArray(data.results) ? data.results : [],
            lastUpdated: data.lastUpdated || null
        };
    } catch (error) {
        console.error('Load state failed:', error);
    }
}

function resetAllData() {
    if (!confirm('⚠️ คุณต้องการรีเซ็ตข้อมูลทั้งหมดใช่หรือไม่ ?')) return;

    localStorage.removeItem(STORAGE_KEY);
    appState = {
        developer: null,
        event: null,
        players: [],
        scores: [],
        results: [],
        lastUpdated: null,
        tabs: {
            summary: true,
            details: false,
            export: false
        }
    };

    document.getElementById('registerForm')?.reset();
    renderDeveloperSummary();
    renderEventSummary();
    renderPlayersList();
    renderScoreDetail();
    updateStatsSummary();
    showMessage('dataMessage', '✓ รีเซ็ตข้อมูลเรียบร้อยแล้ว', 'success');
    goToPage('menuPage');
}

// =========================================
// APP NAVIGATION
// =========================================
function goToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    const panel = document.getElementById('quickMenu');
    panel.classList.toggle('open');
}

function handleScroll() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    btn.classList.toggle('show', window.scrollY > 250);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// MESSAGE SYSTEM
// =========================================
function showMessage(elementId, text, type = 'info') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `message show ${type}`;
    if (type === 'success') {
        setTimeout(() => el.classList.remove('show'), 3500);
    }
}

function showLoading(show = true) {
    const spinner = document.getElementById('loadingSpinner');
    if (!spinner) return;
    spinner.style.display = show ? 'flex' : 'none';
}

// =========================================
// REGISTRATION
// =========================================
function handleRegistration(event) {
    event.preventDefault();

    const devName = document.getElementById('devName').value.trim();
    const devPhone = document.getElementById('devPhone').value.trim();
    const devEmail = document.getElementById('devEmail').value.trim();
    const eventName = document.getElementById('eventName').value.trim();
    const eventVenue = document.getElementById('eventVenue').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const eventCategory = document.getElementById('eventCategory').value;
    const participantCount = Number(document.getElementById('participantCount').value || 10);
    const eventNotes = document.getElementById('eventNotes').value.trim();

    if (!devName || !devPhone || !eventName || !eventVenue || !eventDate) {
        showMessage('registerMessage', '❌ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    const cleanedPhone = devPhone.replace(/[^0-9+]/g, '');
    if (cleanedPhone.length < 10) {
        showMessage('registerMessage', '❌ กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง', 'error');
        return;
    }

    appState.developer = {
        name: devName,
        phone: cleanedPhone,
        email: devEmail || null,
        registeredAt: new Date().toISOString()
    };

    appState.event = {
        name: eventName,
        venue: eventVenue,
        date: eventDate,
        category: eventCategory || 'ทั่วไป',
        participantCount,
        notes: eventNotes || ''
    };

    saveState();
    updateWhatsAppLink();
    renderDeveloperSummary();
    renderEventSummary();
    updateStatsSummary();
    showMessage('registerMessage', '✓ บันทึกข้อมูลเรียบร้อยแล้ว', 'success');

    setTimeout(() => {
        document.getElementById('registerForm').reset();
        goToPage('scoreCardPage');
    }, 800);
}

function clearFormData() {
    document.getElementById('registerForm').reset();
    showMessage('registerMessage', '✓ ล้างข้อมูลเรียบร้อยแล้ว', 'info');
}

function editDevInfo() {
    goToPage('registerPage');
    const dev = appState.developer;
    if (!dev) return;
    document.getElementById('devName').value = dev.name || '';
    document.getElementById('devPhone').value = dev.phone || '';
    document.getElementById('devEmail').value = dev.email || '';
}

function editEventInfo() {
    goToPage('registerPage');
    const ev = appState.event;
    if (!ev) return;
    document.getElementById('eventName').value = ev.name || '';
    document.getElementById('eventVenue').value = ev.venue || '';
    document.getElementById('eventDate').value = ev.date || '';
    document.getElementById('eventCategory').value = ev.category || '';
    document.getElementById('participantCount').value = ev.participantCount || 10;
    document.getElementById('eventNotes').value = ev.notes || '';
}

// =========================================
// PLAYER + SCORE CARD
// =========================================
function increasePlayerCount() {
    const input = document.getElementById('playerCount');
    const newValue = Math.min(Number(input.value || 4) + 1, MAX_PLAYERS);
    input.value = newValue;
    document.getElementById('playerCountDisplay').textContent = `${newValue} คน`;
    generatePlayerInputs();
}

function decreasePlayerCount() {
    const input = document.getElementById('playerCount');
    const newValue = Math.max(Number(input.value || 4) - 1, MIN_PLAYERS);
    input.value = newValue;
    document.getElementById('playerCountDisplay').textContent = `${newValue} คน`;
    generatePlayerInputs();
}

function generatePlayerInputs() {
    const playerCount = Math.min(Math.max(Number(document.getElementById('playerCount')?.value || 4), MIN_PLAYERS), MAX_PLAYERS);
    const container = document.getElementById('playerNamesContainer');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= playerCount; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'player-input-group';
        wrap.innerHTML = `
            <label for="playerName${i}">👤 ผู้เล่นคนที่ ${i}</label>
            <input type="text" id="playerName${i}" class="player-input" placeholder="กรอกชื่อผู้เล่น" autocomplete="name">
        `;
        container.appendChild(wrap);
    }
    document.getElementById('playerCountDisplay').textContent = `${playerCount} คน`;
    generateScoreTable(playerCount);
}

function generateScoreTable(playerCount) {
    const tableBody = document.getElementById('scoreTableBody');
    const headerWrap = document.getElementById('playerColsHeader');
    if (!tableBody || !headerWrap) return;

    let headers = '';
    for (let i = 1; i <= playerCount; i++) {
        headers += `<th>Player ${i}</th>`;
    }
    headerWrap.innerHTML = headers;
    tableBody.innerHTML = '';

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

    gates.forEach(gate => {
        const row = document.createElement('tr');
        let cells = `
            <td><strong>${gate.gate}</strong></td>
            <td>${gate.par}</td>
            <td>${gate.distance}</td>
        `;

        for (let i = 1; i <= playerCount; i++) {
            cells += `
                <td>
                    <input type="number" min="0" max="99" value="0" data-player="${i}" data-gate="${gate.gate}" class="score-input" inputmode="numeric">
                </td>
            `;
        }

        row.innerHTML = cells;
        tableBody.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    totalRow.style.background = '#e8f5e9';
    totalRow.style.fontWeight = 'bold';
    let totalCells = '<td colspan="3"><strong>📊 คะแนนรวม</strong></td>';
    for (let i = 1; i <= playerCount; i++) {
        totalCells += `<td class="total-cell" data-total-player="${i}"><strong>0</strong></td>`;
    }
    totalRow.innerHTML = totalCells;
    tableBody.appendChild(totalRow);

    document.querySelectorAll('.score-input').forEach(input => {
        input.addEventListener('input', updateTotals);
        input.addEventListener('change', updateTotals);
    });
}

function updateTotals() {
    const playerCount = Number(document.getElementById('playerCount').value || 4);
    for (let player = 1; player <= playerCount; player++) {
        const inputs = document.querySelectorAll(`input[data-player="${player}"]`);
        let total = 0;
        inputs.forEach(input => {
            total += Number(input.value) || 0;
        });
        const cell = document.querySelector(`[data-total-player="${player}"]`);
        if (cell) {
            cell.innerHTML = `<strong>${total}</strong>`;
        }
    }
}

function calculateAllTotals() {
    updateTotals();
    showMessage('scoreMessage', '✓ คำนวณคะแนนเรียบร้อยแล้ว', 'success');
}

function submitScoreCard() {
    const playerCount = Number(document.getElementById('playerCount').value || 4);
    const players = [];

    for (let i = 1; i <= playerCount; i++) {
        const name = document.getElementById(`playerName${i}`)?.value.trim();
        if (!name) {
            showMessage('scoreMessage', `❌ กรุณากรอกชื่อผู้เล่นคนที่ ${i}`, 'error');
            return;
        }
        players.push(name);
    }

    const totals = {};
    players.forEach((_, idx) => totals[idx + 1] = 0);
    document.querySelectorAll('input[data-player][data-gate]').forEach(input => {
        const player = Number(input.dataset.player);
        totals[player] += Number(input.value) || 0;
    });

    const scores = players.map((name, idx) => ({
        name,
        total: totals[idx + 1]
    }));

    appState.players = players;
    appState.scores = scores;
    saveState();
    renderPlayersList();
    renderScoreDetail();
    updateStatsSummary();

    showMessage('scoreMessage', '✓ บันทึกคะแนนเรียบร้อยแล้ว', 'success');
    setTimeout(() => {
        sortAndDisplayResults();
        updatePodium();
        goToPage('resultsPage');
    }, 600);
}

function autoFillScores() {
    const playerCount = Number(document.getElementById('playerCount').value || 4);
    const rows = [
        [4, 5, 3, 4, 3, 4, 4, 4, 5, 4, 4, 4],
        [5, 4, 4, 5, 4, 3, 5, 4, 4, 5, 4, 5],
        [3, 5, 3, 4, 3, 4, 4, 5, 4, 3, 4, 5],
        [4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 5, 4]
    ];

    for (let p = 1; p <= playerCount; p++) {
        const index = Math.min(p - 1, rows.length - 1);
        const values = rows[index] || rows[0];

        for (let gate = 1; gate <= TOTAL_GATES; gate++) {
            const input = document.querySelector(`input[data-player="${p}"][data-gate="${gate}"]`);
            if (input) {
                input.value = values[gate - 1] || 0;
            }
        }
    }

    updateTotals();
    showMessage('scoreMessage', '✓ เติมคะแนนตัวอย่างเรียบร้อยแล้ว', 'info');
}

// =========================================
// RESULTS + RANKING
// =========================================
function sortAndDisplayResults() {
    const tableBody = document.getElementById('resultsTableBody');
    const eventInfo = document.getElementById('eventInfoDisplay');
    if (!tableBody || !eventInfo) return;

    if (!appState.players.length || !appState.scores.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:30px; color:#666;">
                    <p>🔄 ยังไม่มีข้อมูลผลการแข่งขัน</p>
                    <small>กรุณากรอกข้อมูลและคะแนนก่อน</small>
                </td>
            </tr>
        `;
        return;
    }

    const merged = appState.players.map((name, index) => ({
        name,
        total: appState.scores[index]?.total ?? 0
    }));

    merged.sort((a, b) => a.total - b.total);
    appState.results = merged;
    saveState();

    if (appState.event && appState.developer) {
        eventInfo.innerHTML = `
            <h3>📋 ข้อมูลการแข่งขัน</h3>
            <p><strong>🏆 ชื่อกิจกรรม:</strong> ${appState.event.name}</p>
            <p><strong>📍 สถานที่:</strong> ${appState.event.venue}</p>
            <p><strong>📅 วันที่:</strong> ${new Date(appState.event.date).toLocaleDateString('th-TH')}</p>
            <p><strong>📂 หมวดหมู่:</strong> ${appState.event.category || 'ทั่วไป'}</p>
            <p><strong>👨‍💻 ผู้ดูแลระบบ:</strong> ${appState.developer.name}</p>
            <p><strong>📱 เบอร์โทร:</strong> ${appState.developer.phone}</p>
        `;
    }

    tableBody.innerHTML = merged.map((item, idx) => {
        let rankClass = '';
        let medal = '🎖️';
        let status = 'ผ่าน';

        if (idx === 0) {
            rankClass = 'rank-1';
            medal = '🥇';
            status = 'Champion';
        } else if (idx === 1) {
            rankClass = 'rank-2';
            medal = '🥈';
            status = 'Runner-up';
        } else if (idx === 2) {
            rankClass = 'rank-3';
            medal = '🥉';
            status = '3rd place';
        }

        return `
            <tr class="${rankClass}">
                <td class="col-rank">${medal} ${idx + 1}</td>
                <td class="col-name">${item.name}</td>
                <td class="col-score"><strong>${item.total}</strong></td>
                <td class="col-status">${status}</td>
                <td class="col-action">⭐</td>
            </tr>
        `;
    }).join('');

    updatePodium();
    updateStatsSummary();
}

function updatePodium() {
    const podium = document.getElementById('podiumDisplay');
    if (!podium) return;

    if (!appState.results.length) {
        podium.innerHTML = '<div class="podium-empty">ยังไม่มีข้อมูล</div>';
        return;
    }

    const top3 = appState.results.slice(0, 3);
    const medals = ['🥇', '🥈', '🥉'];
    podium.innerHTML = top3.map((item, idx) => `
        <div class="podium-card ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'}">
            <div class="medal">${medals[idx]}</div>
            <div class="name">${item.name}</div>
            <div class="score">${item.total} คะแนน</div>
        </div>
    `).join('');
}

function toggleDetailView() {
    const table = document.getElementById('resultsTable');
    if (!table) return;
    table.classList.toggle('detailed');
    showMessage('resultsMessage', '✓ เปลี่ยนโหมดรายละเอียดเรียบร้อยแล้ว', 'info');
}

// =========================================
// DATA SUMMARY
// =========================================
function renderDeveloperSummary() {
    const devBox = document.getElementById('devInfoDisplay');
    if (!devBox) return;
    if (!appState.developer) {
        devBox.innerHTML = '<p>ยังไม่มีข้อมูลผู้ดูแลระบบ</p>';
        return;
    }

    devBox.innerHTML = `
        <p><strong>ชื่อ:</strong> ${appState.developer.name}</p>
        <p><strong>โทร:</strong> ${appState.developer.phone}</p>
        <p><strong>อีเมล:</strong> ${appState.developer.email || '—'}</p>
    `;
}

function renderEventSummary() {
    const evBox = document.getElementById('eventInfoData');
    if (!evBox) return;
    if (!appState.event) {
        evBox.innerHTML = '<p>ยังไม่มีข้อมูลกิจกรรม</p>';
        return;
    }

    evBox.innerHTML = `
        <p><strong>กิจกรรม:</strong> ${appState.event.name}</p>
        <p><strong>สถานที่:</strong> ${appState.event.venue}</p>
        <p><strong>วันที่:</strong> ${new Date(appState.event.date).toLocaleDateString('th-TH')}</p>
        <p><strong>หมวดหมู่:</strong> ${appState.event.category}</p>
        <p><strong>ผู้เข้าร่วม:</strong> ${appState.event.participantCount || 0}</p>
    `;
}

function renderPlayersList() {
    const playerList = document.getElementById('playersListDisplay');
    const detail = document.getElementById('scoresDetailDisplay');
    if (!playerList) return;

    if (!appState.players.length) {
        playerList.innerHTML = '<p>ยังไม่มีรายชื่อผู้เล่น</p>';
        if (detail) detail.innerHTML = '<tr><td colspan="3">ไม่มีข้อมูล</td></tr>';
        return;
    }

    playerList.innerHTML = appState.players.map((name, idx) => `
        <div class="player-badge">${idx + 1}. ${name}</div>
    `).join('');

    if (detail) {
        const rows = appState.scores.map((item, idx) => {
            let level = 'ผ่าน';
            if (idx === 0) level = 'Champion';
            else if (idx === 1) level = 'Runner-up';
            else if (idx === 2) level = 'Top 3';
            return `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.total}</td>
                    <td>${level}</td>
                </tr>
            `;
        }).join('');
        detail.innerHTML = rows;
    }
}

function renderScoreDetail() {
    const detail = document.getElementById('scoresDetailDisplay');
    if (!detail) return;
    if (!appState.scores.length) {
        detail.innerHTML = '<tr><td colspan="3">ไม่มีข้อมูลคะแนน</td></tr>';
        return;
    }

    detail.innerHTML = appState.scores.map((item, idx) => {
        let level = 'ผ่าน';
        if (idx === 0) level = 'Champion';
        else if (idx === 1) level = 'Runner-up';
        else if (idx === 2) level = 'Top 3';
        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.total}</td>
                <td>${level}</td>
            </tr>
        `;
    }).join('');
}

function updateStatsSummary() {
    const playersCount = appState.players.length || 0;
    const queryCount = appState.results.length || 0;
    const completion = appState.players.length && appState.scores.length ? 100 : 0;

    const totalPlayers = document.getElementById('totalPlayers');
    const totalRecords = document.getElementById('totalRecords');
    const statTotalPlayers = document.getElementById('statTotalPlayers');
    const statResultsCount = document.getElementById('statResultsCount');
    const statCompletion = document.getElementById('statCompletion');

    if (totalPlayers) totalPlayers.textContent = playersCount;
    if (totalRecords) totalRecords.textContent = queryCount;
    if (statTotalPlayers) statTotalPlayers.textContent = playersCount;
    if (statResultsCount) statResultsCount.textContent = queryCount;
    if (statCompletion) statCompletion.textContent = `${completion}%`;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`)?.classList.add('active');
    document.getElementById(tabName)?.classList.add('active');
}

// =========================================
// EXPORT & BACKUP
// =========================================
function exportToCSV() {
    if (!appState.results.length) {
        showMessage('resultsMessage', '❌ ยังไม่มีข้อมูลผลการแข่งขัน', 'error');
        return;
    }

    const rows = [
        ['อันดับ', 'ชื่อผู้เล่น', 'คะแนนรวม'],
        ...appState.results.map((item, idx) => [idx + 1, item.name, item.total])
    ];

    const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `woodball_results_${formatDateFile()}.csv`);
    showMessage('resultsMessage', '✓ ดาวน์โหลด CSV สำเร็จแล้ว', 'success');
}

function exportAllData() {
    const payload = {
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        developer: appState.developer,
        event: appState.event,
        players: appState.players,
        scores: appState.scores,
        results: appState.results
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, `woodball_backup_${formatDateFile()}.json`);
    showMessage('dataMessage', '✓ ส่งออกข้อมูลสำเร็จแล้ว', 'success');
}

function downloadHTML() {
    if (!appState.results.length) {
        showMessage('resultsMessage', '❌ ยังไม่มีข้อมูลผลการแข่งขัน', 'error');
        return;
    }

    const html = generateResultsHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    downloadBlob(blob, `woodball_results_${formatDateFile()}.html`);
    showMessage('resultsMessage', '✓ ดาวน์โหลด HTML สำเร็จแล้ว', 'success');
}

function exportToPDF() {
    if (!appState.results.length) {
        showMessage('resultsMessage', '❌ ยังไม่มีข้อมูลผลการแข่งขัน', 'error');
        return;
    }
    window.print();
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateResultsHTML() {
    const eventName = appState.event?.name || 'Woodball Competition';
    const eventVenue = appState.event?.venue || '—';
    const eventDate = appState.event?.date ? new Date(appState.event.date).toLocaleDateString('th-TH') : '—';
    const rows = appState.results.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${item.name}</td>
            <td>${item.total}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>${eventName}</title>
        <style>
            body { font-family: 'Segoe UI'; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
            th { background: #2ecc71; color: white; }
            h1 { text-align: center; color: #2ecc71; }
            .meta { margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>🏆 ผลการแข่งขัน Woodball</h1>
        <div class="meta">
            <p><strong>ชื่อกิจกรรม:</strong> ${eventName}</p>
            <p><strong>สถานที่:</strong> ${eventVenue}</p>
            <p><strong>วันที่:</strong> ${eventDate}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>อันดับ</th>
                    <th>ชื่อผู้เล่น</th>
                    <th>คะแนนรวม</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </body>
    </html>
    `;
}

function backupCurrentData() {
    exportAllData();
}

function shareResults() {
    if (!appState.results.length) {
        showMessage('dataMessage', '❌ ยังไม่มีข้อมูลสำหรับแชร์', 'error');
        return;
    }

    const txt = appState.results.map((item, idx) => `${idx + 1}. ${item.name} - ${item.total} คะแนน`).join('\n');
    const shareText = encodeURIComponent(`🏆 ผลการแข่งขัน Woodball\n\n${txt}`);
    if (navigator.share) {
        navigator.share({
            title: 'ผลการแข่งขัน Woodball',
            text: `🏆 ผลการแข่งขัน Woodball\n\n${txt}`
        }).catch(() => {});
    } else {
        window.open(`https://wa.me/?text=${shareText}`, '_blank');
    }
}

function downloadDataAsZip() {
    showMessage('dataMessage', 'ℹ️ หมายเหตุ: ZIP export จะทำได้เมื่อมีการต่อ backend จริง', 'info');
}

function formatDateFile() {
    const now = new Date();
    return now.toISOString().slice(0, 10);
}

// =========================================
// WHATSAPP / OFFLINE / PWA
// =========================================
function updateWhatsAppLink() {
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (!whatsappBtn) return;

    const phone = appState.developer?.phone || '66999999999';
    const clean = phone.replace(/[^0-9]/g, '');
    const waPhone = clean.startsWith('66') ? clean : `66${clean.replace(/^0/, '')}`;
    const msg = encodeURIComponent('สวัสดีครับ ผมต้องการข้อมูลเพิ่มเติมเกี่ยวกับการแข่งขัน Woodball');
    whatsappBtn.href = `https://wa.me/${waPhone}?text=${msg}`;
}

function handleResize() {
    // no-op placeholder
}

// =========================================
// PWA Manifest + Offline support stub
// =========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {
            console.log('Service worker not available');
        });
    });
}

// =========================================
// AUTOMATIC INIT / LAST STATE
// =========================================
(function bootstrap() {
    loadState();
    updateStatsSummary();
    renderDeveloperSummary();
    renderEventSummary();
    renderPlayersList();
    renderScoreDetail();
    generatePlayerInputs();
    sortAndDisplayResults();
    updatePodium();
    updateWhatsAppLink();
})();
