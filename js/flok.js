// ==========================================
// FMC BOILER MOBILE V11
// FLOK.JS
// ==========================================

async function tampilFlok(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("flokPage").innerHTML=`

        <div class="card">

            <h2>

                <span class="material-symbols-rounded">

                cloud_off

                </span>

                Server Offline

            </h2>

            <p>Data flok tidak tersedia.</p>

        </div>

        `;

        return;

    }

    const flok=data.dashboard.flok || [];

    let html=`

<div class="dashboardHero">

    <div>

        <div class="heroSmall">

            FMC BOILER MOBILE V11

        </div>

        <h1>

            Data Flok

        </h1>

        <div class="heroDate">

            <span class="material-symbols-rounded">

           pets

            </span>

            Monitoring Produksi

        </div>

    </div>

   

</div>

`;

    flok.forEach(item=>{

        html+=`

<div class="card">

<div class="farmHeader">

<div>

<h2>

Flok ${item.nama}

</h2>

<small>

Monitoring Produksi

</small>

</div>

<div class="onlineBadge">

<span class="material-symbols-rounded">

verified

</span>

AKTIF

</div>

</div>

<div style="
display:grid;
grid-template-columns:repeat(2,1fr);
gap:16px;
margin-top:18px;">

<div>

<div class="kpiIcon">

<span class="material-symbols-rounded">

🐔

</span>

</div>

<h4>Ayam Hidup</h4>

<b>${item.hidup ?? "-"}</b>

</div>

<div>

<div class="kpiIcon">

<span class="material-symbols-rounded">

💀

</span>

</div>

<h4>Mati</h4>

<b>${item.mati ?? "-"}</b>

</div>

<div>

<div class="kpiIcon">

📉

</div>

<h4>Mortalitas</h4>

<b>${item.mortalitas ?? "-"}</b>

</div>

<div>

<div class="kpiIcon">

🍗

</div>

<h4>FCR</h4>

<b>${item.fcr ?? "-"}</b>

</div>

<div>

<div class="kpiIcon">

<span class="material-symbols-rounded">

🏆

</span>

</div>

<h4>IP</h4>

<b>${item.ip ?? "-"}</b>

</div>

<div>

<div class="kpiIcon">

<span class="material-symbols-rounded">

assignment_turned_in

</span>

</div>

<h4>Status</h4>

<b>${item.status ?? "BELUM"}</b>

</div>

</div>

</div>

`;

    });

    document.getElementById("flokPage").innerHTML=html;

}