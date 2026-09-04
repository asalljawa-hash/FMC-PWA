// ==========================================================
// FMC BROILER MOBILE
// PAKAN.JS
// ==========================================================

"use strict";


// ==========================================================
// DATA SEMENTARA PAKAN
// ==========================================================

window.fmcPakanDataSesi =
    window.fmcPakanDataSesi || [];

/*
 * DATA YANG SUDAH TERSIMPAN DI GAS/DB.
 * Dipisahkan dari data sesi agar TIDAK PERNAH ikut
 * terkirim ulang pada savePakan.
 */
window.fmcPakanDataServer =
    window.fmcPakanDataServer || [];


// ==========================================================
// TAMPILKAN HALAMAN PAKAN
// ==========================================================

async function tampilPakan(){

    const page =
        document.getElementById("pakanPage");

    if(!page) return;


    page.innerHTML = `

        <div class="card pakanCard">


            <!-- ==========================================
                 HEADER
            ========================================== -->

            <div class="pakanHeader">

                <div>

                    <h2>

                        <span class="material-symbols-rounded">
                            grain
                        </span>

                        Pakan

                    </h2>

                    <p>
                        Manajemen stok dan penerimaan pakan
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 INPUT STOK MASUK
            ========================================== -->

            <div class="pakanSection">

                <h3>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    Stok Masuk

                </h3>


                <label for="pakanTanggal">
                    Tanggal
                </label>

                <input
                    type="date"
                    id="pakanTanggal"
                    autocomplete="off">


                <label for="pakanKode">
                    Kode Pakan
                </label>

                <select
                    id="pakanKode">

                    <option value="">
                        Pilih kode pakan
                    </option>

                    <option value="BR1">
                        BR1
                    </option>

                    <option value="BR2">
                        BR2
                    </option>

                    <option value="BR3">
                        BR3
                    </option>

                    <option value="511">
                        511
                    </option>

                    <option value="512">
                        512
                    </option>

                </select>


                <!-- JENIS DITAMPILKAN SEBAGAI INFO,
                     BUKAN RUMUS PRODUKSI -->

                <div
                    class="pakanJenisPreview"
                    id="pakanJenisPreview">

                    <span class="material-symbols-rounded">
                        category
                    </span>

                    <div>

                        <small>
                            JENIS PAKAN
                        </small>

                        <strong id="pakanJenis">
                            —
                        </strong>

                    </div>

                </div>


                <label for="pakanHarga">
                    Harga / Kg
                </label>

                <input
                    type="number"
                    id="pakanHarga"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Harga per kilogram"
                    autocomplete="off">


                <label for="pakanQty">
                    Jumlah Zak
                </label>

                <input
                    type="number"
                    id="pakanQty"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Jumlah zak"
                    autocomplete="off">

            </div>


            <!-- ==========================================
                 TAMBAH DATA
            ========================================== -->

            <button
                type="button"
                id="btnTambahPakan"
                class="pakanAddBtn"
                onclick="tambahDataPakan()">

                <span class="material-symbols-rounded">
                    add
                </span>

                TAMBAH DATA

            </button>


            <!-- ==========================================
                 DATA YANG DISIAPKAN
            ========================================== -->

            <div class="pakanSection">

                <h3>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    Data Yang Disiapkan

                </h3>


                <div
                    id="pakanTableWrap"
                    class="pakanTableWrap">

                    ${renderPakanTable()}

                </div>

            </div>


            <!-- ==========================================
                 INFORMASI BERAT
            ========================================== -->

            <div class="pakanInfo">

                <span class="material-symbols-rounded">
                    scale
                </span>

                <div>

                    <strong>
                        Berat per Zak
                    </strong>

                </div>

            </div>


            <!-- ==========================================
                 RINGKASAN STOK
            ========================================== -->

            <div class="pakanSection">

                <h3>

                    <span class="material-symbols-rounded">
                        warehouse
                    </span>

                    Ringkasan Stok

                </h3>


                <div class="pakanStockGrid">


                    <!-- BR1 -->

                    <div class="pakanStockCard">

                        <div class="pakanStockIcon">
                            🌽
                        </div>

                        <div>

                            <strong>
                                BR1
                            </strong>

                            <small>
                                Starter
                            </small>

                            <b id="stokBR1">
                                —
                            </b>

                            <span>
                                zak
                            </span>

                        </div>

                    </div>


                    <!-- BR2 -->

                    <div class="pakanStockCard">

                        <div class="pakanStockIcon">
                            🌽
                        </div>

                        <div>

                            <strong>
                                BR2
                            </strong>

                            <small>
                                Grower
                            </small>

                            <b id="stokBR2">
                                —
                            </b>

                            <span>
                                zak
                            </span>

                        </div>

                    </div>


                    <!-- BR3 -->

                    <div class="pakanStockCard">

                        <div class="pakanStockIcon">
                            🌽
                        </div>

                        <div>

                            <strong>
                                BR3
                            </strong>

                            <small>
                                Finisher
                            </small>

                            <b id="stokBR3">
                                —
                            </b>

                            <span>
                                zak
                            </span>

                        </div>

                    </div>


                </div>

            </div>


            <!-- ==========================================
                 TOTAL STOK
            ========================================== -->

            <div class="pakanTotal">

                <div class="pakanTotalIcon">

                    <span class="material-symbols-rounded">
                        inventory
                    </span>

                </div>

                <div>

                    <small>
                        TOTAL STOK PAKAN
                    </small>

                    <strong id="totalStokPakan">
                        —
                    </strong>

                </div>

            </div>


            <!-- ==========================================
                 MESSAGE
            ========================================== -->

            <div
                id="pakanMessage"
                class="pakanMessage"
                style="display:none;">
            </div>


            <!-- ==========================================
                 BUTTON
            ========================================== -->

            <button
                type="button"
                id="btnSimpanPakan"
                class="pakanSaveBtn"
                onclick="simpanPakanUI()">

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA PAKAN

            </button>


        </div>

    `;


    pasangEventPakan();

    /*
     * FAST OPEN:
     * Jangan menahan render halaman hanya karena GAS lambat.
     * Jika ringkasan stok sudah pernah berhasil diambil dalam
     * sesi aplikasi ini, tampilkan langsung. Sinkronisasi terbaru
     * berjalan di background.
     */
    tampilkanCacheRingkasanStokPakan();
    syncRingkasanStokPakanBackground();

}


// ==========================================================
// SYNC DATA MASTER PAKAN DARI SERVER
// ==========================================================

function normalisasiPakanServerKePWA(row){
    if(!row || typeof row !== "object"){
        return null;
    }

    return {
        id:
            row.id ??
            row.item_id ??
            "",

        tanggal:
            row.tanggal ??
            "",

        kode:
            row.code ??
            row.kode ??
            "",

        jenis:
            row.jenis ??
            "",

        harga:
            row.hargaPerKg ??
            row.harga ??
            "",

        qty:
            row.qtyZak ??
            row.qty ??
            ""
    };
}

function syncPakanItemsFromServer(result){
    const rows =
        Array.isArray(
            result?.data?.items
        )
            ? result.data.items
            : [];

    /*
     * PENTING:
     * Data hasil GET adalah DATA SERVER/DB, bukan data sesi.
     * Jangan pernah memasukkannya ke fmcPakanDataSesi karena
     * fmcPakanDataSesi adalah SATU-SATUNYA sumber payload SAVE.
     */
    window.fmcPakanDataServer =
        rows
            .map(normalisasiPakanServerKePWA)
            .filter(function(row){
                return !!row;
            });

    renderPakanTableInPage();

    return window.fmcPakanDataServer;
}

// ==========================================================
// FAST CACHE RINGKASAN STOK PAKAN
// ==========================================================

window.fmcPakanStockCache =
    window.fmcPakanStockCache || null;

window.fmcPakanStockSyncPromise =
    window.fmcPakanStockSyncPromise || null;

function renderRingkasanStokPakan(stock){
    const stokBR1 = document.getElementById("stokBR1");
    const stokBR2 = document.getElementById("stokBR2");
    const stokBR3 = document.getElementById("stokBR3");
    const totalStok = document.getElementById("totalStokPakan");

    const safe = stock && typeof stock === "object"
        ? stock
        : {};

    const nilaiStok = function(kode){
        const item = safe[String(kode || "").trim().toUpperCase()];
        if(!item || typeof item !== "object") return 0;

        const sisaZak = Number(item.sisaZak);
        if(Number.isFinite(sisaZak)) return sisaZak;

        const sisaKg = Number(item.sisaKg);
        if(Number.isFinite(sisaKg)) return sisaKg / 50;

        return 0;
    };

    const br1 = nilaiStok("BR1");
    const br2 = nilaiStok("BR2");
    const br3 = nilaiStok("BR3");
    const total = br1 + br2 + br3;

    if(stokBR1) stokBR1.textContent = formatAngkaPakan(br1);
    if(stokBR2) stokBR2.textContent = formatAngkaPakan(br2);
    if(stokBR3) stokBR3.textContent = formatAngkaPakan(br3);
    if(totalStok) totalStok.textContent = formatAngkaPakan(total);
}

function tampilkanCacheRingkasanStokPakan(){
    if(
        window.fmcPakanStockCache &&
        window.fmcPakanStockCache.stock
    ){
        renderRingkasanStokPakan(
            window.fmcPakanStockCache.stock
        );
        return true;
    }

    return false;
}

async function syncRingkasanStokPakanBackground(){
    if(window.fmcPakanStockSyncPromise){
        return window.fmcPakanStockSyncPromise;
    }

    window.fmcPakanStockSyncPromise = (async function(){
        try{
            const periodId =
                getFmcPakanActivePeriodId() ||
                await resolveFmcPakanActivePeriod();

            await muatRingkasanStokPakan(
                periodId,
                { background: true }
            );
        }catch(error){
            console.warn(
                "PAKAN background stock sync:",
                error
            );
        }finally{
            window.fmcPakanStockSyncPromise = null;
        }
    })();

    return window.fmcPakanStockSyncPromise;
}

// ==========================================================
// LOAD RINGKASAN STOK DARI GAS
// ==========================================================

async function muatRingkasanStokPakan(periodIdArg, options){

    const stokBR1 = document.getElementById("stokBR1");
    const stokBR2 = document.getElementById("stokBR2");
    const stokBR3 = document.getElementById("stokBR3");
    const totalStok = document.getElementById("totalStokPakan");

    if(!stokBR1 && !stokBR2 && !stokBR3 && !totalStok){
        return;
    }

    const optionsSafe = options || {};
    const hasCache = tampilkanCacheRingkasanStokPakan();

    if(!hasCache){
        if(stokBR1) stokBR1.textContent = "…";
        if(stokBR2) stokBR2.textContent = "…";
        if(stokBR3) stokBR3.textContent = "…";
        if(totalStok) totalStok.textContent = "…";
    }

    try{

        /*
         * getPakanTenantV1() mengembalikan result.data.stok.
         * Setiap item memiliki kode dan sisaStok dari kolom N.
         */
        const periodId =
            String(
                periodIdArg ||
                getFmcPakanActivePeriodId() ||
                ""
            ).trim();

        const result =
            await apiPost(
                "getPakan",
                periodId
                    ? { period_id: periodId }
                    : {}
            );

        if(!result || result.success !== true){
            throw new Error(
                result?.message ||
                "Data stok pakan gagal diambil."
            );
        }

        /*
         * MASTER PAKAN:
         * data.items adalah source of truth untuk
         * rekapan transaksi yang tampil di PWA.
         */
        syncPakanItemsFromServer(result);

        /*
         * CONTRACT ENGINE MASTER PAKAN:
         *
         * result.data.stock adalah OBJECT:
         *
         * {
         *   BR1: {
         *     stokMasukZak,
         *     stokMasukKg,
         *     konsumsiZak,
         *     konsumsiKg,
         *     sisaZak,
         *     sisaKg
         *   }
         * }
         *
         * Bukan result.data.stok dan bukan array
         * dengan field sisaStok.
         */
        const stock = result?.data?.stock || {};

        window.fmcPakanStockCache = {
            periodId: periodId,
            stock: stock,
            updatedAt: Date.now()
        };

        renderRingkasanStokPakan(stock);

    }catch(error){

        console.error("LOAD STOK PAKAN ERROR:", error);

        if(stokBR1) stokBR1.textContent = "—";
        if(stokBR2) stokBR2.textContent = "—";
        if(stokBR3) stokBR3.textContent = "—";
        if(totalStok) totalStok.textContent = "—";
    }
}


function formatAngkaPakan(value){
    const number = Number(value);

    if(!Number.isFinite(number)){
        return "0";
    }

    return number.toLocaleString("id-ID", {
        maximumFractionDigits: 2
    });
}


// ==========================================================
// EVENT PAKAN
// ==========================================================

function pasangEventPakan(){

    const kode =
        document.getElementById("pakanKode");


    if(kode){

        kode.addEventListener(
            "change",
            updateJenisPakanUI
        );

    }

}


// ==========================================================
// JENIS PAKAN
// ==========================================================

function updateJenisPakanUI(){

    const kode =
        document.getElementById("pakanKode")?.value || "";


    const jenis =
        document.getElementById("pakanJenis");


    if(!jenis) return;


    /*
     * Ini hanya untuk UX tampilan.
     *
     * BUKAN rumus spreadsheet.
     *
     * Nilai final tetap akan mengikuti
     * MASTER PAKAN ketika nanti tersambung GAS.
     */

    const jenisMap = {

        "BR1": "Starter",

        "BR2": "Grower",

        "BR3": "Finisher",

        "511": "Starter",

        "512": "Grower-Finisher"

    };


    jenis.textContent =
        jenisMap[kode] || "—";

}


// ==========================================================
// AMBIL DATA FORM PAKAN
// ==========================================================

function ambilFormPakan(){

    const kode =
        document.getElementById(
            "pakanKode"
        )?.value || "";


    const jenisMap = {

        "BR1": "Starter",

        "BR2": "Grower",

        "BR3": "Finisher",

        "511": "Starter",

        "512": "Grower-Finisher"

    };


    return {

        tanggal:
            document.getElementById(
                "pakanTanggal"
            )?.value || "",


        kode:
            kode,


        jenis:
            jenisMap[kode] || "",


        harga:
            document.getElementById(
                "pakanHarga"
            )?.value || "",


        qty:
            document.getElementById(
                "pakanQty"
            )?.value || ""

    };

}


// ==========================================================
// VALIDASI PAKAN
// ==========================================================

function validasiPakan(data){

    if(!data.tanggal){

        tampilPesanPakan(
            "Tanggal belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.kode){

        tampilPesanPakan(
            "Kode pakan belum dipilih.",
            "error"
        );

        return false;

    }


    if(data.harga === ""){

        tampilPesanPakan(
            "Harga pakan belum diisi.",
            "error"
        );

        return false;

    }


    if(data.qty === ""){

        tampilPesanPakan(
            "Jumlah zak belum diisi.",
            "error"
        );

        return false;

    }


    if(
        Number(data.harga) < 0 ||
        Number(data.qty) <= 0
    ){

        tampilPesanPakan(
            "Harga dan jumlah zak harus valid.",
            "error"
        );

        return false;

    }


    return true;

}


// ==========================================================
// TAMBAH DATA PAKAN
// ==========================================================

function tambahDataPakan(){

    const data =
        ambilFormPakan();


    if(!validasiPakan(data)){

        return;

    }


    /*
     * Masukkan data ke sesi PWA.
     */

    window.fmcPakanDataSesi.push(
        data
    );


    /*
     * Refresh rekapan.
     */

    renderPakanTableInPage();


    /*
     * Bersihkan form.
     */

    kosongkanFormPakan();


    tampilPesanPakan(
        "Data pakan berhasil ditambahkan.",
        "success"
    );

}


// ==========================================================
// RENDER REKAPAN PAKAN
// ==========================================================

function renderPakanTable(){

    const serverRows =
        Array.isArray(window.fmcPakanDataServer)
            ? window.fmcPakanDataServer
            : [];

    const sessionRows =
        Array.isArray(window.fmcPakanDataSesi)
            ? window.fmcPakanDataSesi
            : [];

    const data = [];

    /*
     * DATA SERVER
     * Hanya untuk tampilan.
     * Tidak pernah masuk payload SAVE.
     */
    serverRows.forEach(function(item){

        data.push({
            ...item,
            __source: "server"
        });

    });

    /*
     * DATA SESI / PENDING
     * Index disimpan langsung supaya tombol HAPUS
     * tidak tergantung posisi gabungan server + sesi.
     */
    sessionRows.forEach(function(item,index){

        data.push({
            ...item,
            __source: "session",
            __sessionIndex: index
        });

    });


    if(!data.length){

        return `

            <div class="pakanEmpty">

                <span class="material-symbols-rounded">
                    inventory_2
                </span>

                <strong>
                    Belum ada data
                </strong>

                <small>
                    Data pakan yang ditambahkan
                    akan muncul di sini.
                </small>

            </div>

        `;

    }


    return `

        <div class="pakanRekapList">

            ${
                data.map(function(item,index){

                    const tombolHapus = "";

                    return `

                        <div
                            class="pakanRekapItem">

                            <div
                                class="pakanRekapHeader">

                                <div>

                                    <strong>
                                        Pakan #${index + 1}
                                    </strong>

                                    <small>
                                        ${escapePakan(item.tanggal)}
                                    </small>

                                </div>

                                ${tombolHapus}

                            </div>


                            <div
                                class="pakanRekapGrid">

                                <div>
                                    <small>
                                        KODE PAKAN
                                    </small>

                                    <strong>
                                        ${escapePakan(item.kode)}
                                    </strong>
                                </div>


                                <div>
                                    <small>
                                        JENIS
                                    </small>

                                    <strong>
                                        ${escapePakan(item.jenis)}
                                    </strong>
                                </div>


                                <div>
                                    <small>
                                        HARGA / KG
                                    </small>

                                    <strong>
                                        ${escapePakan(item.harga)}
                                    </strong>
                                </div>


                                <div>
                                    <small>
                                        JUMLAH ZAK
                                    </small>

                                    <strong>
                                        ${escapePakan(item.qty)}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    `;

                }).join("")
            }

        </div>

    `;

}


// ==========================================================
// REFRESH REKAPAN
// ==========================================================

function renderPakanTableInPage(){

    const wrap =
        document.getElementById(
            "pakanTableWrap"
        );

    if(!wrap){
        return;
    }

    wrap.innerHTML =
        renderPakanTable();

}


// ==========================================================
// HAPUS DATA PAKAN YANG SUDAH TERSIMPAN DI SERVER
// ==========================================================

async function hapusDataPakanServer(id){

    const targetId =
        String(id ?? "").trim();

    if(!targetId){

        tampilPesanPakan(
            "ID data pakan tidak ditemukan.",
            "error"
        );

        return;
    }


    const confirmed =
        await fmcConfirmHapusPakan_(
            "server",
            null,
            {
                kode: "",
                jenis: "Data pakan tersimpan",
                tanggal: ""
            }
        );

    if(!confirmed){
        return;
    }


    try{

        const periodId =
            await resolveFmcPakanActivePeriod();

        if(!periodId){
            throw new Error(
                "Period aktif Pakan tidak ditemukan."
            );
        }


        const result =
            await apiPost(
                "deletePakan",
                {
                    period_id: periodId,
                    id: targetId
                }
            );


        if(!result || result.success !== true){
            throw new Error(
                result?.message ||
                "Data pakan gagal dihapus."
            );
        }


        /*
         * HANYA serverRows yang diperbarui.
         * Pending/session tetap utuh.
         */
        const rows =
            Array.isArray(result?.data?.items)
                ? result.data.items
                : [];

        syncPakanItemsFromServer({
            data: {
                items: rows
            }
        });


        await muatRingkasanStokPakan(
            getFmcPakanActivePeriodId()
        );


        tampilPesanPakan(
            "Data pakan berhasil dihapus.",
            "success"
        );

    }catch(error){

        console.error(
            "HAPUS PAKAN SERVER ERROR:",
            error
        );

        tampilPesanPakan(
            error.message ||
            "Data pakan gagal dihapus.",
            "error"
        );

    }

}


// ==========================================================
// HAPUS DATA PAKAN SESI / PENDING
// ==========================================================

async function hapusDataPakan(index){

    const sessionRows =
        Array.isArray(window.fmcPakanDataSesi)
            ? window.fmcPakanDataSesi
            : [];

    const targetIndex =
        Number(index);

    if(!Number.isInteger(targetIndex)){
        return;
    }

    if(
        targetIndex < 0 ||
        targetIndex >= sessionRows.length
    ){
        return;
    }


    const item = sessionRows[targetIndex] || {};

    const confirmed =
        await fmcConfirmHapusPakan_(
            "session",
            targetIndex,
            item
        );

    if(!confirmed){
        return;
    }


    sessionRows.splice(
        targetIndex,
        1
    );


    renderPakanTableInPage();


    tampilPesanPakan(
        "Data pakan berhasil dihapus dari data yang disiapkan.",
        "success"
    );

}


// ==========================================================
// DIALOG HAPUS PAKAN — FMC PROFESSIONAL
// Hanya tampilan konfirmasi. Logika hapus tetap sama.
// ==========================================================

function fmcConfirmHapusPakan_(source, index, item){

    return new Promise(function(resolve){

        const existing =
            document.getElementById(
                "fmcPakanDeleteDialog"
            );

        if(existing){
            existing.remove();
        }

        const styleId =
            "fmcPakanDeleteDialogStyle";

        if(!document.getElementById(styleId)){

            const style =
                document.createElement("style");

            style.id = styleId;

            style.textContent = `
                #fmcPakanDeleteDialog{
                    position:fixed;
                    inset:0;
                    z-index:99999;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:24px;
                    box-sizing:border-box;
                    background:rgba(0,0,0,.52);
                    backdrop-filter:blur(4px);
                    -webkit-backdrop-filter:blur(4px);
                    animation:fmcPakanDialogIn .18s ease-out;
                }

                #fmcPakanDeleteDialog .fmc-pd-card{
                    width:min(100%,390px);
                    box-sizing:border-box;
                    background:#fff;
                    color:#172033;
                    border-radius:26px;
                    padding:24px 22px 18px;
                    box-shadow:0 22px 60px rgba(0,0,0,.28);
                    transform-origin:center;
                    animation:fmcPakanDialogCardIn .20s ease-out;
                }

                #fmcPakanDeleteDialog .fmc-pd-icon{
                    width:54px;
                    height:54px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border-radius:17px;
                    margin-bottom:16px;
                    background:#fff1f2;
                    color:#dc2626;
                }

                #fmcPakanDeleteDialog .fmc-pd-icon .material-symbols-rounded{
                    font-size:29px;
                }

                #fmcPakanDeleteDialog .fmc-pd-title{
                    margin:0;
                    font-size:20px;
                    line-height:1.25;
                    font-weight:750;
                    letter-spacing:-.2px;
                }

                #fmcPakanDeleteDialog .fmc-pd-message{
                    margin:10px 0 0;
                    font-size:14px;
                    line-height:1.55;
                    color:#667085;
                }

                #fmcPakanDeleteDialog .fmc-pd-highlight{
                    display:flex;
                    align-items:center;
                    gap:9px;
                    margin-top:14px;
                    padding:9px 11px;
                    border-radius:11px;
                    background:#f8fafc;
                    color:#344054;
                    font-size:13px;
                    font-weight:700;
                }

                #fmcPakanDeleteDialog .fmc-pd-highlight-icon{
                    width:30px;
                    height:30px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex:0 0 30px;
                    border-radius:9px;
                    background:#fff1f2;
                    color:#dc2626;
                }

                #fmcPakanDeleteDialog .fmc-pd-detail{
                    min-width:0;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }

                #fmcPakanDeleteDialog .fmc-pd-actions{
                    display:flex;
                    gap:10px;
                    margin-top:24px;
                }

                #fmcPakanDeleteDialog .fmc-pd-btn{
                    flex:1;
                    min-height:48px;
                    border:0;
                    border-radius:14px;
                    font:inherit;
                    font-size:14px;
                    font-weight:750;
                    cursor:pointer;
                    -webkit-tap-highlight-color:transparent;
                    transition:transform .12s ease,opacity .12s ease;
                }

                #fmcPakanDeleteDialog .fmc-pd-btn:active{
                    transform:scale(.98);
                }

                #fmcPakanDeleteDialog .fmc-pd-cancel{
                    background:#f2f4f7;
                    color:#344054;
                }

                #fmcPakanDeleteDialog .fmc-pd-delete{
                    background:#dc2626;
                    color:#fff;
                    box-shadow:0 7px 18px rgba(220,38,38,.22);
                }

                @keyframes fmcPakanDialogIn{
                    from{opacity:0}
                    to{opacity:1}
                }

                @keyframes fmcPakanDialogCardIn{
                    from{opacity:0;transform:translateY(8px) scale(.97)}
                    to{opacity:1;transform:translateY(0) scale(1)}
                }

                @media (prefers-color-scheme:dark){
                    #fmcPakanDeleteDialog .fmc-pd-card{
                        background:#202124;
                        color:#f1f3f4;
                    }

                    #fmcPakanDeleteDialog .fmc-pd-message{
                        color:#bdc1c6;
                    }

                    #fmcPakanDeleteDialog .fmc-pd-highlight{
                        background:#2b2c2f;
                        color:#e8eaed;
                    }

                    #fmcPakanDeleteDialog .fmc-pd-cancel{
                        background:#303134;
                        color:#e8eaed;
                    }
                }
            `;

            document.head.appendChild(style);
        }

        const safeItem =
            item && typeof item === "object"
                ? item
                : {};

        const kode =
            String(
                safeItem.kode ||
                safeItem.code ||
                ""
            ).trim();

        const jenis =
            String(
                safeItem.jenis ||
                "Pakan"
            ).trim();

        const tanggal =
            String(
                safeItem.tanggal ||
                ""
            ).trim();

        let detail = jenis;

        if(kode){
            detail += " • " + kode;
        }

        if(tanggal){
            detail += " • " + tanggal;
        }

        if(source === "server"){
            detail = "Data pakan tersimpan";
        }

        const dialog =
            document.createElement("div");

        dialog.id =
            "fmcPakanDeleteDialog";

        dialog.setAttribute("role","dialog");
        dialog.setAttribute("aria-modal","true");
        dialog.setAttribute("aria-labelledby","fmcPakanDeleteTitle");

        dialog.innerHTML = `
            <div class="fmc-pd-card" role="document">

                <div class="fmc-pd-icon" aria-hidden="true">
                    <span class="material-symbols-rounded">
                        delete_forever
                    </span>
                </div>

                <h2
                    class="fmc-pd-title"
                    id="fmcPakanDeleteTitle"
                >
                    Hapus Data Pakan?
                </h2>

                <p class="fmc-pd-message">
                    Data yang dipilih akan dihapus dari daftar pakan.
                    Tindakan ini tidak dapat dibatalkan.
                </p>

                <div class="fmc-pd-highlight">
                    <div class="fmc-pd-highlight-icon" aria-hidden="true">
                        <span class="material-symbols-rounded">
                            inventory_2
                        </span>
                    </div>
                    <div class="fmc-pd-detail">
                        ${escapePakan(detail)}
                    </div>
                </div>

                <div class="fmc-pd-actions">

                    <button
                        type="button"
                        class="fmc-pd-btn fmc-pd-cancel"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        class="fmc-pd-btn fmc-pd-delete"
                    >
                        Hapus
                    </button>

                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const cancelBtn =
            dialog.querySelector(".fmc-pd-cancel");

        const deleteBtn =
            dialog.querySelector(".fmc-pd-delete");

        let finished = false;

        const close = function(result){

            if(finished){
                return;
            }

            finished = true;

            if(dialog.parentNode){
                dialog.remove();
            }

            document.removeEventListener(
                "keydown",
                onKeyDown
            );

            resolve(result);
        };

        const onKeyDown = function(event){
            if(event.key === "Escape"){
                close(false);
            }
        };

        if(cancelBtn){
            cancelBtn.addEventListener(
                "click",
                function(){
                    close(false);
                }
            );
        }

        if(deleteBtn){
            deleteBtn.addEventListener(
                "click",
                function(){
                    close(true);
                }
            );
        }

        dialog.addEventListener(
            "click",
            function(event){
                if(event.target === dialog){
                    close(false);
                }
            }
        );

        document.addEventListener(
            "keydown",
            onKeyDown
        );

        if(deleteBtn){
            deleteBtn.focus();
        }
    });
}


// ==========================================================
// LOADING SIMPAN PAKAN — FMC iOS STYLE
// Hanya tampilan. Tidak mengubah proses API/GAS.
// ==========================================================

function fmcShowPakanSaving_(){

    if(document.getElementById("fmcPakanSaving")){
        return;
    }

    if(!document.getElementById("fmcPakanSavingStyle")){

        const style =
            document.createElement("style");

        style.id =
            "fmcPakanSavingStyle";

        style.textContent = `
            @keyframes fmcPakanSavingFadeIn{
                from{opacity:0;transform:scale(.96)}
                to{opacity:1;transform:scale(1)}
            }

            @keyframes fmcPakanSavingSpinner{
                to{transform:rotate(360deg)}
            }

            #fmcPakanSaving{
                position:fixed;
                inset:0;
                z-index:999999;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:24px;
                box-sizing:border-box;
                background:rgba(0,0,0,.34);
                backdrop-filter:blur(10px);
                -webkit-backdrop-filter:blur(10px);
            }

            #fmcPakanSaving .fmc-ps-card{
                width:min(250px,calc(100vw - 48px));
                box-sizing:border-box;
                padding:28px 24px 24px;
                border-radius:28px;
                background:rgba(30,30,32,.96);
                color:#fff;
                text-align:center;
                box-shadow:0 20px 60px rgba(0,0,0,.35);
                animation:fmcPakanSavingFadeIn .18s ease-out;
            }

            #fmcPakanSaving .fmc-ps-spinner{
                width:42px;
                height:42px;
                margin:0 auto 18px;
                border:4px solid rgba(255,255,255,.22);
                border-top-color:#fff;
                border-radius:50%;
                animation:fmcPakanSavingSpinner .78s linear infinite;
            }

            #fmcPakanSaving .fmc-ps-title{
                font-size:18px;
                line-height:1.3;
                font-weight:750;
                letter-spacing:-.2px;
            }

            #fmcPakanSaving .fmc-ps-text{
                margin-top:7px;
                font-size:13px;
                line-height:1.45;
                color:rgba(255,255,255,.68);
            }
        `;

        document.head.appendChild(style);
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "fmcPakanSaving";

    overlay.setAttribute(
        "role",
        "status"
    );

    overlay.setAttribute(
        "aria-live",
        "polite"
    );

    overlay.innerHTML = `
        <div class="fmc-ps-card">
            <div
                class="fmc-ps-spinner"
                aria-hidden="true">
            </div>

            <div class="fmc-ps-title">
                Menyiapkan Data
            </div>

            <div class="fmc-ps-text">
                Mohon tunggu sebentar...
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function fmcHidePakanSaving_(){

    const overlay =
        document.getElementById(
            "fmcPakanSaving"
        );

    if(overlay){
        overlay.remove();
    }
}


// ==========================================================
// KOSONGKAN FORM
// ==========================================================

function kosongkanFormPakan(){

    const tanggal =
        document.getElementById(
            "pakanTanggal"
        );


    const kode =
        document.getElementById(
            "pakanKode"
        );


    const harga =
        document.getElementById(
            "pakanHarga"
        );


    const qty =
        document.getElementById(
            "pakanQty"
        );


    if(tanggal){

        tanggal.value = "";

    }


    if(kode){

        kode.value = "";

    }


    if(harga){

        harga.value = "";

    }


    if(qty){

        qty.value = "";

    }


    updateJenisPakanUI();

}



// ==========================================================
// PERIOD ID MASTER PAKAN
// ==========================================================

function getFmcPakanActivePeriodId(){
    return String(
        window.fmcPakanActivePeriodId ||
        localStorage.getItem("fmcPakanActivePeriodId") ||
        ""
    ).trim();
}

function setFmcPakanActivePeriodId(periodId){
    const id = String(periodId || "").trim();
    if(!id) return;

    window.fmcPakanActivePeriodId = id;

    try{
        localStorage.setItem(
            "fmcPakanActivePeriodId",
            id
        );
    }catch(error){}
}

function resolveFmcPakanPeriods(result){
    const periods =
        result?.data?.periods ||
        result?.periods ||
        result?.data?.items ||
        [];

    return Array.isArray(periods)
        ? periods
        : [];
}

async function resolveFmcPakanActivePeriod(){
    const existing =
        getFmcPakanActivePeriodId();

    try{
        const result =
            await apiPost(
                "getPeriods",
                {}
            );

        if(
            !result ||
            result.success !== true
        ){
            return existing;
        }

        /*
         * D2 Period Bridge mengembalikan:
         * result.data = ARRAY period
         * dan juga result.periods = ARRAY period.
         *
         * Versi lama hanya membaca data.periods sehingga
         * pada tenant baru daftar period menjadi [].
         */
        const periods =
            Array.isArray(result?.data)
                ? result.data
                : (
                    Array.isArray(result?.data?.periods)
                        ? result.data.periods
                        : (
                            Array.isArray(result?.periods)
                                ? result.periods
                                : (
                                    Array.isArray(result?.data?.items)
                                        ? result.data.items
                                        : []
                                )
                        )
                );

        const normalized =
            periods
                .map(function(period){
                    const id = String(
                        period?.period_id ||
                        period?.id ||
                        ""
                    ).trim();

                    if(!id) return null;

                    return {
                        id: id,
                        status: String(
                            period?.status || ""
                        ).trim().toUpperCase(),
                        updated_at: String(
                            period?.updated_at ||
                            period?.created_at ||
                            ""
                        ).trim()
                    };
                })
                .filter(Boolean);

        /*
         * Jangan mempertahankan active period lama hanya karena
         * ID-nya masih ada. Untuk halaman Pakan, pilih period
         * yang benar-benar OPEN dan memiliki master_pakan.
         */
        const withPakan =
            normalized.filter(function(period){
                const source =
                    periods.find(function(raw){
                        return String(
                            raw?.period_id ||
                            raw?.id ||
                            ""
                        ).trim() === period.id;
                    });

                return (
                    period.status === "OPEN" &&
                    Array.isArray(source?.master_pakan) &&
                    source.master_pakan.length > 0
                );
            });

        let selected = "";

        if(withPakan.length){
            withPakan.sort(function(a,b){
                return (Date.parse(b.updated_at) || 0) -
                       (Date.parse(a.updated_at) || 0);
            });
            selected = withPakan[0].id;
        }else{
            const open =
                normalized.filter(function(period){
                    return period.status === "OPEN";
                });

            if(open.length){
                open.sort(function(a,b){
                    return (Date.parse(b.updated_at) || 0) -
                           (Date.parse(a.updated_at) || 0);
                });
                selected = open[0].id;
            }else if(normalized.length === 1){
                selected = normalized[0].id;
            }
        }

        if(selected){
            setFmcPakanActivePeriodId(selected);
            return selected;
        }

        /*
         * Jika period tidak berhasil ditentukan, hapus cache
         * yang sudah tidak valid agar tenant baru tidak mewarisi
         * period tenant/akun sebelumnya.
         */
        try{
            localStorage.removeItem("fmcPakanActivePeriodId");
        }catch(error){}

        window.fmcPakanActivePeriodId = "";
        return "";
    }catch(error){
        console.warn(
            "PAKAN resolve period:",
            error
        );

        return existing;
    }
}

// ==========================================================
// SIMPAN PAKAN
// ==========================================================

async function simpanPakanUI(){

    /*
     * Jika belum ada data di rekapan,
     * gunakan data yang sedang berada
     * di form sebagai satu item.
     */

    let items = [];


    if(
        window.fmcPakanDataSesi &&
        window.fmcPakanDataSesi.length
    ){

        items =
            window.fmcPakanDataSesi.map(
                function(item){

                    return {

                        tanggal:
                            item.tanggal,

                        kode:
                            item.kode,

                        jenis:
                            item.jenis,

                        harga:
                            item.harga,

                        qty:
                            item.qty

                    };

                }
            );

    }else{

        const formData =
            ambilFormPakan();


        if(!validasiPakan(formData)){

            return;

        }


        items = [

            {

                tanggal:
                    formData.tanggal,

                kode:
                    formData.kode,

                jenis:
                    formData.jenis,

                harga:
                    formData.harga,

                qty:
                    formData.qty

            }

        ];

    }


    fmcShowPakanSaving_();

    const button =
        document.getElementById(
            "btnSimpanPakan"
        );


    if(button){

        button.disabled = true;


        button.innerHTML = `

            <span class="material-symbols-rounded">
                sync
            </span>

            MENYIMPAN...

        `;

    }


    try{

        /*
         * =====================================
         * PAYLOAD UNTUK GAS
         * =====================================
         *
         * items HANYA berisi data baru yang masih
         * berada di fmcPakanDataSesi.
         *
         * Data yang sudah tersimpan di DB berada di
         * fmcPakanDataServer dan TIDAK ikut dikirim ulang.
         *
         * GAS membaca:
         * payload.items
         */

        const pertama =
            items[0];


        const result =
            await apiPost(

                "savePakan",

                {

                    period_id:
                        await resolveFmcPakanActivePeriod(),

                    /*
                     * Field utama untuk
                     * kompatibilitas backend.
                     */

                    tanggal:
                        pertama.tanggal,

                    kode:
                        pertama.kode,

                    jenis:
                        pertama.jenis,

                    harga:
                        pertama.harga,

                    qty:
                        pertama.qty,


                    /*
                     * Seluruh data rekapan.
                     */

                    items:
                        JSON.stringify(items)

                }

            );


        if(
            !result ||
            result.success !== true
        ){

            throw new Error(

                result?.message ||
                "Data pakan gagal disimpan."

            );

        }


        /*
         * Berhasil.
         */

        tampilPesanPakan(
            "Data pakan berhasil disimpan.",
            "success"
        );


        /*
         * SAVE BERHASIL.
         *
         * Data yang baru dikirim sudah menjadi milik DB.
         * Hapus HANYA antrean lokal/pending.
         * Jangan pernah memasukkan data server kembali
         * ke fmcPakanDataSesi.
         */
        window.fmcPakanDataSesi = [];

        /*
         * Server menjadi source of truth.
         * Gunakan data.items dari response SAVE agar
         * transaksi yang baru disimpan langsung tampil
         * kembali di PWA tanpa menunggu refresh halaman.
         */
        syncPakanItemsFromServer(result);


        /*
         * Bersihkan form.
         */

        kosongkanFormPakan();


        /*
         * Refresh data server.
         */

        serverData = null;


        await ambilDataServer(true);


        /*
         * Refresh ringkasan stok langsung dari GAS.
         */
        await muatRingkasanStokPakan(
            getFmcPakanActivePeriodId()
        );


        /*
         * Tampilkan toast jika tersedia.
         */

        if(
            typeof showUpdateToast ===
            "function"
        ){

            showUpdateToast(
                "Data pakan berhasil disimpan"
            );

        }

    }
    catch(error){

        console.error(
            "SIMPAN PAKAN ERROR:",
            error
        );


        tampilPesanPakan(

            error.message ||
            "Gagal menyimpan data pakan.",

            "error"

        );

    }
    finally{

        fmcHidePakanSaving_();

        if(button){

            button.disabled = false;


            button.innerHTML = `

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA PAKAN

            `;

        }

    }

}


// ==========================================================
// PESAN
// ==========================================================

function tampilPesanPakan(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "pakanMessage"
        );


    if(!el) return;


    el.style.display =
        "block";


    el.className =
        "pakanMessage " + tipe;


    el.textContent =
        pesan;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapePakan(value){

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}
