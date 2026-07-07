// ==========================================
// FMC BROILER MOBILE V8
// HARIAN.JS
// ==========================================

async function tampilHarian(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("harianPage").innerHTML=`

        <div class="card">

            <h2>❌ Server Offline</h2>

            <p>Data harian tidak tersedia.</p>

        </div>

        `;

        return;

    }

    const harian = data.harian || [];

    let html = "";

    let totalMati = 0;
    let totalAfkir = 0;
    let totalPakan = 0;

    harian.forEach(item=>{

        totalMati += Number(item.mati || 0);
        totalAfkir += Number(item.afkir || 0);
        totalPakan += Number(item.pakan || 0);

        html += `

        <div class="card">

            <h2>📅 ${item.tanggal}</h2>

            <table>

                <tr>
                    <td>☠️ Mati</td>
                    <td><b>${item.mati}</b></td>
                </tr>

                <tr>
                    <td>❌ Afkir</td>
                    <td><b>${item.afkir}</b></td>
                </tr>

                <tr>
                    <td>🌽 Pakan</td>
                    <td><b>${item.pakan} Kg</b></td>
                </tr>

                <tr>
                    <td>💧 Air Minum</td>
                    <td><b>${item.air}</b></td>
                </tr>

            </table>

        </div>

        `;

    });

    html += `

    <div class="card">

        <h2>📊 Ringkasan Harian</h2>

        <table>

            <tr>
                <td>Total Mati</td>
                <td><b>${totalMati}</b></td>
            </tr>

            <tr>
                <td>Total Afkir</td>
                <td><b>${totalAfkir}</b></td>
            </tr>

            <tr>
                <td>Total Pakan</td>
                <td><b>${totalPakan} Kg</b></td>
            </tr>

        </table>

    </div>

    `;

    document.getElementById("harianPage").innerHTML = html;

}