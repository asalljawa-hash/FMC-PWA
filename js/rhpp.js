// ==========================================
// MEMBUKA HALAMAN RHPP
// ==========================================

async function openRHPP(){

    await showPage("rhpp");

}

// ==========================================
// PREVIEW RHPP
// ==========================================

async function renderRHPP() {

    // Gunakan data yang sudah ada di memori.
    // Jika belum ada, baru ambil dari server.
    const data = serverData || await ambilDataServer();

    if (!data) {

        document.getElementById("rhppPage").innerHTML = `
        <div class="card">
            <h2>Server Offline</h2>
            <p>Tidak dapat mengambil data RHPP.</p>
        </div>
        `;

        return;
    }

const dashboard = data.dashboard || {};
const farm = dashboard.farm || {};
const kpi = dashboard.kpi || {};
const ekonomiFlok = dashboard.ekonomiFlok || [];
const realisasiPanen = dashboard.realisasiPanen || [];
const keuangan = data.keuangan || {};

let html = `

<div class="rhppHeader">

    <h1>📄 FMC BROILER MOBILE</h1>

    <h2>Ringkasan Hasil Produksi Peternakan</h2>

    <small>RHPP Versi 12</small>

</div>

<div class="card">

    <table class="rhppIdentitas">

        <tr>
            <td>Nama Farm</td>
            <td><b>${farm.namaFarm}</b></td>
        </tr>

        <tr>
            <td>Periode</td>
            <td><b>${farm.periode}</b></td>
        </tr>

        <tr>
            <td>Chick In</td>
            <td><b>${farm.chickIn}</b></td>
        </tr>

        <tr>
            <td>Tanggal Cetak</td>
            <td><b>${new Date().toLocaleDateString("id-ID")}</b></td>
        </tr>

    </table>

</div>

`;

// ==========================================
// RINGKASAN KPI
// ==========================================

html += `

<div class="card">

    <h3>Ringkasan KPI Produksi</h3>

    <div class="rhppGrid">

        <div class="rhppItem">
            <span> DOC IN</span>
            <b>${kpi.docIn || 0}</b>
        </div>

        <div class="rhppItem">
            <span> Ayam Hidup</span>
            <b>${kpi.ayamHidup || 0}</b>
        </div>

        <div class="rhppItem">
            <span> Mati</span>
            <b>${kpi.mati || 0}</b>
        </div>

        <div class="rhppItem">
            <span> Mortalitas</span>
            <b>${kpi.mortalitas || 0}</b>
        </div>

        <div class="rhppItem">
            <span> Deplesi</span>
            <b>${kpi.deplesi || 0}</b>
        </div>

        <div class="rhppItem">
            <span> FCR</span>
            <b>${kpi.fcr || 0}</b>
        </div>

        <div class="rhppItem">
            <span> IP</span>
            <b>${kpi.ip || 0}</b>
        </div>

    </div>

</div>

`;
// ==========================================
// EKONOMI FLOK
// ==========================================

html += `

<div class="card">

    <h3> Ekonomi Flok</h3>

    <div class="tableEkonomi">

        <table>

            <thead>

                <tr>

                    <th>Flok</th>
                    <th>Rp/Ekor</th>
                    <th>Pakan/Kg</th>
                    <th>Biaya Pakan</th>
                    <th>Pendapatan</th>

                </tr>

            </thead>

            <tbody>

                ${ekonomiFlok.map(f => `

                <tr>

                    <td><b>${f.flok}</b></td>
                    <td>${f.rpEkor || 0}</td>
                    <td>${f.pakanKg || 0}</td>
                    <td>${f.biayaPakan || 0}</td>
                    <td>${f.pendapatan || 0}</td>

                </tr>

                `).join("")}

            </tbody>

        </table>

    </div>

</div>

`;
// ==========================================
// REALISASI PANEN
// ==========================================

html += `

<div class="card">

    <h3> Realisasi Panen</h3>

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

                ${realisasiPanen.map(r => `

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

</div>

`;
// ==========================================
// RINGKASAN KEUANGAN
// ==========================================

html += `

<div class="card">

    <h3> Ringkasan Keuangan</h3>

    <table class="rhppInfo">

        <tr>
            <td>Total Ekor Panen</td>
            <td><b>${keuangan.totalEkor || 0}</b></td>
        </tr>

        <tr>
            <td>Total Tonase</td>
            <td><b>${keuangan.totalTonase || 0}</b></td>
        </tr>

        <tr>
            <td>Total Pakan</td>
            <td><b>${keuangan.totalPakan || 0} Kg</b></td>
        </tr>

        <tr>
            <td>Biaya Operasional</td>
            <td><b>Rp ${keuangan.biayaOperasional || 0}</b></td>
        </tr>

        <tr>
            <td>Estimasi Omset</td>
            <td><b>Rp ${keuangan.estimasiOmset || 0}</b></td>
        </tr>

        <tr>
            <td>Estimasi Laba</td>
            <td><b>Rp ${keuangan.estimasiLaba || 0}</b></td>
        </tr>

        <tr>
            <td>Profit / Ekor</td>
            <td><b>Rp ${keuangan.profitOwner || 0}</b></td>
        </tr>

    </table>

</div>

`;
// ==========================================
// KESIMPULAN RHPP
// ==========================================

html += `

<div class="card">

    <h3> Kesimpulan Produksi</h3>

    <p style="
        line-height:1.8;
        text-align:justify;
    ">

        Laporan RHPP ini dibuat berdasarkan data
        produksi yang tercatat pada sistem
        FMC Broiler Mobile. Seluruh data meliputi
        performa produksi, ekonomi flok,
        realisasi panen, dan ringkasan keuangan
        menjadi dasar evaluasi hasil pemeliharaan
        pada periode ini.

    </p>

</div>

`;

// ==========================================
// TANDA TANGAN
// ==========================================

html += `

<div class="card">

    <h3> Pengesahan Laporan</h3>

    <div class="rhppSignature">

        <div>

            Disusun Oleh

            <br><br><br><br>

            ______________________

            <br>

            Operator Farm

        </div>

        <div>

            Mengetahui

            <br><br><br><br>

            ______________________

            <br>

            Owner / Pimpinan

        </div>

    </div>

    <div style="
        margin-top:30px;
        text-align:center;
        color:#666;
        font-size:13px;
    ">

        Dicetak pada
        ${new Date().toLocaleDateString("id-ID")}

        menggunakan

        <b>FMC Broiler Mobile</b>

    </div>

</div>

`;
// ==========================================
// PENUTUP HALAMAN RHPP
// ==========================================

html += `

<div style="height:30px;"></div>

<div style="
    display:flex;
    justify-content:center;
    gap:12px;
    margin:25px 0;
">

    <button
        class="btnPrimary"
        onclick="showPage('dashboard')">

        <span class="material-symbols-rounded">
            arrow_back
        </span>

        Dashboard

    </button>

    <button
        class="btnPrimary"
        onclick="exportRHPPPDF()">

        <span class="material-symbols-rounded">
            picture_as_pdf
        </span>

        Generate PDF

    </button>

</div>

`;

// ==========================================
// TAMPILKAN KE HALAMAN
// ==========================================

document.getElementById("rhppPage").innerHTML = html;

}