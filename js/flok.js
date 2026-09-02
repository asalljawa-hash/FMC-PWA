// ==========================================
// FMC BOILER MOBILE V11
// FLOK.JS
// FORMAT ANGKA PROFESIONAL
// ==========================================

/* =========================================================
   FORMAT ANGKA FLOK
   - Jumlah ayam/mati       : 1.000
   - Mortalitas              : 0,06%
   - FCR                     : 0,75
   - IP                      : 252,41
   - Tidak mengubah nilai dari GAS/Calculation Engine
   ========================================================= */

function formatFlokInteger_(value){
    if(value === null || value === undefined || value === "") return "-";

    const n = Number(value);
    if(!Number.isFinite(n)) return String(value);

    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0
    }).format(n);
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

    // Data dari Calculation Engine berupa rasio/desimal.
    // Contoh 0.000571428... = 0,057% -> 0,06%
    if(Math.abs(n) <= 1){
        n *= 100;
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n) + "%";
}

async function tampilFlok(){

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("flokPage").innerHTML = `

        <div class="card">

            <h2>
                <span class="material-symbols-rounded">
                    cloud_off
                </span>
                Server Offline
            </h2>

            <p>Data flok tidak tersedia.</p>

        </div>

        `;

        return;
    }

    const dashboard = data.dashboard || {};
    const flok = dashboard.flok || dashboard.floks || [];

    let html = `

    <div class="dashboardHero">

        <div>

            <div class="heroSmall">
                FMC BOILER MOBILE V11
            </div>

            <h1>
                PERFORMA FLOK
            </h1>

            <div class="heroDate">
                <span class="material-symbols-rounded">
                    pets
                </span>
                Monitoring Performa Produksi
            </div>

        </div>

        <div class="heroAction"
             onclick="openShareDialog(shareFlok, exportFlokPDF)">

            <span class="material-symbols-rounded">
                share
            </span>

        </div>

    </div>

    <div class="flokGrid">
    `;

    flok.forEach(item => {

        const namaFlok =
            item.nama ??
            item.flok ??
            "-";

        const hidup =
            item.hidup ??
            item.live ??
            "-";

        const mati =
            item.mati ??
            "-";

        const mortalitas =
            item.mortalitas ??
            "-";

        const fcr =
            item.fcr ??
            "-";

        const ip =
            item.ip ??
            "-";

        const status =
            item.status ??
            item.statusPanen ??
            "BELUM";

        html += `

        <div class="card">

            <div class="farmHeader">

                <div>

                    <h2>
                        Flok ${String(namaFlok).replace(/^flok\s+/i, '')}
                    </h2>

                    <small>
                        Monitoring Produksi
                    </small>

                </div>

                <div class="onlineBadge">

                    <span class="material-symbols-rounded">
                        verified
                    </span>

                    AKTIF

                </div>

            </div>

            <div style="
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:16px;
                margin-top:18px;
            ">

                <div>

                    <div class="kpiIcon">🐔</div>

                    <h4>Ayam Hidup</h4>

                    <b>${formatFlokInteger_(hidup)}</b>

                </div>

                <div>

                    <div class="kpiIcon">💀</div>

                    <h4>Mati</h4>

                    <b>${formatFlokInteger_(mati)}</b>

                </div>

                <div>

                    <div class="kpiIcon">📉</div>

                    <h4>Mortalitas</h4>

                    <b>${formatFlokPercent_(mortalitas)}</b>

                </div>

                <div>

                    <div class="kpiIcon">🍗</div>

                    <h4>FCR</h4>

                    <b>${formatFlokDecimal_(fcr, 2)}</b>

                </div>

                <div>

                    <div class="kpiIcon">🏆</div>

                    <h4>IP</h4>

                    <b>${formatFlokDecimal_(ip, 2)}</b>

                </div>

                <div>

                    <div class="kpiIcon">

                        <span class="material-symbols-rounded">
                            assignment_turned_in
                        </span>

                    </div>

                    <h4>Status</h4>

                    <b>${status}</b>

                </div>

            </div>

        </div>

        `;
    });

    html += `

    </div>

    `;

    document.getElementById("flokPage").innerHTML = html;
}
