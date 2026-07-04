// ==========================================
// FMC BROILER MOBILE V5
// harian.js
// ==========================================

async function tampilHarian() {

    const data = await ambilDataServer();

    if (!data) {

        document.getElementById("harianPage").innerHTML = `
            <div class="card">
                <h2>❌ Data Harian tidak tersedia</h2>
            </div>
        `;

        return;
    }

    const harian = data.harian;

    let html = `
        <div class="card">
            <h2>📋 Data Harian</h2>
            <p><b>Tanggal :</b> ${harian.tanggal}</p>
            <p><b>Total Mati :</b> ${harian.totalMati} Ekor</p>
        </div>
    `;

    harian.flok.forEach(item => {

        html += `
            <div class="card">

                <div class="cardTitle">
                    🐔 FLOK ${item.nama}
                </div>

                <p>📅 Umur : ${item.umur} Hari</p>

                <p>☠️ Mati : ${item.mati} Ekor</p>

                <p>📉 Mortalitas : ${item.mortalitas}</p>

            </div>
        `;

    });

    document.getElementById("harianPage").innerHTML = html;

}