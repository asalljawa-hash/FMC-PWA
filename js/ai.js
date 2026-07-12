// ==========================================
// FMC BOILER MOBILE V11
// AI.JS
// ==========================================

async function tampilAI(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("aiPage").innerHTML=`

        <div class="card">

            <h2>

                <span class="material-symbols-rounded">

                cloud_off

                </span>

                FMC AI Offline

            </h2>

            <p>Server tidak tersedia.</p>

        </div>

        `;

        return;

    }

    const farm=data.dashboard.farm;
    const kpi=data.dashboard.kpi;
    const flok=data.dashboard.flok || [];

    let terbaik=flok.length?flok[0]:null;

    flok.forEach(f=>{

        if(
            terbaik &&
            parseFloat(String(f.ip).replace(",","."))>
            parseFloat(String(terbaik.ip).replace(",","."))
        ){

            terbaik=f;

        }

    });

    let analisa=[];

    if(parseFloat(kpi.mortalitas)<=3){

        analisa.push({
            icon:"check_circle",
            text:"Mortalitas masih dalam batas normal."
        });

    }else{

        analisa.push({
            icon:"warning",
            text:"Mortalitas mulai meningkat. Periksa kesehatan ayam."
        });

    }

    if(parseFloat(kpi.fcr)<=1.6){

        analisa.push({
            icon:"check_circle",
            text:"Nilai FCR sangat baik."
        });

    }else{

        analisa.push({
            icon:"warning",
            text:"Efisiensi pakan perlu ditingkatkan."
        });

    }

    analisa.push({
        icon:"lightbulb",
        text:"Pertahankan biosecurity, kualitas pakan dan monitoring harian."
    });

    let html=`

<div class="dashboardHero">

<div>

<div class="heroSmall">

FMC BOILER MOBILE V11

</div>

<h1>

AI Advisor

</h1>

<div class="heroDate">

<span class="material-symbols-rounded">

smart_toy

</span>

Analisis Cerdas Produksi

</div>

</div>

<div class="heroLogo">

<span class="material-symbols-rounded">

psychology

</span>

</div>

</div>

<div class="card farmCard">

<div class="farmHeader">

<div>

<h2>

<span class="material-symbols-rounded">

home

</span>

${farm.namaFarm}

</h2>

<small>

AI Monitoring

</small>

</div>

<div class="onlineBadge">

<span class="material-symbols-rounded">

auto_awesome

</span>

ACTIVE

</div>

</div>

</div>

<div class="gridCard">

${aiCard("pie_chart","Mortalitas",kpi.mortalitas)}

${aiCard("🍗","FCR",kpi.fcr)}

${aiCard("🏆","IP",kpi.ip)}

${aiCard("🥇","Flok Terbaik",terbaik?terbaik.nama:"-")}

</div>

<div class="card">

<h2>

<span class="material-symbols-rounded">

tips_and_updates

</span>

Rekomendasi FMC AI

</h2>

`;

    analisa.forEach(item=>{

        html+=`

<div style="
display:flex;
align-items:flex-start;
gap:10px;
margin:14px 0;
">

<span class="material-symbols-rounded"
style="
color:var(--primary);
">

${item.icon}

</span>

<div>

${item.text}

</div>

</div>

`;

    });

    html+=`

</div>

<center
style="
margin:20px;
font-size:12px;
color:#777;
">

Powered by FMC AI Analytics

</center>

`;

    document.getElementById("aiPage").innerHTML=html;

}

function aiCard(icon,judul,nilai){

    const iconHtml=

    icon.length<=2

    ? icon

    : `<span class="material-symbols-rounded">${icon}</span>`;

    return`

<div class="card">

<div class="kpiIcon">

${iconHtml}

</div>

<h4>

${judul}

</h4>

<b>

${nilai}

</b>

</div>

`;

}