// ===============================
// DASHBOARD.JS V5
// ===============================

async function tampilDashboard() {

    const data = await ambilDataServer();

    if (!data) {

        document.getElementById("dashboardPage").innerHTML = `
            <div class="card">
                <h2>❌ Server Offline</h2>
                <p>Tidak dapat mengambil data.</p>
            </div>
        `;

        return;
    }

    const farm = data.dashboard.farm;
    const kpi = data.dashboard.kpi;

    document.getElementById("dashboardPage").innerHTML = `

    <div class="card">
        <h2>🐔 ${farm.namaFarm}</h2>
        <p>📅 Chick In : ${farm.chickIn}</p>
        <p>🏷️ Periode : ${farm.periode}</p>
    </div>

    <div class="gridCard">

        <div class="card">
            <div class="cardTitle">🐣 DOC IN</div>
            <div class="cardValue">${kpi.docIn}</div>
        </div>

        <div class="card">
            <div class="cardTitle">🐔 Ayam Hidup</div>
            <div class="cardValue">${kpi.ayamHidup}</div>
        </div>

        <div class="card">
            <div class="cardTitle">💀 Mati</div>
            <div class="cardValue">${kpi.mati}</div>
        </div>

        <div class="card">
            <div class="cardTitle">❌ Afkir</div>
            <div class="cardValue">${kpi.afkir}</div>
        </div>

        <div class="card">
            <div class="cardTitle">📉 Mortalitas</div>
            <div class="cardValue">${kpi.mortalitas}</div>
        </div>

        <div class="card">
            <div class="cardTitle">📉 Deplesi</div>
            <div class="cardValue">${kpi.deplesi}</div>
        </div>

        <div class="card">
            <div class="cardTitle">🌽 FCR</div>
            <div class="cardValue">${kpi.fcr}</div>
        </div>

        <div class="card">
            <div class="cardTitle">🎯 IP</div>
            <div class="cardValue">${kpi.ip}</div>
        </div>

    </div>

    <div style="text-align:center;margin-top:15px;font-size:12px;color:#777;">
        🔄 Data Real Time
    </div>

    `;

}