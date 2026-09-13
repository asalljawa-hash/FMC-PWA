// ==========================================
// FMC BOILER MOBILE V11
// AI.JS
// ==========================================

async function tampilAI(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("aiPage").innerHTML=`

        <div class="aiProPage">

            <div class="aiProOffline">

                <div class="aiProIcon">
                    <span class="material-symbols-rounded">cloud_off</span>
                </div>

                <div>
                    <span class="aiProEyebrow">FMC AI PRO</span>
                    <h2>AI Advisor Offline</h2>
                    <p>Server tidak tersedia. Analisis belum dapat diperbarui.</p>
                </div>

            </div>

        </div>

        `;

        return;

    }

    const dashboard=data.dashboard || {};
    const farm=dashboard.farm || {};
    const kpi=dashboard.kpi || {};
    const flok=Array.isArray(dashboard.flok) ? dashboard.flok : [];

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

    const mortalitasValue = Number(
        String(kpi.mortalitas ?? "").replace(",", ".")
    );

    const fcrValue = Number(
        String(kpi.fcr ?? "").replace(",", ".")
    );

    if(Number.isFinite(mortalitasValue)){

        if(mortalitasValue <= 0.03){

            analisa.push({
                icon:"check_circle",
                tone:"good",
                title:"Mortalitas",
                text:"Mortalitas masih dalam batas normal."
            });

        }else{

            analisa.push({
                icon:"warning",
                tone:"warning",
                title:"Mortalitas",
                text:"Mortalitas mulai meningkat. Periksa kesehatan ayam."
            });

        }

    }else{

        analisa.push({
            icon:"info",
            tone:"info",
            title:"Mortalitas",
            text:"Data mortalitas belum tersedia."
        });

    }

    if(Number.isFinite(fcrValue) && fcrValue > 0){

        if(fcrValue <= 1.6){

            analisa.push({
                icon:"check_circle",
                tone:"good",
                title:"Efisiensi pakan",
                text:"Nilai FCR sangat baik."
            });

        }else{

            analisa.push({
                icon:"warning",
                tone:"warning",
                title:"Efisiensi pakan",
                text:"Efisiensi pakan perlu ditingkatkan."
            });

        }

    }else{

        analisa.push({
            icon:"info",
            tone:"info",
            title:"Efisiensi pakan",
            text:"Data FCR belum tersedia sehingga efisiensi pakan belum dapat dinilai."
        });

    }

    analisa.push({
        icon:"lightbulb",
        tone:"info",
        title:"Monitoring",
        text:"Pertahankan biosecurity, kualitas pakan dan monitoring harian."
    });

    let html=`

<div class="aiProPage">

    <div class="aiProHero">

        <div class="aiProHeroMain">

            <div class="aiProBadge">
                <span class="material-symbols-rounded">auto_awesome</span>
                FMC AI PRO
            </div>

            <h1>AI Advisor</h1>

            <p>
                Analisis cerdas berdasarkan data produksi yang tersedia.
            </p>

            <div class="aiProHeroMeta">
                <span>
                    <span class="material-symbols-rounded">smart_toy</span>
                    Analytics Engine
                </span>
                <span>
                    <span class="material-symbols-rounded">sync</span>
                    Data server
                </span>
            </div>

        </div>

        <div class="aiProHeroOrb">
            <span class="material-symbols-rounded">psychology</span>
        </div>

    </div>

    <div class="aiProFarm">

        <div class="aiProFarmIdentity">

            <div class="aiProFarmIcon">
                <span class="material-symbols-rounded">home</span>
            </div>

            <div>
                <span class="aiProLabel">FARM MONITORING</span>
                <h2>${farm.namaFarm}</h2>
                <small>AI production overview</small>
            </div>

        </div>

        <div class="aiProActive">
            <span class="aiProActiveDot"></span>
            ACTIVE
        </div>

    </div>

    <div class="aiProSectionHead">

        <div>
            <span class="aiProEyebrow">PERFORMANCE SNAPSHOT</span>
            <h2>Ringkasan AI</h2>
        </div>

        <span class="aiProSectionIcon material-symbols-rounded">monitoring</span>

    </div>

    <div class="aiProMetricGrid">

        <div class="aiProMetric aiProMetricMortality">
            <div class="aiProMetricTop">
                <span class="aiProMetricIcon material-symbols-rounded">pie_chart</span>
                <span class="aiProMetricTag">KPI</span>
            </div>
            <span class="aiProMetricLabel">Mortalitas</span>
            <strong>${aiMortalitas(kpi.mortalitas)}</strong>
            <small>Global production</small>
        </div>

        <div class="aiProMetric aiProMetricFcr">
            <div class="aiProMetricTop">
                <span class="aiProMetricIcon">🍗</span>
                <span class="aiProMetricTag">KPI</span>
            </div>
            <span class="aiProMetricLabel">FCR</span>
            <strong>${aiFCR(kpi.fcr)}</strong>
            <small>Feed efficiency</small>
        </div>

        <div class="aiProMetric aiProMetricIp">
            <div class="aiProMetricTop">
                <span class="aiProMetricIcon">🏆</span>
                <span class="aiProMetricTag">KPI</span>
            </div>
            <span class="aiProMetricLabel">IP</span>
            <strong>${aiIP(kpi.ip)}</strong>
            <small>Production index</small>
        </div>

        <div class="aiProMetric aiProMetricBest">
            <div class="aiProMetricTop">
                <span class="aiProMetricIcon">🥇</span>
                <span class="aiProMetricTag">BEST</span>
            </div>
            <span class="aiProMetricLabel">FLOK Terbaik</span>
            <strong>${terbaik?terbaik.nama:"-"}</strong>
            <small>IP tertinggi</small>
        </div>

    </div>

    <div class="aiProSectionHead aiProRecommendationHead">

        <div>
            <span class="aiProEyebrow">DECISION SUPPORT</span>
            <h2>Rekomendasi FMC AI</h2>
        </div>

        <span class="aiProSectionIcon material-symbols-rounded">tips_and_updates</span>

    </div>

    <div class="aiProRecommendation">

`;

    analisa.forEach(item=>{

        html+=`

        <div class="aiProInsight aiProInsight-${item.tone}">

            <div class="aiProInsightIcon">
                <span class="material-symbols-rounded">${item.icon}</span>
            </div>

            <div class="aiProInsightBody">

                <div class="aiProInsightTitle">
                    ${item.title}
                    <span>AI INSIGHT</span>
                </div>

                <p>${item.text}</p>

            </div>

        </div>

`;

    });

    html+=`

    </div>

    <div class="aiProFooter">
        <span class="material-symbols-rounded">verified</span>
        FMC AI Analytics · Source: data produksi server
    </div>

</div>

`;

    document.getElementById("aiPage").innerHTML=html;

}

// ==========================================
// FORMAT ANGKA AI
// ==========================================
// Tampilan AI hanya memformat angka untuk UI.
// Nilai sumber dari server tidak diubah.
// Mortalitas dari backend berupa rasio 0..1,
// sehingga ditampilkan sebagai persen.
// ==========================================

function aiNumber(value, decimals = 2){

    const n =
        Number(
            String(
                value ?? ""
            )
            .replace(",", ".")
        );

    if(!Number.isFinite(n)){
        return "-";
    }

    return n.toLocaleString(
        "id-ID",
        {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }
    );

}


function aiMortalitas(value){

    const n =
        Number(
            String(
                value ?? ""
            )
            .replace(",", ".")
        );

    if(!Number.isFinite(n)){
        return "-";
    }

    return (
        n * 100
    ).toLocaleString(
        "id-ID",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + "%";

}


function aiFCR(value){

    const n =
        Number(
            String(
                value ?? ""
            )
            .replace(",", ".")
        );

    if(!Number.isFinite(n)){
        return "-";
    }

    return n.toLocaleString(
        "id-ID",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function aiIP(value){

    const n =
        Number(
            String(
                value ?? ""
            )
            .replace(",", ".")
        );

    if(!Number.isFinite(n)){
        return "-";
    }

    return n.toLocaleString(
        "id-ID",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}
