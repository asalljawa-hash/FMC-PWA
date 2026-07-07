// ==========================================
// FMC BOILER MOBILE V9
// FLOK.JS
// ==========================================

async function tampilFlok() {

    const data = await ambilDataServer();

    if (!data) {

        document.getElementById("flokPage").innerHTML = `
        <div class="card">
            <h2>❌ Server Offline</h2>
            <p>Data flok tidak tersedia.</p>
        </div>
        `;
        return;

    }

    const flok = data.dashboard.flok || [];

    let html = "<h2>🐔 Data Flok</h2>";

    flok.forEach(item => {

        html += `

        <div class="card">

            <h2>${item.nama}</h2>

            <table style="width:100%">

                <tr>
                    <td>🐔 Ayam Hidup</td>
                    <td><b>${item.hidup ?? "-"}</b></td>
                </tr>

                <tr>
                    <td>💀 Mati</td>
                    <td><b>${item.mati ?? "-"}</b></td>
                </tr>

                <tr>
                    <td>📉 Mortalitas</td>
                    <td><b>${item.mortalitas ?? "-"}</b></td>
                </tr>

                <tr>
                    <td>🌽 FCR</td>
                    <td><b>${item.fcr ?? "-"}</b></td>
                </tr>

                <tr>
                    <td>🎯 IP</td>
                    <td><b>${item.ip ?? "-"}</b></td>
                </tr>

            </table>

        </div>

        `;

    });

    document.getElementById("flokPage").innerHTML = html;

}