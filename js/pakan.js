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
                            🌾
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
                            🌾
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
                            🌾
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

    const data =
        window.fmcPakanDataSesi || [];


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
                data.map(
                    function(item,index){

                        return `

                            <div
                                class="pakanRekapItem">


                                <!-- HEADER -->

                                <div
                                    class="pakanRekapHeader">

                                    <div>

                                        <strong>
                                            Pakan #${index + 1}
                                        </strong>

                                        <small>
                                            ${escapePakan(
                                                item.tanggal
                                            )}
                                        </small>

                                    </div>


                                    <button
                                        type="button"
                                        class="pakanDeleteBtn"
                                        onclick="hapusDataPakan(${index})"
                                        aria-label="Hapus data">

                                        <span class="material-symbols-rounded">
                                            delete
                                        </span>

                                    </button>

                                </div>


                                <!-- DATA -->

                                <div
                                    class="pakanRekapGrid">


                                    <div>

                                        <small>
                                            KODE PAKAN
                                        </small>

                                        <strong>
                                            ${escapePakan(
                                                item.kode
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            JENIS
                                        </small>

                                        <strong>
                                            ${escapePakan(
                                                item.jenis
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            HARGA / KG
                                        </small>

                                        <strong>
                                            ${escapePakan(
                                                item.harga
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            JUMLAH ZAK
                                        </small>

                                        <strong>
                                            ${escapePakan(
                                                item.qty
                                            )}
                                        </strong>

                                    </div>


                                </div>


                            </div>

                        `;

                    }
                ).join("")
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
// HAPUS DATA PAKAN
// ==========================================================

function hapusDataPakan(index){

    if(!Number.isInteger(index)){

        return;

    }


    if(
        index < 0 ||
        index >=
        window.fmcPakanDataSesi.length
    ){

        return;

    }


    const yakin =
        confirm(
            `Hapus data pakan #${index + 1}?`
        );


    if(!yakin){

        return;

    }


    window.fmcPakanDataSesi.splice(
        index,
        1
    );


    renderPakanTableInPage();


    tampilPesanPakan(
        "Data pakan berhasil dihapus.",
        "success"
    );

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
         * items berisi seluruh data
         * yang ada di Data Yang Disiapkan.
         *
         * GAS nantinya membaca:
         *
         * payload.items
         */

        const pertama =
            items[0];


        const result =
            await apiPost(

                "savePakan",

                {

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
                        items

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
         * Kosongkan data sesi.
         */

        window.fmcPakanDataSesi = [];


        renderPakanTableInPage();


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
