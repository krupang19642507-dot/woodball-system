const STORAGE_KEY = "woodball_system_data_v1";

let state = {
    developer: null,
    event: null,
    players: [],
    scores: [],
    results: []
};

function showMessage(elementId, text, type = "info") {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = "message show " + type;
}

function hideMessage(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = "message";
}

function goToPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
}

function saveData() {
    const data = {
        developer: state.developer,
        event: state.event,
        players: state.players,
        scores: state.scores,
        results: state.results
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        state = {
            developer: data.developer || null,
            event: data.event || null,
            players: data.players || [],
            scores: data.scores || [],
            results: data.results || []
        };
    } catch (err) {
        console.error("Load data error:", err);
    }
}

// ==================== REGISTRATION FORM ====================
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("devName").value.trim();
    const phone = document.getElementById("devPhone").value.trim();
    const eventName = document.getElementById("eventName").value.trim();
    const eventVenue = document.getElementById("eventVenue").value.trim();
    const eventDate = document.getElementById("eventDate").value;

    if (!name || !phone || !eventName || !eventVenue || !eventDate) {
        showMessage("registerMessage", "❌ กรุณากรอกข้อมูลให้ครบทุกช่อง", "error");
        return;
    }

    if (!/^[0-9]{10}/.test(phone.replace(/[-\s]/g, ''))) {
        showMessage("registerMessage", "❌ กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (10 หลัก)", "error");
        return;
    }

    state.developer = {
        name,
        phone,
        eventName,
        eventVenue,
        eventDate
    };

    state.event = {
        name: eventName,
        venue: eventVenue,
        date: eventDate
    };

    saveData();

    showMessage("registerMessage", "✓ บันทึกข้อมูลลงทะเบียนเรียบร้อยแล้ว", "success");
    setTimeout(() => {
        document.getElementById("registerForm").reset();
        goToPage("scoreCardPage");
    }, 700);
});

// ==================== SCORE CARD FUNCTIONS ====================
function generatePlayerInputs() {
    const playerCount = Number(document.getElementById("playerCount").value);
    const safeCount = Math.min(Math.max(playerCount || 2, 2), 12);

    const container = document.getElementById("playerNamesContainer");
    container.innerHTML = "";

    for (let i = 1; i <= safeCount; i++) {
        const item = document.createElement("div");
        item.className = "player-input-group";
        item.innerHTML = `
            <label for="playerName${i}">👤 ผู้เล่นคนที่ ${i}</label>
            <input type="text" id="playerName${i}" placeholder="กรอกชื่อผู้เล่นคนที่ ${i}" />
        `;
        container.appendChild(item);
    }

    generateScoreTable(safeCount);
}

function generateScoreTable(playerCount) {
    const tableBody = document.getElementById("scoreTableBody");
    const header = document.getElementById("playerColsHeader");
    tableBody.innerHTML = "";

    let playerHeaders = "";
    for (let i = 1; i <= playerCount; i++) {
        playerHeaders += `<th>Player ${i}</th>`;
    }
    header.innerHTML = playerHeaders;

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

    gates.forEach((g) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${g.gate}</strong></td>
            <td>${g.par}</td>
            <td>${g.distance}</td>
            ${Array.from({ length: playerCount }, (_, idx) => `
                <td>
                    <input type="number" min="0" value="0" data-player="${idx + 1}" data-gate="${g.gate}" class="score-input" />
                </td>
            `).join("")}
        `;
        tableBody.appendChild(row);
    });

    const totalRow = document.createElement("tr");
    totalRow.style.fontWeight = "bold";
    totalRow.style.backgroundColor = "#e8f5e9";
    totalRow.innerHTML = `
        <td colspan="3"><strong>📊 คะแนนรวม</strong></td>
        ${Array.from({ length: playerCount }, (_, idx) => `
            <td class="total-cell" data-total-player="${idx + 1}"><strong>0</strong></td>
        `).join("")}
    `;
    tableBody.appendChild(totalRow);

    // Add event listeners for real-time calculation
    document.querySelectorAll(".score-input").forEach(input => {
        input.addEventListener("change", updateTotals);
        input.addEventListener("input", updateTotals);
    });
}

function updateTotals() {
    const playerCount = Number(document.getElementById("playerCount").value);

    for (let player = 1; player <= playerCount; player++) {
        const inputs = document.querySelectorAll(`input[data-player="${player}"]`);
        let total = 0;
        inputs.forEach(input => {
            total += Number(input.value) || 0;
        });
        const totalCell = document.querySelector(`[data-total-player="${player}"]`);
        if (totalCell) totalCell.textContent = total;
    }
}

document.getElementById("scoreCardForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const playerCount = Number(document.getElementById("playerCount").value);
    const players = [];

    for (let i = 1; i <= playerCount; i++) {
        const nameInput = document.getElementById(`playerName${i}`);
        const name = nameInput ? nameInput.value.trim() : "";
        if (!name) {
            showMessage("scoreMessage", `❌ กรุณากรอกชื่อผู้เล่นคนที่ ${i}`, "error");
            return;
        }
        players.push(name);
    }

    const scoreRows = [];
    const inputs = document.querySelectorAll("input[data-player][data-gate]");
    const scoresByPlayer = {};

    players.forEach((_, idx) => {
        scoresByPlayer[idx + 1] = [];
    });

    inputs.forEach((input) => {
        const player = Number(input.dataset.player);
        const gate = Number(input.dataset.gate);
        const value = Number(input.value) || 0;
        scoresByPlayer[player].push({ gate, value });
    });

    players.forEach((name, idx) => {
        const total = scoresByPlayer[idx + 1].reduce((sum, item) => sum + item.value, 0);
        scoreRows.push({
            name,
            total
        });
    });

    state.players = players;
    state.scores = scoreRows;

    saveData();

    showMessage("scoreMessage", "✓ บันทึกคะแนนเรียบร้อยแล้ว", "success");
    setTimeout(() => {
        sortAndDisplayResults();
        goToPage("resultsPage");
    }, 500);
});

// ==================== RESULTS FUNCTIONS ====================
function sortAndDisplayResults() {
    const resultsTableBody = document.getElementById("resultsTableBody");
    const eventDisplay = document.getElementById("eventInfoDisplay");

    const players = state.players.length ? state.players : [];
    const scores = state.scores.length ? state.scores : [];

    if (!players.length || !scores.length) {
        resultsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    <em>ยังไม่มีข้อมูลผลการแข่งขัน</em>
                </td>
            </tr>
        `;
        eventDisplay.innerHTML = "<p>🔄 กรุณากรอกข้อมูลลงทะเบียนและคะแนนก่อน</p>";
        return;
    }

    const merged = players.map((name, idx) => {
        const score = scores[idx]?.total ?? 0;
        return {
            name,
            total: score
        };
    });

    // Sort from lowest to highest score (lower is better in woodball)
    merged.sort((a, b) => a.total - b.total);

    state.results = merged;
    saveData();

    const eventName = state.event?.name || "การแข่งขัน Woodball";
    const eventVenue = state.event?.venue || "-";
    const eventDate = state.event?.date || "-";
    const devName = state.developer?.name || "-";
    const devPhone = state.developer?.phone || "-";

    eventDisplay.innerHTML = `
        <h3>📋 ข้อมูลการแข่งขัน</h3>
        <p><strong>🏆 ชื่อกิจกรรม:</strong> ${eventName}</p>
        <p><strong>📍 สถานที่:</strong> ${eventVenue}</p>
        <p><strong>📅 วันที่:</strong> ${eventDate}</p>
        <p><strong>👨‍💻 ผู้พัฒนาระบบ:</strong> ${devName}</p>
        <p><strong>📱 เบอร์โทร:</strong> ${devPhone}</p>
    `;

    resultsTableBody.innerHTML = merged.map((item, index) => {
        let rankClass = "";
        let medal = "🎖️";
        let status = "ผ่าน";

        if (index === 0) {
            rankClass = "rank-1";
            medal = "🥇";
            status = "🏆 Champion";
        } else if (index === 1) {
            rankClass = "rank-2";
            medal = "🥈";
            status = "🎖️ Runner-up";
        } else if (index === 2) {
            rankClass = "rank-3";
            medal = "🥉";
            status = "🏅 Bronze";
        }

        return `
            <tr class="${rankClass}">
                <td>${medal} ${index + 1}</td>
                <td>${item.name}</td>
                <td><strong>${item.total}</strong></td>
                <td>${status}</td>
            </tr>
        `;
    }).join("");
}

function exportToCSV() {
    if (!state.results.length) {
        showMessage("resultsMessage", "❌ ยังไม่มีข้อมูลผลการแข่งขัน", "error");
        return;
    }

    const rows = [
        ["อันดับ", "ชื่อผู้เล่น", "คะแนนรวม"],
        ...state.results.map((item, index) => [index + 1, item.name, item.total])
    ];

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `woodball_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    showMessage("resultsMessage", "✓ ดาวน์โหลดผลการแข่งขันสำเร็จแล้ว", "success");
}

function printResults() {
    window.print();
}

function downloadHTML() {
    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>ผลการแข่งขัน Woodball</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { text-align: center; color: #2ecc71; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #333; padding: 10px; text-align: center; }
        th { background-color: #2ecc71; color: white; }
        .rank-1 { background-color: #fff3cd; }
        .rank-2 { background-color: #f0f0f0; }
        .rank-3 { background-color: #ffe4d6; }
    </style>
</head>
<body>
    <h1>🏆 ผลการแข่งขัน WOODBALL</h1>
    <h2>${state.event?.name || "การแข่งขัน Woodball"}</h2>
    
    <p><strong>สถานที่:</strong> ${state.event?.venue || "-"}</p>
    <p><strong>วันที่:</strong> ${state.event?.date || "-"}</p>
    
    <table>
        <thead>
            <tr>
                <th>อันดับ</th>
                <th>ชื่อผู้เล่น</th>
                <th>คะแนนรวม</th>
                <th>สถานะ</th>
            </tr>
        </thead>
        <tbody>
            ${state.results.map((item, index) => {
                let rankClass = "";
                let medal = "🎖️";
                let status = "ผ่าน";
                if (index === 0) {
                    rankClass = "rank-1";
                    medal = "🥇";
                    status = "Champion";
                } else if (index === 1) {
                    rankClass = "rank-2";
                    medal = "🥈";
                    status = "Runner-up";
                } else if (index === 2) {
                    rankClass = "rank-3";
                    medal = "🥉";
                    status = "Bronze";
                }
                return `
                    <tr class="${rankClass}">
                        <td>${medal} ${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.total}</td>
                        <td>${status}</td>
                    </tr>
                `;
            }).join("")}
        </tbody>
    </table>
    
    <p style="text-align: center; margin-top: 40px; color: #666;">
        <em>ผลการแข่งขันนี้ถูกสร้างจาก Woodball System</em>
    </p>
</body>
</html>
    `;

    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `woodball_results_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage("resultsMessage", "✓ ดาวน์โหลดเป็นไฟล์ HTML สำเร็จแล้ว", "success");
}

function clearAllData() {
    if (confirm("⚠️ คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?")) {
        localStorage.removeItem(STORAGE_KEY);
        state = {
            developer: null,
            event: null,
            players: [],
            scores: [],
            results: []
        };
        showMessage("resultsMessage", "✓ ลบข้อมูลทั้งหมดเรียบร้อยแล้ว", "success");
        setTimeout(() => goToPage("menuPage"), 700);
    }
}

// ==================== INITIALIZATION ====================
window.addEventListener("DOMContentLoaded", function () {
    loadData();
    generatePlayerInputs();
    sortAndDisplayResults();

    // Update WhatsApp button
    const phoneNumber = state.developer?.phone || "66XXXXXXXXX";
    const whatsappBtn = document.getElementById("whatsappBtn");
    if (whatsappBtn) {
        whatsappBtn.href = `https://wa.me/${phoneNumber.replace(/^0/, '66').replace(/[-\s]/g, '')}?text=สวัสดีค่ะ%20ขอข้อมูลเพิ่มเติมเกี่ยวกับการแข่งขัน%20Woodball`;
    }
});
