// ==========================================
// FMC BROILER MOBILE V8
// AI.JS
// ==========================================

async function tampilAI(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("aiPage").innerHTML = `

        <div class="card">

            <h2>🤖 FMC AI</h2>

            <p>Server tidak tersedia.</p>

        </div>

        `;

        return;

    }

    const farm = data.dashboard.farm;
    const kpi = data.dashboard.kpi;
    const flok = data.dashboard.flok || [];

    let terbaik = flok.length ? flok[0] : null;

    flok.forEach(f=>{

        if(
            terbaik &&
            parseFloat(String(f.ip).replace(",", ".")) >
            parseFloat(String(terbaik.ip).replace(",", "."))
        ){

            terbaik = f;

        }

    });

    let analisa = "";

    if(parseFloat(kpi.mortalitas) <= 3){

        analisa += "✅ Mortalitas masih dalam batas normal.<br><br>";

    }else{

        analisa += "⚠️ Mortalitas mulai meningkat, periksa kesehatan ayam.<br><br>";

    }

    if(parseFloat(kpi.fcr) <= 1.6){

        analisa += "✅ FCR sangat baik.<br><br>";

    }else{

        analisa += "⚠️ Efisiensi pakan perlu ditingkatkan.<br><br>";

    }

    analisa += "🎯 Pertahankan biosecurity, kualitas pakan, dan monitoring harian.";

    document.getElementById("aiPage").innerHTML = `

    <div class="card">

        <h2>🤖 FMC AI Advisor</h2>

        <p><b>Farm :</b> ${farm.namaFarm}</p>

        <hr style="margin:15px 0;">

        <p>📉 Mortalitas : <b>${kpi.mortalitas}</b></p>

        <p>🌽 FCR : <b>${kpi.fcr}</b></p>

        <p>🎯 IP : <b>${kpi.ip}</b></p>

        <br>

        <p>🏆 Flok Terbaik :
        <b>${terbaik ? terbaik.nama : "-"}</b></p>

    </div>

    <div class="card">

        <h2>🧠 Analisis AI</h2>

        <p>${analisa}</p>

    </div>

    `;

}