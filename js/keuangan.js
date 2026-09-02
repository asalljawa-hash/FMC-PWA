// ==========================================
// FMC BOILER MOBILE V11
// KEUANGAN.JS
// FORMAT ANGKA PATCH — DATA/API TETAP
// ==========================================

/* =========================================================
   FORMAT ANGKA
   - Tidak mengubah nilai dari API.
   - Hanya merapikan tampilan angka.
   - Format Indonesia: 12.000 / 0,72 / Rp 2.569.
   ========================================================= */

function formatKeuanganNumber(value, decimals = 2) {
    if (value === null || value === undefined || value === "") return "-";

    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    }).format(n);
}

function formatKeuanganInteger(value) {
    if (value === null || value === undefined || value === "") return "-";

    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);

    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0
    }).format(n);
}

function formatKeuanganRupiah(value, decimals = 0) {
    if (value === null || value === undefined || value === "") {
        return "Rp -";
    }

    const n = Number(value);
    if (!Number.isFinite(n)) {
        return "Rp " + String(value);
    }

    return "Rp " + new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    }).format(n);
}


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

    const labaNegatif=Number(k.estimasiLaba) < 0;

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

<div class="heroAction"
     onclick="openShareDialog(
    shareKeuangan,
    exportKeuanganPDF
)">

    <span class="material-symbols-rounded">
        share
    </span>

</div>

</div>


<div class="gridCard">

${cardKeuangan(
    "📦",
    "Total Ekor Panen",
    formatKeuanganInteger(k.totalEkor)
)}

${cardKeuangan(
    "scale",
    "Total Tonase",
    formatKeuanganNumber(k.totalTonase, 2)
)}

${cardKeuangan(
    "task_alt",
    "Flok Siap Panen",
    formatKeuanganInteger(k.flokPanen)
)}

${cardKeuangan(
    "workspace_premium",
    "BB Tertinggi",
    formatKeuanganNumber(k.bbTertinggi, 2)
)}

${cardKeuangan(
    "calendar_month",
    "Umur Tertua",
    formatKeuanganInteger(k.umurTertua)
)}

${cardKeuangan(
    "military_tech",
    "Flok Terbaik",
    k.flokTerbaik || "-"
)}

${cardKeuangan(
    "🍗",
    "Konsumsi Pakan",
    formatKeuanganNumber(k.totalPakan, 2) + " Kg"
)}

${cardKeuangan(
    "payments",
    "Biaya Operasional",
    formatKeuanganRupiah(k.biayaOperasional)
)}

${cardKeuangan(
    "trending_up",
    "Estimasi Omset",
    formatKeuanganRupiah(k.estimasiOmset)
)}

${cardKeuangan(
    "receipt_long",
    "Cost / Ekor",
    formatKeuanganRupiah(k.costEkor)
)}

${cardKeuangan(
    "balance",
    "Cost / Kg",
    formatKeuanganRupiah(k.costKg)
)}

${cardKeuangan(
    "analytics",
    "Margin Produksi",
    formatKeuanganNumber(k.marginProduksi, 2)
)}

${cardKeuangan(
    "redeem",
    "Bonus Kematian",
    formatKeuanganRupiah(k.bonusKematian || 0)
)}

${cardKeuangan(
    "card_giftcard",
    "Bonus Pasar",
    formatKeuanganRupiah(k.bonusPasar || 0)
)}

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
font-size:26px;
font-weight:700;
margin-top:16px;
line-height:1.2;
color:${labaNegatif ? "#E53935" : "#16A34A"};
">

${formatKeuanganRupiah(k.estimasiLaba)}

</div>

</div>


<div class="card">

<h2>

<span class="material-symbols-rounded">
paid
</span>

Profit / Ekor

</h2>

<div
style="
font-size:24px;
font-weight:700;
margin-top:16px;
line-height:1.2;
color:var(--primary);
">

${formatKeuanganRupiah(k.profitOwner)}

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
