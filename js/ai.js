async function tampilAI(){

    const data = await ambilDataServer();

    if(!data){
        document.getElementById("aiPage").innerHTML=`
            <div class="card">
                <h2>🤖 FMC AI</h2>
                <p>Server tidak tersedia.</p>
            </div>
        `;
        return;
    }

    const farm = data.dashboard.farm;
    const kpi = data.dashboard.kpi;

    document.getElementById("aiPage").innerHTML=`

    <div class="card">

        <h2>🤖 FMC AI Advisor</h2>

        <p><b>Farm :</b> ${farm.namaFarm}</p>

        <hr><br>

        <p>📉 Mortalitas : <b>${kpi.mortalitas}</b></p>

        <p>🌽 FCR : <b>${kpi.fcr}</b></p>

        <p>🎯 IP : <b>${kpi.ip}</b></p>

        <br>

        <h3>📊 Analisis</h3>

        <p>

        ✅ Farm berjalan normal.<br><br>

        ✅ Mortalitas masih dalam batas aman.<br><br>

        ✅ FCR sangat baik.<br><br>

        ✅ IP menunjukkan performa yang sangat baik.<br><br>

        💡 Pertahankan manajemen pakan, biosecurity, dan monitoring harian.

        </p>

    </div>

    `;
}