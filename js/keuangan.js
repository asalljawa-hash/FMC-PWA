// ==========================================
// FMC BOILER MOBILE V9
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

    const k = data.keuangan;

    const labaNegatif = String(k.estimasiLaba).includes("-");

    let html = `

    <div class="card farmCard">

        <h2>💰 Ringkasan Produksi & Keuangan</h2>

        <small>Realtime dari Dashboard Google Sheet</small>

    </div>

    <div class="gridCard">

        ${cardKeuangan("🐔","Total Ekor Panen",k.totalEkor)}
        ${cardKeuangan("⚖️","Total Tonase",k.totalTonase)}
        ${cardKeuangan("✅","Flok Siap Panen",k.flokPanen)}
        ${cardKeuangan("🏆","BB Tertinggi",k.bbTertinggi)}
        ${cardKeuangan("📆","Umur Tertua",k.umurTertua)}
        ${cardKeuangan("⭐","Flok Terbaik",k.flokTerbaik)}
        ${cardKeuangan("🌽","Konsumsi Pakan",k.totalPakan+" Kg")}
        ${cardKeuangan("💰","Biaya Operasional","Rp "+k.biayaOperasional)}
        ${cardKeuangan("📈","Estimasi Omset","Rp "+k.estimasiOmset)}
        ${cardKeuangan("🗒","Cost / Ekor",k.costEkor || "-")}
        ${cardKeuangan("⚖️","Cost / Kg",k.costKg || "-")}
        ${cardKeuangan("📊","Margin Produksi",k.marginProduksi || "-")}
        ${cardKeuangan("🎁","Bonus Kematian","Rp "+(k.bonusKematian || "0"))}
        ${cardKeuangan("🎁","Bonus Pasar","Rp "+(k.bonusPasar || "0"))}

    </div>

    <div class="card"
    style="
    margin-top:20px;
    border-left:6px solid ${labaNegatif ? "#e53935":"#2e7d32"};
    ">

        <h2>💹 Estimasi Laba Produksi</h2>

        <h1 style="
        margin-top:10px;
        color:${labaNegatif ? "#e53935":"#2e7d32"};
        ">

        Rp ${k.estimasiLaba}

        </h1>

    </div>

    <div class="card"
    style="
    margin-top:15px;
    border-left:6px solid #0B8F43;
    ">

        <h2>👑 Profit / Ekor Owner</h2>

        <h1 style="
        margin-top:10px;
        color:#0B8F43;
        ">

        Rp ${k.profitOwner || "-"}

        </h1>

    </div>

    <center style="margin:20px;color:#777;">

        Update :
        ${new Date().toLocaleString("id-ID")}

    </center>

    `;

    document.getElementById("keuanganPage").innerHTML = html;

}

// ==========================================

function cardKeuangan(icon,judul,nilai){

    return `

    <div class="card">

        <div style="font-size:28px;">
            ${icon}
        </div>

        <div style="
        margin-top:8px;
        color:#777;
        font-size:13px;
        ">

            ${judul}

        </div>

        <div style="
        margin-top:8px;
        font-size:20px;
        font-weight:bold;
        color:#0B8F43;
        ">

            ${nilai}

        </div>

    </div>

    `;

}