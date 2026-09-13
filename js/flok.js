// ==========================================
// FMC BOILER MOBILE V11
// FLOK.JS
// VISUAL GRAPH V2 — DATA/API TETAP
// ==========================================

function formatFlokInteger_(value){
    if(value === null || value === undefined || value === "") return "-";
    const n = Number(value);
    if(!Number.isFinite(n)) return String(value);
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
}

function formatFlokDecimal_(value, digits = 2){
    if(value === null || value === undefined || value === "") return "-";
    const n = Number(value);
    if(!Number.isFinite(n)) return String(value);
    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(n);
}

function formatFlokPercent_(value){
    if(value === null || value === undefined || value === "") return "-";
    let n = Number(value);
    if(!Number.isFinite(n)) return String(value);
    if(Math.abs(n) <= 1) n *= 100;
    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n) + "%";
}

function flokVisualNumber_(value){
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function flokBarPct_(value, max){
    const n = flokVisualNumber_(value);
    return Math.max(0, Math.min(100, (n / max) * 100));
}

async function tampilFlok(){

    const data = await ambilDataServer();

    if(!data){
        document.getElementById("flokPage").innerHTML = `
        <div class="card">
            <h2>
                <span class="material-symbols-rounded">cloud_off</span>
                Server Offline
            </h2>
            <p>Data flok tidak tersedia.</p>
        </div>`;
        return;
    }

    const dashboard = data.dashboard || {};
    const flok = dashboard.flok || dashboard.floks || [];

    let html = `
    <div class="dashboardHero">
        <div>
            <div class="heroSmall">FMC BOILER MOBILE V11</div>
            <h1>PERFORMA FLOK</h1>
            <div class="heroDate">
                <span class="material-symbols-rounded">pets</span>
                Monitoring Performa Produksi
            </div>
        </div>
        <div class="heroAction"
             onclick="openShareDialog(shareFlok, exportFlokPDF)">
            <span class="material-symbols-rounded">share</span>
        </div>
    </div>

    <div class="fmcGraphSection">
        <div class="fmcGraphTitle">
            <div>
                <h2>Perbandingan Performa FLOK</h2>
                <small>Visual IP dan mortalitas setiap FLOK</small>
            </div>
            <span class="material-symbols-rounded">monitoring</span>
        </div>

        <div class="fmcGraphBlock">
            <div class="fmcGraphBlockTitle">
                <span>IP per FLOK</span>
                <span>Skala 0–500</span>
            </div>
            <div class="fmcBarList">
    `;

    flok.forEach(item => {
        const nama = item.nama ?? item.flok ?? "-";
        const ip = item.ip ?? 0;
        html += `
            <div class="fmcBarRow">
                <div class="fmcBarLabel">
                    <span>Flok ${String(nama).replace(/^flok\s+/i, '')}</span>
                    <b>${formatFlokDecimal_(ip, 2)}</b>
                </div>
                <div class="fmcBarTrack">
                    <div class="fmcBarFill fmcBarGreen"
                         style="width:${flokBarPct_(ip, 500)}%"></div>
                </div>
            </div>`;
    });

    html += `
            </div>
        </div>

        <div class="fmcGraphBlock">
            <div class="fmcGraphBlockTitle">
                <span>Mortalitas per FLOK</span>
                <span>Semakin kecil semakin baik</span>
            </div>
            <div class="fmcBarList">
    `;

    flok.forEach(item => {
        const nama = item.nama ?? item.flok ?? "-";
        const rawMort = Number(item.mortalitas);
        const mort = Number.isFinite(rawMort)
            ? (Math.abs(rawMort) <= 1 ? rawMort * 100 : rawMort)
            : 0;

        html += `
            <div class="fmcBarRow">
                <div class="fmcBarLabel">
                    <span>Flok ${String(nama).replace(/^flok\s+/i, '')}</span>
                    <b>${formatFlokPercent_(item.mortalitas)}</b>
                </div>
                <div class="fmcBarTrack">
                    <div class="fmcBarFill fmcBarRed"
                         style="width:${flokBarPct_(mort, 10)}%"></div>
                </div>
            </div>`;
    });

    html += `
            </div>
        </div>
    </div>

    <div class="flokGrid fmcVisualFlokGrid">
    `;

    flok.forEach(item => {

        const namaFlok = item.nama ?? item.flok ?? "-";
        const hidup = item.hidup ?? item.live ?? "-";
        const mati = item.mati ?? "-";
        const mortalitas = item.mortalitas ?? "-";
        const fcr = item.fcr ?? "-";
        const ip = item.ip ?? "-";
        const status = item.status ?? item.statusPanen ?? "BELUM";

        html += `
        <div class="card fmcGraphCard">

            <div class="farmHeader">
                <div>
                    <h2>Flok ${String(namaFlok).replace(/^flok\s+/i, '')}</h2>
                    <small>Monitoring Produksi</small>
                </div>
                <div class="onlineBadge">
                    <span class="material-symbols-rounded">verified</span>
                    AKTIF
                </div>
            </div>

            <div class="fmcMiniMetric">
                <div class="fmcMiniMetricHead">
                    <span>🐔 Ayam Hidup</span>
                    <b>${formatFlokInteger_(hidup)}</b>
                </div>
                <div class="fmcBarTrack">
                    <div class="fmcBarFill fmcBarGreen"
                         style="width:${flokBarPct_(hidup, Math.max(flokVisualNumber_(hidup), flokVisualNumber_(mati) + flokVisualNumber_(hidup), 1))}%"></div>
                </div>
            </div>

            <div class="fmcMetricGrid4">

                <div class="fmcMetricBox">
                    <span class="kpiIcon">💀</span>
                    <small>Mati</small>
                    <b>${formatFlokInteger_(mati)}</b>
                </div>

                <div class="fmcMetricBox">
                    <span class="kpiIcon">📉</span>
                    <small>Mortalitas</small>
                    <b>${formatFlokPercent_(mortalitas)}</b>
                </div>

                <div class="fmcMetricBox">
                    <span class="kpiIcon">🍗</span>
                    <small>FCR</small>
                    <b>${formatFlokDecimal_(fcr, 2)}</b>
                </div>

                <div class="fmcMetricBox">
                    <span class="kpiIcon">🏆</span>
                    <small>IP</small>
                    <b>${formatFlokDecimal_(ip, 2)}</b>
                </div>

            </div>

            <div class="fmcStatusLine">
                <span>
                    <span class="material-symbols-rounded">assignment_turned_in</span>
                    Status
                </span>
                <b>${status}</b>
            </div>

        </div>`;
    });

    html += `</div>`;

    document.getElementById("flokPage").innerHTML = html;
}
