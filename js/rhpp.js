// ==========================================================
// FMC BROILER MOBILE
// RHPP D2 — FRONTEND V1
// Sumber data: GAS 2 action=getRHPP
// ==========================================================

function fmcRhppEsc_(value){
    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function fmcRhppNum_(value){
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function fmcRhppAngka_(value, digits = 0){
    return fmcRhppNum_(value).toLocaleString("id-ID", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function fmcRhppRupiah_(value){
    return "Rp " + fmcRhppAngka_(value, 0);
}

function fmcRhppHasContractPrice_(rows){
    return Array.isArray(rows) && rows.some(function(row){
        return fmcRhppNum_(row?.contractPrice) > 0;
    });
}

function fmcRhppEstimateText_(value, hasContractPrice){
    return hasContractPrice
        ? fmcRhppRupiah_(value)
        : "Belum dapat dihitung";
}

function fmcRhppPersen_(value){
    return (fmcRhppNum_(value) * 100).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "%";
}

async function fmcRhppResolvePeriodId_(){
    const cached = String(
        window.fmcInputFlokActivePeriodId ||
        window.fmcD2ActivePeriodId ||
        localStorage.getItem("fmcD2ActivePeriodId") ||
        ""
    ).trim();

    // Server tetap menjadi sumber kebenaran jika bridge period tersedia.
    try{
        if(typeof d2GetPeriods === "function"){
            const result = await d2GetPeriods({});
            if(result && result.success === true){
                const activeId = String(
                    result.active_period_id ||
                    result.activePeriodId ||
                    result.data?.active_period_id ||
                    result.data?.activePeriodId ||
                    ""
                ).trim();

                if(activeId){
                    window.fmcD2ActivePeriodId = activeId;
                    try{ localStorage.setItem("fmcD2ActivePeriodId", activeId); }catch(e){}
                    return activeId;
                }
            }
        }
    }catch(error){
        console.warn("RHPP: gagal membaca active period server.", error);
    }

    return cached;
}

async function fmcGetRHPPD2_(){
    const periodId = await fmcRhppResolvePeriodId_();

    const result = await apiPost(
        "getRHPP",
        periodId ? { period_id: periodId } : {}
    );

    if(!result || result.success !== true){
        throw new Error(
            result?.message ||
            result?.error ||
            "GAS 2 gagal mengambil RHPP."
        );
    }

    if(!result.rhpp || typeof result.rhpp !== "object"){
        throw new Error("Response getRHPP tidak memiliki data RHPP.");
    }

    /*
     * ==========================================================
     * OVK RHPP — SUMBER DARI DATA OVK PWA
     * ==========================================================
     *
     * Semua data RHPP selain OVK tetap berasal dari
     * D2_RHPP_EngineV1 melalui action getRHPP.
     *
     * OVK sengaja TIDAK dibaca ulang oleh RHPP Engine.
     * RHPP memakai data yang sudah tersedia pada modul OVK PWA:
     *   1. window.fmcOVKDataServer
     *   2. window.fmcOVKDataSesi
     *   3. jika server belum pernah dimuat, panggil fungsi GET OVK
     *      yang sama dengan halaman OVK secara silent.
     *
     * BOP / OVK tetap biaya terpisah dan tidak mengubah
     * estimasiLaba produksi.
     */
    try{
        const ovkItems = await fmcRhppGetOvkFromPwa_();
        const ovkTotal = ovkItems.reduce(function(total, item){
            return total + fmcRhppNum_(item?.total);
        }, 0);

        result.rhpp.ovk = {
            items: ovkItems,
            summary: {
                ada: ovkItems.length > 0,
                jumlahItem: ovkItems.length,
                total: ovkTotal
            }
        };

        result.rhpp.keuangan = result.rhpp.keuangan || {};
        result.rhpp.keuangan.biayaOVK = ovkTotal;
        result.rhpp.keuangan.ovkCost = ovkTotal;
        result.rhpp.keuangan.biayaTerpisah =
            result.rhpp.keuangan.biayaTerpisah || {};
        result.rhpp.keuangan.biayaTerpisah.ovk = ovkTotal;

    }catch(error){
        /*
         * OVK tidak boleh membuat seluruh RHPP gagal.
         * Jika data sesi/server PWA belum tersedia, tampilkan
         * OVK kosong sesuai kondisi data yang tersedia saat ini.
         */
        console.warn("RHPP: data OVK PWA belum tersedia.", error);

        result.rhpp.ovk = {
            items: [],
            summary: {
                ada: false,
                jumlahItem: 0,
                total: 0
            }
        };

        result.rhpp.keuangan = result.rhpp.keuangan || {};
        result.rhpp.keuangan.biayaOVK = 0;
        result.rhpp.keuangan.ovkCost = 0;
        result.rhpp.keuangan.biayaTerpisah =
            result.rhpp.keuangan.biayaTerpisah || {};
        result.rhpp.keuangan.biayaTerpisah.ovk = 0;
    }

    window.fmcRHPPD2 = result;
    return result;
}

/*
 * ==========================================================
 * AMBIL OVK DARI DATA YANG SUDAH DIMILIKI MODUL OVK PWA
 * ==========================================================
 */
async function fmcRhppGetOvkFromPwa_(){
    let serverItems = Array.isArray(window.fmcOVKDataServer)
        ? window.fmcOVKDataServer
        : [];

    let sessionItems = Array.isArray(window.fmcOVKDataSesi)
        ? window.fmcOVKDataSesi
        : [];

    /*
     * Bila halaman RHPP dibuka sebelum halaman OVK pernah dimuat,
     * gunakan fungsi GET OVK yang sudah ada. Tidak membuat API baru.
     */
    if(
        !serverItems.length &&
        typeof muatDataOVKDariServerOVK === "function"
    ){
        try{
            const loaded = await muatDataOVKDariServerOVK({
                silent: true
            });

            if(Array.isArray(loaded)){
                serverItems = loaded;
            }else if(Array.isArray(window.fmcOVKDataServer)){
                serverItems = window.fmcOVKDataServer;
            }
        }catch(error){
            console.warn(
                "RHPP: GET OVK PWA gagal, lanjut memakai data sesi.",
                error
            );
        }
    }

    /*
     * Halaman OVK dapat mempunyai data server dan data sesi.
     * Gabungkan keduanya tanpa menggandakan item yang sama.
     */
    const combined = [];
    const seen = new Set();

    function addItems(items){
        if(!Array.isArray(items)) return;

        items.forEach(function(item, index){
            if(!item || typeof item !== "object") return;

            const tanggal = String(item.tanggal || "");
            const nama = String(
                item.namaObat ||
                item.nama ||
                item.obat ||
                ""
            );
            const harga = fmcRhppNum_(item.harga);
            const qty = fmcRhppNum_(item.qty);
            const total = fmcRhppNum_(item.total) || (harga * qty);

            /*
             * ID logis untuk mencegah data server + sesi yang sama
             * masuk dua kali ke laporan RHPP.
             */
            const key = [
                tanggal,
                nama,
                harga,
                qty,
                total
            ].join("|");

            if(seen.has(key)) return;
            seen.add(key);

            combined.push({
                no: item.no ?? (index + 1),
                row: item.row ?? "",
                tanggal: tanggal,
                namaObat: nama,
                harga: harga,
                qty: qty,
                total: total,
                __server: item.__server === true,
                __session: item.__session === true || item.__server !== true
            });
        });
    }

    /* Server menjadi prioritas, lalu data sesi tambahan. */
    addItems(serverItems);
    addItems(sessionItems);

    return combined;
}

async function openRHPP(){
    await showPage("rhpp");
}

async function renderRHPP(){
    const page = document.getElementById("rhppPage");
    if(!page) return;

    page.innerHTML = `
        <div class="card">
            <h3>Memuat RHPP...</h3>
            <p>Menyiapkan laporan produksi dan keuangan.</p>
        </div>
    `;

    let response;
    try{
        response = await fmcGetRHPPD2_();
    }catch(error){
        console.error("RHPP D2 ERROR:", error);
        page.innerHTML = `
            <div class="card">
                <h2>RHPP tidak dapat dimuat</h2>
                <p>${fmcRhppEsc_(error?.message || error)}</p>
                <button class="rhppActionBtn rhppDashboardBtn" onclick="renderRHPP()">
                    Coba Lagi
                </button>
            </div>
        `;
        return;
    }

    const rhpp = response.rhpp || {};
    const identitas = rhpp.identitas || {};
    const kpi = rhpp.kpi || {};
    const flokRows = Array.isArray(rhpp.akumulasiFlok) ? rhpp.akumulasiFlok : [];
    const panenRows = Array.isArray(rhpp.realisasiPanen) ? rhpp.realisasiPanen : [];
    const keuangan = rhpp.keuangan || {};
    const ovk = rhpp.ovk || {};
    const ovkItems = Array.isArray(ovk.items) ? ovk.items : [];
    const bop = rhpp.bop || {};
    const hasContractPrice = fmcRhppHasContractPrice_(flokRows);

    let html = `
        <div class="rhppHeader">
            <h1>📄 FMC BROILER MOBILE</h1>
            <h2>Ringkasan Hasil Produksi Peternakan</h2>
            <small>Laporan Produksi Broiler Terintegrasi</small>
        </div>

        <div class="card">
            <table class="rhppIdentitas">
                <tr><td>Nama Farm</td><td><b>${fmcRhppEsc_(identitas.namaFarm || "-")}</b></td></tr>
                <tr><td>Perusahaan</td><td><b>${fmcRhppEsc_(identitas.perusahaan || "-")}</b></td></tr>
                <tr><td>Supplier</td><td><b>${fmcRhppEsc_(identitas.supplier || "-")}</b></td></tr>
                <tr><td>Periode</td><td><b>${fmcRhppEsc_(identitas.periode || "-")}</b></td></tr>
                <tr><td>Chick In</td><td><b>${fmcRhppEsc_(identitas.chickIn || "-")}</b></td></tr>
                <tr><td>Tanggal DOC</td><td><b>${fmcRhppEsc_(identitas.tanggalDOC || "-")}</b></td></tr>
                <tr><td>Jumlah FLOK</td><td><b>${fmcRhppAngka_(rhpp.flok_count || flokRows.length)}</b></td></tr>
                <tr><td>Tanggal Cetak</td><td><b>${new Date().toLocaleDateString("id-ID")}</b></td></tr>
            </table>
        </div>

        <div class="card">
            <h3>Ringkasan KPI Produksi</h3>
            <div class="rhppGrid">
                <div class="rhppItem"><span>DOC IN</span><b>${fmcRhppAngka_(kpi.docIn)}</b></div>
                <div class="rhppItem"><span>Ayam Hidup</span><b>${fmcRhppAngka_(kpi.ayamHidup)}</b></div>
                <div class="rhppItem"><span>Mati</span><b>${fmcRhppAngka_(kpi.mati)}</b></div>
                <div class="rhppItem"><span>Mortalitas</span><b>${fmcRhppPersen_(kpi.mortalitas)}</b></div>
                <div class="rhppItem"><span>Deplesi</span><b>${fmcRhppPersen_(kpi.deplesi)}</b></div>
                <div class="rhppItem"><span>FCR</span><b>${fmcRhppAngka_(kpi.fcr, 2)}</b></div>
                <div class="rhppItem"><span>IP</span><b>${fmcRhppAngka_(kpi.ip, 0)}</b></div>
            </div>
        </div>

        <div class="card">
            <h3>AKUMULASI FLOK</h3>
            <div class="tableEkonomi">
                <table>
                    <thead><tr>
                        <th>Flok</th><th>Populasi</th><th>Live</th><th>Mati</th><th>Afkir</th>
                        <th>Umur</th><th>BB Avg</th><th>Pakan Kg</th><th>Jenis Pakan</th><th>Biaya Pakan</th>
                        <th>Live Kg</th><th>Harga Kontrak</th><th>Omset</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                        ${flokRows.length ? flokRows.map(f => `
                            <tr>
                                <td><b>${fmcRhppEsc_(f.flok || "-")}</b></td>
                                <td>${fmcRhppAngka_(f.populasi)}</td>
                                <td>${fmcRhppAngka_(f.live)}</td>
                                <td>${fmcRhppAngka_(f.mati)}</td>
                                <td>${fmcRhppAngka_(f.afkir)}</td>
                                <td>${fmcRhppAngka_(f.umur)}</td>
                                <td>${fmcRhppAngka_(f.bbAvg, 2)}</td>
                                <td>${fmcRhppAngka_(f.feedKg, 0)}</td>
                                <td>${fmcRhppEsc_(f.jenisPakan || "-")}</td>
                                <td>${fmcRhppRupiah_(f.feedCost)}</td>
                                <td>${fmcRhppAngka_(f.liveKg, 2)}</td>
                                <td>${fmcRhppRupiah_(f.contractPrice)}</td>
                                <td>${fmcRhppRupiah_(f.productionValue)}</td>
                                <td>${fmcRhppEsc_(f.status || "BELUM")}</td>
                            </tr>
                        `).join("") : `<tr><td colspan="14">Belum ada data FLOK.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <h3>Realisasi Panen</h3>
            <div class="tableEkonomi">
                <table>
                    <thead><tr>
                        <th>Flok</th><th>Tanggal</th><th>Ekor</th><th>Tonase</th><th>BB</th>
                        <th>Harga</th><th>Omset</th><th>Profit/Ekor</th><th>Profit</th>
                    </tr></thead>
                    <tbody>
                        ${panenRows.length ? panenRows.map(r => `
                            <tr>
                                <td>${fmcRhppEsc_(r.flok || "-")}</td>
                                <td>${fmcRhppEsc_(r.tanggal || "-")}</td>
                                <td>${fmcRhppAngka_(r.totalEkor)}</td>
                                <td>${fmcRhppAngka_(r.tonase, 2)}</td>
                                <td>${fmcRhppAngka_(r.bb, 2)}</td>
                                <td>${fmcRhppRupiah_(r.harga)}</td>
                                <td>${fmcRhppRupiah_(r.omset)}</td>
                                <td>${fmcRhppRupiah_(r.profitEkor)}</td>
                                <td>${fmcRhppRupiah_(r.profit)}</td>
                            </tr>
                        `).join("") : `<tr><td colspan="9">Belum ada realisasi panen.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <h3>Ringkasan Keuangan</h3>
            <table class="rhppInfo">
                <tr><td>Total Ekor Hidup</td><td><b>${fmcRhppAngka_(keuangan.totalEkor)}</b></td></tr>
                <tr><td>Total Tonase</td><td><b>${fmcRhppAngka_(keuangan.totalTonase, 2)} Ton</b></td></tr>
                <tr><td>Total Pakan</td><td><b>${fmcRhppAngka_(keuangan.totalPakan)} Kg</b></td></tr>
                <tr><td>DOC</td><td><b>${fmcRhppRupiah_(keuangan.docCost)}</b></td></tr>
                <tr><td>Pakan</td><td><b>${fmcRhppRupiah_(keuangan.feedCost)}</b></td></tr>
                <tr><td>Total Biaya Produksi</td><td><b>${fmcRhppRupiah_(keuangan.productionCost)}</b></td></tr>
                <tr><td>Estimasi Omset</td><td><b>${hasContractPrice ? fmcRhppRupiah_(keuangan.estimasiOmset) : "Belum tersedia"}</b></td></tr>
                <tr><td>Estimasi Laba Produksi</td><td><b>${fmcRhppEstimateText_(keuangan.estimasiLaba, hasContractPrice)}</b></td></tr>
                <tr><td>Profit / Ekor</td><td><b>${fmcRhppRupiah_(keuangan.profitOwner)}</b></td></tr>
                <tr><td>Total BOP</td><td><b>${fmcRhppRupiah_(keuangan.biayaBOP ?? bop.total)}</b></td></tr>
                <tr><td>Total OVK</td><td><b>${fmcRhppRupiah_(keuangan.biayaOVK ?? ovk.summary?.total)}</b></td></tr>
            </table>
            <p><small>BOP dan OVK tidak dikurangkan dari Estimasi Laba Produksi.</small></p>
        </div>

        <div class="card">
            <h3>BOP</h3>
            ${Array.isArray(bop.items) && bop.items.length ? `
                <div class="tableEkonomi">
                    <table>
                        <thead><tr><th>No</th><th>Tanggal</th><th>Kategori</th><th>Keterangan</th><th>Harga</th><th>Qty</th><th>Total</th></tr></thead>
                        <tbody>${bop.items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${fmcRhppEsc_(item.tanggal || "-")}</td>
                                <td>${fmcRhppEsc_(item.kategori || "-")}</td>
                                <td>${fmcRhppEsc_(item.keterangan || "-")}</td>
                                <td>${fmcRhppRupiah_(item.harga)}</td>
                                <td>${fmcRhppAngka_(item.qty)}</td>
                                <td>${fmcRhppRupiah_(item.total)}</td>
                            </tr>
                        `).join("")}
                        <tr><td colspan="6"><b>TOTAL BOP</b></td><td><b>${fmcRhppRupiah_(bop.summary?.total ?? bop.total)}</b></td></tr>
                        </tbody>
                    </table>
                </div>
            ` : `<p>Belum ada input BOP pada periode ini.</p>`}
        </div>

        <div class="card">
            <h3>OVK</h3>
            ${ovkItems.length ? `
                <div class="tableEkonomi">
                    <table>
                        <thead><tr><th>Tanggal</th><th>Obat / OVK</th><th>Harga</th><th>Qty</th><th>Total</th></tr></thead>
                        <tbody>${ovkItems.map(item => `
                            <tr>
                                <td>${fmcRhppEsc_(item.tanggal || "-")}</td>
                                <td>${fmcRhppEsc_(item.namaObat || item.nama || item.obat || "-")}</td>
                                <td>${fmcRhppRupiah_(item.harga)}</td>
                                <td>${fmcRhppAngka_(item.qty)}</td>
                                <td>${fmcRhppRupiah_(item.total)}</td>
                            </tr>
                        `).join("")}</tbody>
                    </table>
                </div>
            ` : `<p>Belum ada input OVK pada periode ini.</p>`}
        </div>

        <div class="card">
            <h3>Kesimpulan Produksi</h3>
            <p style="line-height:1.8;text-align:justify;">
                Laporan ini disusun berdasarkan data produksi dan keuangan yang tercatat pada periode berjalan.
                Akumulasi produksi disajikan berdasarkan jumlah FLOK yang terdaftar pada periode pelaporan.
                Biaya produksi, BOP, dan OVK disajikan secara terpisah untuk memberikan gambaran yang lebih jelas
                mengenai kondisi operasional dan keuangan periode berjalan.
                Laporan ini dapat digunakan sebagai bahan evaluasi bagi Owner/Pimpinan dalam memantau perkembangan produksi
                dan menentukan langkah pengelolaan selanjutnya.
            </p>
        </div>

        <div class="card">
            <h3>Pengesahan Laporan</h3>
            <div class="rhppSignature">
                <div>Disusun Oleh<br><br><br><br>______________________<br>Operator Farm</div>
                <div>Mengetahui<br><br><br><br>______________________<br>Owner / Pimpinan</div>
            </div>
            <div style="margin-top:30px;text-align:center;color:#666;font-size:13px;">
                Dicetak pada ${new Date().toLocaleDateString("id-ID")} menggunakan <b>FMC Broiler Mobile</b>
            </div>
        </div>

        <div style="height:30px;"></div>
        <div class="rhppActions">
            <button class="rhppActionBtn rhppDashboardBtn" onclick="showPage('dashboard')">
                <span class="rhppActionIcon material-symbols-rounded">arrow_back</span>
                <span>Dashboard</span>
            </button>
            <button class="rhppActionBtn rhppPdfBtn" onclick="exportRHPPPDF()">
                <span class="rhppActionIcon material-symbols-rounded">picture_as_pdf</span>
                <span>Generate PDF</span>
            </button>
        </div>
    `;

    page.innerHTML = html;
}
