// ==========================================
// FMC BOILER MOBILE V9
// DASHBOARD.JS
// ==========================================

async function tampilDashboard() {

    const data = await ambilDataServer();

    if (!data) {

        document.getElementById("dashboardPage").innerHTML = `
            <div class="card">
                <h2>❌ Server Offline</h2>
                <p>Tidak dapat mengambil data dari Google Sheet.</p>
            </div>
        `;
        return;
    }

    const farm = data.dashboard.farm;
    const kpi = data.dashboard.kpi;
    const flok = data.dashboard.flok || [];
    const ai = data.ai || [];

    let html = `

    <div class="card farmCard">

        <div class="farmHeader">
            <div>
                <h2>🏠 ${farm.namaFarm}</h2>
                <small>Periode ${farm.periode}</small>
            </div>

            <div class="onlineBadge">
                🟢 ONLINE
            </div>

        </div>

        <hr>

        <div class="farmInfo">
            Chick In :
            <b>${farm.chickIn}</b>
        </div>

    </div>

    <h3>KPI</h3>

    <div class="gridCard">

        ${kpiCard("🐣","DOC",kpi.docIn)}
        ${kpiCard("🐔","Ayam Hidup",kpi.ayamHidup)}
        ${kpiCard("💀","Mati",kpi.mati)}
        ${kpiCard("🚫","Afkir",kpi.afkir)}
        ${kpiCard("❤️","Mortalitas",kpi.mortalitas)}
        ${kpiCard("📉","Deplesi",kpi.deplesi)}
        ${kpiCard("🌽","FCR",kpi.fcr)}
        ${kpiCard("💰","IP",kpi.ip)}

    </div>

    <h3>Ringkasan Flok</h3>

    <div class="gridCard">
`;

    flok.forEach(f => {

        html += `
        <div class="card">

            <h3>Flok ${f.nama}</h3>

            <p>🐔 ${f.hidup}</p>
            <p>💀 ${f.mortalitas}</p>
            <p>🌽 ${f.fcr}</p>
            <p>💰 ${f.ip}</p>

            <b>${f.status}</b>

        </div>
        `;

    });

    html += `
    </div>

    <div class="card">

        <h2>🤖 AI Insight</h2>
`;

    if (ai.length > 0) {

        ai.forEach(item => {

            html += `<p>✅ ${item}</p>`;

        });

    } else {

        html += `<p>Belum ada insight.</p>`;

    }

    html += `
    </div>

    <center style="margin:20px;color:#777">

        Update terakhir :
        ${new Date().toLocaleString("id-ID")}

    </center>
    `;

    document.getElementById("dashboardPage").innerHTML = html;

}

// ==========================================

function kpiCard(icon, judul, nilai){

    return `
    <div class="card">

        <div style="font-size:28