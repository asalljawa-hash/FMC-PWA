// ==========================================
// FMC BOILER MOBILE V11
// HARIAN.JS
// VISUAL GRAPH V2 — DATA/API TETAP
// ==========================================

async function tampilHarian(){

    const data = await ambilDataServer();

    if(!data){
        document.getElementById("harianPage").innerHTML = `
        <div class="card">
            <h2>
                <span class="material-symbols-rounded">cloud_off</span>
                Server Offline
            </h2>
            <p>Tidak dapat mengambil data harian.</p>
        </div>`;
        return;
    }

    const harian = data.harian || {};
    const flokHarian = harian.flok || [];

    const formatMortalitas = (value) => {
        if(value === null || value === undefined || value === "") return "-";
        const n = Number(value);
        if(!Number.isFinite(n)) return String(value);
        return new Intl.NumberFormat("id-ID", {
            style: "percent",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(n);
    };

    const numeric = value => {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    };

    const barPct = (value, max) =>
        Math.max(0, Math.min(100, (numeric(value) / Math.max(max, 1)) * 100));

    const maxMati = Math.max(...flokHarian.map(f => numeric(f.mati)), 1);

    const maxMort = Math.max(
        ...flokHarian.map(f => {
            const n = numeric(f.mortalitas);
            return Math.abs(n) <= 1 ? n * 100 : n;
        }),
        1
    );

    let html = `
<div class="dashboardHero">
    <div>
        <div class="heroSmall">FMC BOILER MOBILE V11</div>
        <h1>Laporan Harian</h1>
        <div class="heroDate">
            <span class="material-symbols-rounded">calendar_month</span>
            ${harian.tanggal ?? "-"}
        </div>
    </div>

    <div class="heroAction"
         onclick="openShareDialog(shareHarian, exportHarianPDF)">
        <span class="material-symbols-rounded">share</span>
    </div>
</div>

<div class="fmcDailyHero card">
    <div>
        <span class="fmcDailyLabel">Total Kematian Hari Ini</span>
        <strong>${harian.totalMati ?? 0}</strong>
        <small>Ekor</small>
    </div>
    <span class="material-symbols-rounded fmcDailyIcon">warning</span>
</div>

<div class="fmcGraphSection">
    <div class="fmcGraphTitle">
        <div>
            <h2>Grafik Laporan Harian</h2>
            <small>Perbandingan kematian dan mortalitas antar FLOK</small>
        </div>
        <span class="material-symbols-rounded">bar_chart</span>
    </div>

    <div class="fmcGraphBlock">
        <div class="fmcGraphBlockTitle">
            <span>Kematian per FLOK</span>
            <span>Ekor</span>
        </div>
        <div class="fmcBarList">
`;

    flokHarian.forEach(f => {
        html += `
            <div class="fmcBarRow">
                <div class="fmcBarLabel">
                    <span>Flok ${f.nama ?? "-"}</span>
                    <b>${f.mati ?? 0}</b>
                </div>
                <div class="fmcBarTrack">
                    <div class="fmcBarFill fmcBarRed"
                         style="width:${barPct(f.mati, maxMati)}%"></div>
                </div>
            </div>`;
    });

    html += `
        </div>
    </div>

    <div class="fmcGraphBlock">
        <div class="fmcGraphBlockTitle">
            <span>Mortalitas per FLOK</span>
            <span>%</span>
        </div>
        <div class="fmcBarList">
`;

    flokHarian.forEach(f => {
        const n = numeric(f.mortalitas);
        const percent = Math.abs(n) <= 1 ? n * 100 : n;

        html += `
            <div class="fmcBarRow">
                <div class="fmcBarLabel">
                    <span>Flok ${f.nama ?? "-"}</span>
                    <b>${formatMortalitas(f.mortalitas)}</b>
                </div>
                <div class="fmcBarTrack">
                    <div class="fmcBarFill fmcBarOrange"
                         style="width:${barPct(percent, maxMort)}%"></div>
                </div>
            </div>`;
    });

    html += `
        </div>
    </div>
</div>

<div class="fmcDailyGrid">
`;

    flokHarian.forEach(f => {
        html += `
<div class="card fmcGraphCard">
    <div class="harianHeader">
        <div class="harianTitle">
            <h2>Flok ${f.nama ?? "-"}</h2>
            <small>Laporan Harian</small>
        </div>
        <div class="onlineBadge">
            <span class="material-symbols-rounded">check_circle</span>
            AKTIF
        </div>
    </div>

    <div class="fmcDailyMetric">
        <span class="material-symbols-rounded">schedule</span>
        <div>
            <small>Umur</small>
            <b>${f.umur ?? "-"} Hari</b>
        </div>
    </div>

    <div class="fmcDailyMetric">
        <span class="material-symbols-rounded">warning</span>
        <div>
            <small>Mati</small>
            <b>${f.mati ?? "-"}</b>
        </div>
    </div>

    <div class="fmcDailyMetric">
        <span class="material-symbols-rounded">pie_chart</span>
        <div>
            <small>Mortalitas</small>
            <b>${formatMortalitas(f.mortalitas)}</b>
        </div>
    </div>
</div>`;
    });

    html += `
</div>

<div style="
    text-align:center;
    margin:24px 0;
    font-size:12px;
    color:#777;
">
    Powered by Dasbor FMC Analytics
</div>
`;

    document.getElementById("harianPage").innerHTML = html;
}
