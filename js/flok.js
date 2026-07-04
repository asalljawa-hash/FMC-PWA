// ===============================
// FLOK.JS V5
// ===============================

async function tampilFlok() {

    const data = await ambilDataServer();

    if (!data) {

        document.getElementById("flokPage").innerHTML = `
            <div class="card">
                <h2>❌ Server Offline</h2>
            </div>
        `;

        return;
    }

    const flok = data.dashboard.flok;

    let html = "";

    flok.forEach(item => {

        html += `

        <div class="card">

            <h2>🐔 FLOK ${item.nama}</h2>

            <table style="width:100%;font-size:15px">

                <tr>
                    <td>🐔 Hidup</td>
                    <td align="right"><b>${item.hidup}</b></td>
                </tr>

                <tr>
                    <td>📉 Mortalitas</td>
                    <td align="right"><b>${item.mortalitas}</b></td>
                </tr>

                <tr>
                    <td>⚖️ BB</td>
                    <td align="right"><b>${item.bb}</b></td>
                </tr>

                <tr>
                    <td>🌽 FCR</td>
                    <td align="right"><b>${item.fcr}</b></td>
                </tr>

                <tr>
                    <td>🎯 IP</td>
                    <td align="right"><b>${item.ip}</b></td>
                </tr>

                <tr>
                    <td>📌 Status</td>
                    <td align="right"><b>${item.status}</b></td>
                </tr>

            </table>

        </div>

        `;

    });

    document.getElementById("flokPage").innerHTML = html;

}