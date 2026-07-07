// ==========================================
// FMC BROILER MOBILE V8
// KEUANGAN.JS
// ==========================================

async function tampilKeuangan(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("keuanganPage").innerHTML = `

        <div class="card">

            <h2>❌ Server Offline</h2>

            <p>Data keuangan tidak tersedia.</p>

        </div>

        `;

        return;

    }

    const keuangan = data.keuangan;

    document.getElementById("keuanganPage").innerHTML = `

    <div class="card">

        <h2>💰 Ringkasan Keuangan</h2>

        <table>

            <tr>
                <td>💵 Pendapatan</td>
                <td><b>Rp ${keuangan.pendapatan}</b></td>
            </tr>

            <tr>
                <td>🛒 Biaya Pakan</td>
                <td><b>Rp ${keuangan.pakan}</b></td>
            </tr>

            <tr>
                <td>🐣 Biaya DOC</td>
                <td><b>Rp ${keuangan.doc}</b></td>
            </tr>

            <tr>
                <td>💊 Obat & Vaksin</td>
                <td><b>Rp ${keuangan.obat}</b></td>
            </tr>

            <tr>
                <td>⚡ Operasional</td>
                <td><b>Rp ${keuangan.operasional}</b></td>
            </tr>

            <tr>
                <td><b>📈 Laba Bersih</b></td>
                <td><b style="color:#0B8F43;">
                    Rp ${keuangan.laba}
                </b></td>
            </tr>

        </table>

    </div>

    `;
}