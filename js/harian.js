// ==========================================
// FMC BOILER MOBILE V9
// HARIAN.JS
// ==========================================

async function tampilHarian(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("harianPage").innerHTML = `

        <div class="card">

            <h2>❌ Server Offline</h2>

            <p>Tidak dapat mengambil data harian.</p>

        </div>

        `;

        return;

    }

    const harian = data.harian;

    let html = `

    <div class="card farmCard">

        <h2>📅 Laporan Kematian Harian</h2>

        <hr>

        <p><b>Tanggal :</b> ${harian.tanggal}</p>

    </div>

    <div class="card"
    style="
    background:rgba(220,53,69,.12);
    border-left:6px solid #dc3545;
    ">

        <h2>💀 Total Mati Hari Ini</h2>

        <div style="
        font-size:42px;
        font-weight:bold;
        color:#dc3545;
        text-align:center;
        margin-top:10px;
        ">

            ${harian.totalMati}

        </div>

        <center>Ekor</center>

    </div>

    `;

    const warna = [

        "#3498db",
        "#2ecc71",
        "#f39c12",
        "#9b59b6"

    ];

    harian.flok.forEach((f,index)=>{

        html += `

        <div class="card"

        style="
        margin-top:15px;
        background:rgba(255,255,255,.65);
        backdrop-filter:blur(10px);
        border-left:6px solid ${warna[index]};
        ">

            <h2>

                🐔 Flok ${f.nama}

            </h2>

            <table style="width:100%;margin-top:10px;">

                <tr>

                    <td>Umur</td>

                    <td align="right">

                        <b>${f.umur} Hari</b>

                    </td>

                </tr>

                <tr>

                    <td>Kematian</td>

                    <td align="right">

                        <b>${f.mati} Ekor</b>

                    </td>

                </tr>

                <tr>

                    <td>Mortalitas</td>

                    <td align="right">

                        <b>${f.mortalitas}</b>

                    </td>

                </tr>

            </table>

        </div>

        `;

    });

    html += `

    <div
    style="
    text-align:center;
    margin:30px 0;
    color:#888;
    font-size:12px;
    ">

        Powered by Dasbor FMC Analytics

    </div>

    `;

    document.getElementById("harianPage").innerHTML = html;

}