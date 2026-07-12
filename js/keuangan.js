// ==========================================
// FMC BOILER MOBILE V11
// KEUANGAN.JS
// ==========================================

async function tampilKeuangan(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("keuanganPage").innerHTML=`

        <div class="card">

            <h2>

                <span class="material-symbols-rounded">

                cloud_off

                </span>

                Server Offline

            </h2>

            <p>Data keuangan tidak tersedia.</p>

        </div>

        `;

        return;

    }

    const k=data.keuangan;

    const labaNegatif=String(k.estimasiLaba).includes("-");

    let html=`

<div class="dashboardHero">

<div>

<div class="heroSmall">

FMC BOILER MOBILE V11

</div>

<h1>

Keuangan

</h1>

<div class="heroDate">

<span class="material-symbols-rounded">

payments

</span>

Ringkasan Produksi & Keuangan

</div>

</div>

<div class="heroLogo">

<span class="material-symbols-rounded">

account_balance_wallet

</span>

</div>

</div>

<div class="gridCard">

${cardKeuangan("📦","Total Ekor Panen",k.totalEkor)}

${cardKeuangan("scale","Total Tonase",k.totalTonase)}

${cardKeuangan("task_alt","Flok Siap Panen",k.flokPanen)}

${cardKeuangan("workspace_premium","BB Tertinggi",k.bbTertinggi)}

${cardKeuangan("calendar_month","Umur Tertua",k.umurTertua)}

${cardKeuangan("military_tech","Flok Terbaik",k.flokTerbaik)}

${cardKeuangan("🍗","Konsumsi Pakan",k.totalPakan+" Kg")}

${cardKeuangan("payments","Biaya Operasional","Rp "+k.biayaOperasional)}

${cardKeuangan("trending_up","Estimasi Omset","Rp "+k.estimasiOmset)}

${cardKeuangan("receipt_long","Cost / Ekor",k.costEkor||"-")}

${cardKeuangan("balance","Cost / Kg",k.costKg||"-")}

${cardKeuangan("analytics","Margin Produksi",k.marginProduksi||"-")}

${cardKeuangan("redeem","Bonus Kematian","Rp "+(k.bonusKematian||"0"))}

${cardKeuangan("card_giftcard","Bonus Pasar","Rp "+(k.bonusPasar||"0"))}

</div>

<div class="card">

<h2>

<span class="material-symbols-rounded">

monitoring

</span>

Estimasi Laba Produksi

</h2>

<div
style="
font-size:38px;
font-weight:800;
margin-top:18px;
color:${labaNegatif?"#E53935":"#16A34A"};
">

Rp ${k.estimasiLaba}

</div>

</div>

<div class="card">

<h2>

<span class="material-symbols-rounded">

paid

</span>

Profit Owner / Ekor

</h2>

<div
style="
font-size:34px;
font-weight:800;
margin-top:18px;
color:var(--primary);
">

Rp ${k.profitOwner||"-"}

</div>

</div>

<center
style="
margin:22px;
font-size:12px;
color:#777;
">

Update :

${new Date().toLocaleString("id-ID")}

</center>

`;

    document.getElementById("keuanganPage").innerHTML=html;

}

// ==========================================

function cardKeuangan(icon,judul,nilai){

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