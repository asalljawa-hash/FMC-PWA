// ==========================================
// FMC BOILER MOBILE V11
// HARIAN.JS
// ==========================================

async function tampilHarian(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("harianPage").innerHTML=`

        <div class="card">

            <h2>

                <span class="material-symbols-rounded">

                cloud_off

                </span>

                Server Offline

            </h2>

            <p>Tidak dapat mengambil data harian.</p>

        </div>

        `;

        return;

    }

    const harian=data.harian;

    let html=`

<div class="dashboardHero">

<div>

<div class="heroSmall">

FMC BOILER MOBILE V11

</div>

<h1>

Laporan Harian

</h1>

<div class="heroDate">

<span class="material-symbols-rounded">

calendar_month

</span>

${harian.tanggal}

</div>

</div>

<div class="heroAction"
     onclick="openShareDialog(
    shareHarian,
    exportHarianPDF
)">

    <span class="material-symbols-rounded">
        share
    </span>

</div>

</div>

<div class="card">

<h2>

<span class="material-symbols-rounded">

warning

</span>

Total Kematian Hari Ini

</h2>

<div
style="
font-size:52px;
font-weight:800;
text-align:center;
color:#E53935;
margin:16px 0 8px;
">

${harian.totalMati}

</div>

<p style="text-align:center;">

Ekor

</p>

</div>

`;

    harian.flok.forEach(f=>{

        html+=`

<div class="card">

<div class="farmHeader">

<div>

<h2>

Flok ${f.nama}

</h2>

<small>

Laporan Harian

</small>

</div>

<div class="onlineBadge">

<span class="material-symbols-rounded">

check_circle

</span>

AKTIF

</div>

</div>

<div
style="
display:grid;
grid-template-columns:repeat(3,1fr);
gap:16px;
margin-top:18px;
">

<div>

<div class="kpiIcon">

<span class="material-symbols-rounded">

schedule

</span>

</div>

<h4>Umur</h4>

<b>${f.umur} Hari</b>

</div>

<div>

<div class="kpiIcon">

<span class="material-symbols-rounded">

warning

</span>

</div>

<h4>Mati</h4>

<b>${f.mati}</b>

</div>

<div>

<div class="kpiIcon">

<span class="material-symbols-rounded">

pie_chart

</span>

</div>

<h4>Mortalitas</h4>

<b>${f.mortalitas}</b>

</div>

</div>

</div>

`;

    });

    html+=`

<div
style="
text-align:center;
margin:24px 0;
font-size:12px;
color:#777;
">

Powered by Dasbor FMC Analytics

</div>

`;

    document.getElementById("harianPage").innerHTML=html;

}