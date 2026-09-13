// ==========================================
// FMC BOILER MOBILE V11 FIX
// DASHBOARD.JS
// EKONOMI FLOK FIX
// BAGIAN 1
// ==========================================

async function tampilDashboard(){

console.log("STEP DASHBOARD");

const data = await ambilDataServer();

if(!data){

document.getElementById("dashboardPage").innerHTML = `

<div class="card">

<h2>

<span class="material-symbols-rounded">
cloud_off
</span>

Server Offline

</h2>

<p>
Tidak dapat mengambil data dari Google Sheet.
</p>

</div>

`;

return;

}

// ===============================
// AMBIL DATA DASHBOARD
// ===============================

const dashboard = data.dashboard || {};

const farm = dashboard.farm || {};

const kpi = dashboard.kpi || {};

const flok = dashboard.flok || [];

const ekonomiFlok = dashboard.ekonomiFlok || [];

const realisasiPanen = dashboard.realisasiPanen || [];

const ai = data.ai || [];


let html = `

<div class="dashboardHero">

<div>

<div class="heroSmall">

FMC BOILER MOBILE V11

</div>

<h1>

Dashboard

</h1>

<div class="heroDate">

<span class="material-symbols-rounded">

calendar_month

</span>

${new Date().toLocaleDateString("id-ID",{

weekday:"long",

day:"numeric",

month:"long",

year:"numeric"


})}

</div>

</div>

<div class="heroAction"

onclick="openShareDialog(shareDashboard, exportDashboardPDF)">

<span class="material-symbols-rounded">

share

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

Periode ${farm.periode}

</small>

</div>

<div class="onlineBadge">

    ONLINE

</div>

</div>

<div class="farmInfo">

Tanggal Chick In :

<b>${fmcFormatTanggalDashboard_(farm.tanggalDOC)}</b>

</div>

</div>

<h3>

KPI

</h3>

${renderKpiVisualDashboard_(kpi)}

<h3>

Ringkasan Flok

</h3>

<div class="dashboardFlokCharts">

${renderFlokVisualDashboard_(flok)}

</div>

`;

// ==========================================
// FMC BOILER MOBILE V11 FIX
// DASHBOARD.JS
// EKONOMI FLOK FIX
// BAGIAN 2
// ==========================================

html += `

</div>

<h3>

📊 Akumulasi Flok

</h3>

<div class="tableEkonomi" style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;">

<table style="min-width:900px;">

<thead>

<tr>

<th>Flok</th>

<th>Rp/Ekor</th>

<th>BR1</th>

<th>BR2</th>

<th>BR3</th>

<th>Total Pakan</th>

<th>Total Biaya Pakan</th>

<th>Pendapatan</th>

</tr>

</thead>

<tbody>

`;

// ==========================================
// FMC BOILER MOBILE V11 FIX
// DASHBOARD.JS
// EKONOMI FLOK FIX
// BAGIAN 3
// ==========================================

html += `

${ekonomiFlok.map(f=>{

const biayaPakan = Number(f.biayaPakan) || 0;

/*
 * ekonomiFlok dari GAS tidak membawa populasi hidup.
 * Ambil ayam hidup dari dashboard.flok berdasarkan ID FLOK
 * agar Rp/Ekor tetap dihitung dari data engine yang sama.
 */
const flokProduksi = flok.find(function(x){

    const nama =
        x.nama ??
        x.flok ??
        x.id ??
        "";

    return String(nama).trim().toUpperCase()
        === String(f.flok ?? "").trim().toUpperCase();

});

const ayamHidup =
    Number(
        flokProduksi &&
        (
            flokProduksi.hidup ??
            flokProduksi.populasiHidup ??
            flokProduksi.live
        )
    ) || 0;

const rpEkor =
    ayamHidup > 0
        ? biayaPakan / ayamHidup
        : 0;

const br1 = Number(f.br1) || 0;
const br2 = Number(f.br2) || 0;
const br3 = Number(f.br3) || 0;

const totalPakan =
    br1 + br2 + br3;

return `

<tr>

<td><b>${f.flok}</b></td>

<td>${fmcFormatDashboardRupiah_(rpEkor)}</td>

<td>${fmcFormatDashboardInteger_(br1)} kg</td>

<td>${fmcFormatDashboardInteger_(br2)} kg</td>

<td>${fmcFormatDashboardInteger_(br3)} kg</td>

<td>${fmcFormatDashboardInteger_(totalPakan)} kg</td>

<td>${fmcFormatDashboardRupiah_(biayaPakan)}</td>

<td>${fmcFormatDashboardRupiah_(f.pendapatan)}</td>

</tr>

`;

}).join("")}

</tbody>

</table>

</div>


`;

// ==========================================
// REALISASI PANEN
// ==========================================

html += `

<h3 style="margin-top:25px;">

📦 Realisasi Panen (${realisasiPanen.length})

</h3>

<div class="tableEkonomi">

<table>

<thead>

<tr>

<th>Total Ekor</th>
<th>Tonase</th>
<th>BB</th>
<th>FCR</th>
<th>IP</th>
<th>Mati</th>
<th>Harga</th>
<th>Omset</th>
<th>Profit/Ekor</th>
<th>Profit</th>

</tr>

</thead>

<tbody>

${realisasiPanen.map(r=>`

<tr>

<td>${r.totalEkor || 0}</td>

<td>${r.tonase || 0}</td>

<td>${r.bb || 0}</td>

<td>${r.fcr || 0}</td>

<td><b>${r.ip || "-"}</b></td>

<td>${r.kematian || 0}</td>

<td>${r.harga || 0}</td>

<td>${r.omset || 0}</td>

<td>${r.profitEkor || 0}</td>

<td><b>${r.profit || 0}</b></td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`;

// ==========================================
// PENUTUP DASHBOARD
// ==========================================

html += `

<center
style="margin:20px;color:#777;">

Update terakhir :

${new Date().toLocaleString("id-ID")}

</center>

`;

document.getElementById("dashboardPage").innerHTML = html;

}

// ==========================================
// FORMAT DASHBOARD
// ==========================================

function fmcFormatTanggalDashboard_(nilai){

    if(!nilai){
        return "—";
    }

    const d = new Date(nilai);

    if(Number.isNaN(d.getTime())){
        return String(nilai);
    }

    return d.toLocaleDateString("id-ID",{
        day:"2-digit",
        month:"long",
        year:"numeric"
    });
}

function fmcFormatDashboardInteger_(nilai){

    const n = Number(nilai);

    if(!Number.isFinite(n)){
        return nilai ?? "—";
    }

    return new Intl.NumberFormat("id-ID",{
        maximumFractionDigits:0
    }).format(n);
}

function fmcFormatDashboardPercent_(nilai){

    const n = Number(nilai);

    if(!Number.isFinite(n)){
        return nilai ?? "—";
    }

    const percent = Math.abs(n) <= 1 ? n * 100 : n;

    return new Intl.NumberFormat("id-ID",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    }).format(percent) + "%";
}

function fmcFormatDashboardDecimal_(nilai,digits){

    const n = Number(nilai);

    if(!Number.isFinite(n)){
        return nilai ?? "—";
    }

    return new Intl.NumberFormat("id-ID",{
        minimumFractionDigits:digits,
        maximumFractionDigits:digits
    }).format(n);
}

function fmcFormatDashboardRupiah_(nilai){

    const n = Number(nilai);

    if(!Number.isFinite(n)){
        return "Rp 0";
    }

    return "Rp " + new Intl.NumberFormat("id-ID",{
        maximumFractionDigits:0
    }).format(n);
}

// ==========================================
// KPI CARD
// ==========================================

/* ==========================================
   FMC KPI + RINGKASAN FLOK VISUAL V1
   FRONTEND ONLY — TIDAK MENYENTUH GAS 2
========================================== */

function fmcNum_(v){
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function fmcClamp_(v,min,max){
    return Math.max(min,Math.min(max,v));
}

function fmcPctValue_(v){
    const n = fmcNum_(v);
    return Math.abs(n) <= 1 ? n * 100 : n;
}

function renderKpiVisualDashboard_(k){

    const doc = Math.max(0,fmcNum_(k.docIn));
    const hidup = Math.max(0,fmcNum_(k.ayamHidup));
    const mati = Math.max(0,fmcNum_(k.mati));
    const afkir = Math.max(0,fmcNum_(k.afkir));
    const total = Math.max(doc, hidup + mati + afkir, 1);

    const popRows = [
        {label:"Ayam Hidup", value:hidup, cls:"live"},
        {label:"Mati", value:mati, cls:"dead"},
        {label:"Afkir", value:afkir, cls:"reject"}
    ];

    const popHtml = popRows.map(function(item){
        const pct = fmcClamp_(item.value / total * 100,0,100);
        return `
        <div class="kpiPopulationRow">
            <div class="kpiPopulationHead">
                <span>${item.label}</span>
                <b>${fmcFormatDashboardInteger_(item.value)}</b>
            </div>
            <div class="kpiPopulationTrack">
                <span class="kpiPopulationFill ${item.cls}" style="width:${pct.toFixed(2)}%;"></span>
            </div>
        </div>`;
    }).join("");

    const metrics = [
        {
            icon:"📉", label:"Mortalitas",
            display:fmcFormatDashboardPercent_(k.mortalitas),
            raw:fmcPctValue_(k.mortalitas), max:10, cls:"danger"
        },
        {
            icon:"pie_chart", label:"Deplesi",
            display:fmcFormatDashboardPercent_(k.deplesi),
            raw:fmcPctValue_(k.deplesi), max:10, cls:"warning"
        },
        {
            icon:"🍗", label:"FCR",
            display:fmcFormatDashboardDecimal_(k.fcr,2),
            raw:fmcNum_(k.fcr), max:3, cls:"feed"
        },
        {
            icon:"emoji_events", label:"IP",
            display:fmcFormatDashboardDecimal_(k.ip,2),
            raw:fmcNum_(k.ip), max:500, cls:"ip"
        }
    ];

    const metricHtml = metrics.map(function(item){
        const pct = fmcClamp_(item.raw / item.max * 100,0,100);
        const iconHtml = item.icon.length <= 2
            ? item.icon
            : `<span class="material-symbols-rounded">${item.icon}</span>`;

        return `
        <div class="kpiMetricVisual ${item.cls}">
            <div class="kpiMetricTop">
                <div class="kpiMetricIcon">${iconHtml}</div>
                <span>${item.label}</span>
            </div>
            <div class="kpiMetricValue">${item.display}</div>
            <div class="kpiMetricTrack">
                <span style="width:${pct.toFixed(2)}%;"></span>
            </div>
        </div>`;
    }).join("");

    return `
    <div class="kpiVisualCard">
        <div class="kpiVisualHeader">
            <div>
                <div class="kpiVisualTitle">Performa Global</div>
                <div class="kpiVisualSub">Ringkasan kondisi periode berjalan</div>
            </div>
            <div class="kpiVisualDoc">
                DOC
                <b>${fmcFormatDashboardInteger_(doc)}</b>
            </div>
        </div>

        <div class="kpiPopulation">
            ${popHtml}
        </div>

        <div class="kpiMetricGrid">
            ${metricHtml}
        </div>
    </div>`;
}

function renderFlokVisualDashboard_(rows){

    if(!Array.isArray(rows) || !rows.length){
        return `
        <div class="card flokChartEmpty">
            <span class="material-symbols-rounded">analytics</span>
            <b>Belum ada data FLOK</b>
            <small>Data ringkasan FLOK belum tersedia dari Dashboard Engine.</small>
        </div>`;
    }

    /*
     * Skala grafik dibuat RELATIF terhadap nilai tertinggi
     * pada data FLOK yang sedang tampil.
     * Ini hanya mengubah visualisasi, bukan nilai/data engine.
     */
    function relativeMax(field){
        const values = rows.map(function(f){
            return Math.max(0, fmcNum_(f[field]));
        });

        const max = Math.max.apply(null, values);
        return max > 0 ? max : 1;
    }

    function barRows(field,formatter,cls){
        const maxValue = relativeMax(field);

        return rows.map(function(f){
            const name = f.nama ?? f.flok ?? f.id ?? "FLOK";
            const value = Math.max(0, fmcNum_(f[field]));
            const pct = fmcClamp_(value / maxValue * 100,0,100);

            return `
            <div class="flokChartRow">
                <div class="flokChartHead">
                    <span>FLOK ${name}</span>
                    <b>${formatter(value)}</b>
                </div>
                <div class="flokChartTrack">
                    <span class="${cls}" style="width:${pct.toFixed(2)}%;"></span>
                </div>
            </div>`;
        }).join("");
    }

    return `
    <div class="flokVisualGrid">

        <div class="card flokVisualCard flokVisualIP">
            <div class="flokVisualHeader">
                <div>
                    <h3>IP per FLOK</h3>
                    <small>Perbandingan indeks performa setiap FLOK</small>
                </div>
                <span class="material-symbols-rounded">emoji_events</span>
            </div>
            <div class="flokChartList">
                ${barRows("ip",function(v){
                    return fmcFormatDashboardDecimal_(v,2);
                },"ip")}
            </div>
        </div>

        <div class="card flokVisualCard flokVisualHidup">
            <div class="flokVisualHeader">
                <div>
                    <h3>Ayam Hidup per FLOK</h3>
                    <small>Perbandingan populasi ayam hidup setiap FLOK</small>
                </div>
                <span class="material-symbols-rounded">🐔</span>
            </div>
            <div class="flokChartList">
                ${barRows("hidup",function(v){
                    return fmcFormatDashboardInteger_(v);
                },"live")}
            </div>
        </div>

        <div class="card flokVisualCard flokVisualMortality">
            <div class="flokVisualHeader">
                <div>
                    <h3>Mortalitas per FLOK</h3>
                    <small>Perbandingan mortalitas setiap FLOK</small>
                </div>
                <span class="material-symbols-rounded">monitor_heart</span>
            </div>
            <div class="flokChartList">
                ${barRows("mortalitas",function(v){
                    return fmcFormatDashboardPercent_(v);
                },"mortality")}
            </div>
        </div>

    </div>`;
}

function kpiCard(icon,judul,nilai){

const iconHtml = icon.length <= 2
? icon
: `<span class="material-symbols-rounded">

${icon}

</span>`;

return `

<div class="card">

<div class="kpiIcon">

${iconHtml}

</div>

<h4>

${judul}

</h4>

<b>

${
(judul === "Mortalitas" || judul === "Deplesi")
? fmcFormatDashboardPercent_(nilai)
: (nilai ?? 0)
}

</b>

</div>

`;

}
