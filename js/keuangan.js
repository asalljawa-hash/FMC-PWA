// ==========================================
// FMC BOILER MOBILE V11
// KEUANGAN.JS
// VISUAL GRAPH V2 — DATA/API TETAP
// ==========================================

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
    if (value === null || value === undefined || value === "") return "Rp -";
    const n = Number(value);
    if (!Number.isFinite(n)) return "Rp " + String(value);
    return "Rp " + new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    }).format(n);
}

function keuanganBarPct_(value, max){
    const n = Number(value);
    if(!Number.isFinite(n) || n <= 0) return 0;
    return Math.max(0, Math.min(100, (n / Math.max(max, 1)) * 100));
}

function cardKeuangan(icon, judul, nilai){

    const iconHtml =
        icon.length <= 2
        ? icon
        : `<span class="material-symbols-rounded">${icon}</span>`;

    return `
    <div class="card fmcFinanceMetric">
        <div class="kpiIcon">${iconHtml}</div>
        <h4>${judul}</h4>
        <b>${nilai}</b>
    </div>`;
}

async function tampilKeuangan(){

    const data = await ambilDataServer();

    if(!data){
        document.getElementById("keuanganPage").innerHTML = `
        <div class="card">
            <h2>
                <span class="material-symbols-rounded">cloud_off</span>
                Server Offline
            </h2>
            <p>Data keuangan tidak tersedia.</p>
        </div>`;
        return;
    }

    const k = data.keuangan || {};
    const laba = Number(k.estimasiLaba);
    const labaNegatif = Number.isFinite(laba) && laba < 0;

    const omset = Math.max(Number(k.estimasiOmset) || 0, 0);
    const biaya = Math.max(Number(k.biayaOperasional) || 0, 0);
    const profit = Math.abs(Number(k.estimasiLaba) || 0);
    const financeMax = Math.max(omset, biaya, profit, 1);

    let html = `
<div class="dashboardHero">
    <div>
        <div class="heroSmall">FMC BOILER MOBILE V11</div>
        <h1>Keuangan</h1>
        <div class="heroDate">
            <span class="material-symbols-rounded">payments</span>
            Ringkasan Produksi & Keuangan
        </div>
    </div>

    <div class="heroAction"
         onclick="openShareDialog(shareKeuangan, exportKeuanganPDF)">
        <span class="material-symbols-rounded">share</span>
    </div>
</div>

<div class="fmcFinanceGraph card">
    <div class="fmcGraphTitle">
        <div>
            <h2>Grafik Keuangan</h2>
            <small>Perbandingan nilai utama periode berjalan</small>
        </div>
        <span class="material-symbols-rounded">monitoring</span>
    </div>

    <div class="fmcFinanceBars">

        <div class="fmcBarRow">
            <div class="fmcBarLabel">
                <span>Estimasi Omset</span>
                <b>${formatKeuanganRupiah(k.estimasiOmset)}</b>
            </div>
            <div class="fmcBarTrack">
                <div class="fmcBarFill fmcBarGreen"
                     style="width:${keuanganBarPct_(omset, financeMax)}%"></div>
            </div>
        </div>

        <div class="fmcBarRow">
            <div class="fmcBarLabel">
                <span>Biaya Operasional</span>
                <b>${formatKeuanganRupiah(k.biayaOperasional)}</b>
            </div>
            <div class="fmcBarTrack">
                <div class="fmcBarFill fmcBarOrange"
                     style="width:${keuanganBarPct_(biaya, financeMax)}%"></div>
            </div>
        </div>

        <div class="fmcBarRow">
            <div class="fmcBarLabel">
                <span>Estimasi Laba Produksi</span>
                <b class="${labaNegatif ? "fmcFinanceLoss" : "fmcFinanceProfit"}">
                    ${formatKeuanganRupiah(k.estimasiLaba)}
                </b>
            </div>
            <div class="fmcBarTrack">
                <div class="fmcBarFill ${labaNegatif ? "fmcBarRed" : "fmcBarBlue"}"
                     style="width:${keuanganBarPct_(profit, financeMax)}%"></div>
            </div>
        </div>

    </div>
</div>

<div class="fmcFinanceSummary">
`;

    html += cardKeuangan("📦", "Total Ekor Panen", formatKeuanganInteger(k.totalEkor));
    html += cardKeuangan("scale", "Total Tonase", formatKeuanganNumber(k.totalTonase, 2));
    html += cardKeuangan("task_alt", "Flok Siap Panen", formatKeuanganInteger(k.flokPanen));
    html += cardKeuangan("workspace_premium", "BB Tertinggi", formatKeuanganNumber(k.bbTertinggi, 2));
    html += cardKeuangan("calendar_month", "Umur Tertua", formatKeuanganInteger(k.umurTertua));
    html += cardKeuangan("military_tech", "Flok Terbaik", k.flokTerbaik || "-");
    html += cardKeuangan("🍗", "Konsumsi Pakan", formatKeuanganNumber(k.totalPakan, 2) + " Kg");
    html += cardKeuangan("payments", "Biaya Operasional", formatKeuanganRupiah(k.biayaOperasional));
    html += cardKeuangan("trending_up", "Estimasi Omset", formatKeuanganRupiah(k.estimasiOmset));
    html += cardKeuangan("receipt_long", "Cost / Ekor", formatKeuanganRupiah(k.costEkor));
    html += cardKeuangan("balance", "Cost / Kg", formatKeuanganRupiah(k.costKg));
    html += cardKeuangan("analytics", "Margin Produksi", formatKeuanganNumber(k.marginProduksi, 2));
    html += cardKeuangan("redeem", "Bonus Kematian", formatKeuanganRupiah(k.bonusKematian || 0));
    html += cardKeuangan("card_giftcard", "Bonus Pasar", formatKeuanganRupiah(k.bonusPasar || 0));

    html += `
</div>

<div class="fmcFinanceProfit card">
    <div>
        <small>Estimasi Laba Produksi</small>
        <strong class="${labaNegatif ? "fmcFinanceLoss" : "fmcFinanceProfitText"}">
            ${formatKeuanganRupiah(k.estimasiLaba)}
        </strong>
    </div>
    <span class="material-symbols-rounded">
        ${labaNegatif ? "trending_down" : "trending_up"}
    </span>
</div>

<div class="fmcFinanceProfit card">
    <div>
        <small>Profit / Ekor</small>
        <strong class="fmcFinanceProfitText">
            ${formatKeuanganRupiah(k.profitOwner)}
        </strong>
    </div>
    <span class="material-symbols-rounded">paid</span>
</div>

<center style="
    margin:22px;
    font-size:12px;
    color:#777;
">
    Update : ${new Date().toLocaleString("id-ID")}
</center>
`;

    document.getElementById("keuanganPage").innerHTML = html;
}
