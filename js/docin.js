// ==========================================
// FMC BROILER MOBILE
// DOC IN.JS
// ==========================================

"use strict";


// ==========================================
// DATA SEMENTARA DOC IN
// ==========================================

window.fmcDocInDataSesi =
    window.fmcDocInDataSesi || [];


// ==========================================
// TAMPILKAN HALAMAN DOC IN
// ==========================================

async function tampilDocIn(){

    const page =
        document.getElementById(
            "docinPage"
        );

    if(!page) return;


    page.innerHTML = `

        <div class="card docinCard">


            <!-- ==================================
                 HEADER
            ================================== -->

            <div class="docinHeader">

                <div>

                    <h2>

                        <span class="material-symbols-rounded">
                            description
                        </span>

                        DOC In

                    </h2>


                    <p>
                        Input data awal periode dan populasi flok.
                    </p>

                </div>

            </div>


            <!-- ==================================
                 DATA UTAMA DOC IN
            ================================== -->

            <div class="docinSection">

                <h3>

                    <span class="material-symbols-rounded">
                        calendar_month
                    </span>

                    Data DOC In

                </h3>


                <label for="docinTanggal">
                    Tanggal DOC In
                </label>

                <input
                    type="date"
                    id="docinTanggal"
                    autocomplete="off">


                <label for="docinPerusahaan">
                    Nama PT / CV
                </label>

                <input
                    type="text"
                    id="docinPerusahaan"
                    placeholder="Nama perusahaan / farm"
                    autocomplete="off">


                <label for="docinPeriode">
                    Periode Ke
                </label>

                <input
                    type="number"
                    id="docinPeriode"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    placeholder="Contoh: 8"
                    autocomplete="off">


                <label for="docinSupplier">
                    Supplier DOC In
                </label>

                <input
                    type="text"
                    id="docinSupplier"
                    placeholder="Nama supplier DOC"
                    autocomplete="off">


                <label for="docinHarga">
                    Harga DOC / Ekor
                </label>

                <input
                    type="number"
                    id="docinHarga"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Contoh: 8500"
                    autocomplete="off">

            </div>


            <!-- ==================================
                 DATA FLOK
            ================================== -->

            <div class="docinSection">

                <h3>

                    <span class="material-symbols-rounded">
                        warehouse
                    </span>

                    Populasi Flok

                </h3>


                <!-- FLOK A -->

                <div class="docinFlok">

                    <div class="docinFlokTitle">
                        FLOK A
                    </div>


                    <label for="docinPopA">
                        Populasi
                    </label>

                    <input
                        type="number"
                        id="docinPopA"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        placeholder="Jumlah ekor">


                    <label for="docinTglA">
                        Tanggal DOC
                    </label>

                    <input
                        type="date"
                        id="docinTglA">

                </div>


                <!-- FLOK B -->

                <div class="docinFlok">

                    <div class="docinFlokTitle">
                        FLOK B
                    </div>


                    <label for="docinPopB">
                        Populasi
                    </label>

                    <input
                        type="number"
                        id="docinPopB"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        placeholder="Jumlah ekor">


                    <label for="docinTglB">
                        Tanggal DOC
                    </label>

                    <input
                        type="date"
                        id="docinTglB">

                </div>


                <!-- FLOK C -->

                <div class="docinFlok">

                    <div class="docinFlokTitle">
                        FLOK C
                    </div>


                    <label for="docinPopC">
                        Populasi
                    </label>

                    <input
                        type="number"
                        id="docinPopC"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        placeholder="Jumlah ekor">


                    <label for="docinTglC">
                        Tanggal DOC
                    </label>

                    <input
                        type="date"
                        id="docinTglC">

                </div>


                <!-- FLOK D -->

                <div class="docinFlok">

                    <div class="docinFlokTitle">
                        FLOK D
                    </div>


                    <label for="docinPopD">
                        Populasi
                    </label>

                    <input
                        type="number"
                        id="docinPopD"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        placeholder="Jumlah ekor">


                    <label for="docinTglD">
                        Tanggal DOC
                    </label>

                    <input
                        type="date"
                        id="docinTglD">

                </div>

            </div>


            <!-- ==================================
                 TAMBAH DATA
            ================================== -->

            <button
                type="button"
                id="btnTambahDocIn"
                class="docinAddBtn"
                onclick="tambahDataDocIn()">

                <span class="material-symbols-rounded">
                    add
                </span>

                TAMBAH DATA

            </button>


            <!-- ==================================
                 DATA YANG DISIAPKAN
            ================================== -->

            <div class="docinSection">

                <h3>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    Data Yang Disiapkan

                </h3>


                <div
                    id="docinTableWrap"
                    class="docinTableWrap">

                    ${renderDocInTable()}

                </div>

            </div>


            <!-- ==================================
                 HASIL DARI SPREADSHEET
            ================================== -->

            <div class="docinResult">

                <div class="docinResultIcon">

                    <span class="material-symbols-rounded">
                        calculate
                    </span>

                </div>


                <div>

                    <small>
                        TOTAL DOC IN
                    </small>

                    <strong id="docinTotal">
                        —
                    </strong>

                </div>

            </div>


            <!-- ==================================
                 MESSAGE
            ================================== -->

            <div
                id="docinMessage"
                class="docinMessage"
                style="display:none;">
            </div>


            <!-- ==================================
                 BUTTON
            ================================== -->

            <button
                type="button"
                id="btnSimpanDocIn"
                class="docinSaveBtn"
                onclick="simpanDocIn()">

                <span class="material-symbols-rounded">
                    cloud_upload
                </span>

                SIMPAN DATA DOC IN

            </button>


        </div>

    `;


    // Muat data server seperti sebelumnya
    await muatDocIn();

}



// ==========================================
// AMBIL DATA FORM
// ==========================================

function ambilFormDocIn(){

    return {

        tanggal:
            document.getElementById(
                "docinTanggal"
            )?.value || "",


        perusahaan:
            document.getElementById(
                "docinPerusahaan"
            )?.value.trim() || "",


        periode:
            document.getElementById(
                "docinPeriode"
            )?.value || "",


        supplier:
            document.getElementById(
                "docinSupplier"
            )?.value.trim() || "",


        harga:
            document.getElementById(
                "docinHarga"
            )?.value || "",


        flokA: {

            populasi:
                document.getElementById(
                    "docinPopA"
                )?.value || "",

            tanggal:
                document.getElementById(
                    "docinTglA"
                )?.value || ""

        },


        flokB: {

            populasi:
                document.getElementById(
                    "docinPopB"
                )?.value || "",

            tanggal:
                document.getElementById(
                    "docinTglB"
                )?.value || ""

        },


        flokC: {

            populasi:
                document.getElementById(
                    "docinPopC"
                )?.value || "",

            tanggal:
                document.getElementById(
                    "docinTglC"
                )?.value || ""

        },


        flokD: {

            populasi:
                document.getElementById(
                    "docinPopD"
                )?.value || "",

            tanggal:
                document.getElementById(
                    "docinTglD"
                )?.value || ""

        }

    };

}



// ==========================================
// VALIDASI
// ==========================================

function validasiDocIn(data){

    if(!data.tanggal){

        tampilPesanDocIn(
            "Tanggal DOC In belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.perusahaan){

        tampilPesanDocIn(
            "Nama PT / CV belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.periode){

        tampilPesanDocIn(
            "Periode belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.supplier){

        tampilPesanDocIn(
            "Supplier DOC belum diisi.",
            "error"
        );

        return false;

    }


    if(data.harga === ""){

        tampilPesanDocIn(
            "Harga DOC belum diisi.",
            "error"
        );

        return false;

    }


    return true;

}



// ==========================================
// TAMBAH DATA DOC IN
// ==========================================

function tambahDataDocIn(){

    const data =
        ambilFormDocIn();


    if(!validasiDocIn(data)){
        return;
    }


    /*
     * Masukkan data lengkap
     * ke sesi PWA.
     */

    window.fmcDocInDataSesi.push(
        data
    );


    /*
     * Tampilkan rekapan terbaru.
     */

    renderDocInTableInPage();


    /*
     * Bersihkan form supaya
     * user bisa memasukkan data berikutnya.
     */

    kosongkanFormDocIn();


    tampilPesanDocIn(
        "Data DOC In berhasil ditambahkan.",
        "success"
    );

}



// ==========================================
// RENDER REKAPAN DOC IN
// ==========================================

function renderDocInTable(){

    const data =
        window.fmcDocInDataSesi || [];


    if(!data.length){

        return `

            <div class="docinEmpty">

                <span class="material-symbols-rounded">
                    inventory_2
                </span>


                <strong>
                    Belum ada data
                </strong>


                <small>
                    Data DOC In yang ditambahkan
                    akan muncul di sini.
                </small>

            </div>

        `;

    }


    return `

        <div class="docinRekapList">

            ${
                data.map(
                    function(item,index){

                        return `

                            <div
                                class="docinRekapItem">


                                <!-- HEADER -->

                                <div
                                    class="docinRekapHeader">

                                    <div>

                                        <strong>
                                            DOC In #${index + 1}
                                        </strong>

                                        <small>
                                            ${escapeDocIn(
                                                item.tanggal
                                            )}
                                        </small>

                                    </div>


                                    <button
                                        type="button"
                                        class="docinDeleteBtn"
                                        onclick="hapusDataDocIn(${index})"
                                        aria-label="Hapus data">

                                        <span class="material-symbols-rounded">
                                            delete
                                        </span>

                                    </button>

                                </div>


                                <!-- DATA UTAMA -->

                                <div
                                    class="docinRekapGrid">


                                    <div>

                                        <small>
                                            PT / CV
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.perusahaan
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            PERIODE
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.periode
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            SUPPLIER
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.supplier
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            HARGA / EKOR
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.harga
                                            )}
                                        </strong>

                                    </div>


                                </div>


                                <!-- DATA FLOK -->

                                <div
                                    class="docinRekapFlok">


                                    <div>

                                        <small>
                                            FLOK A
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.flokA.populasi
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeDocIn(
                                                item.flokA.tanggal
                                            )}
                                        </small>

                                    </div>


                                    <div>

                                        <small>
                                            FLOK B
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.flokB.populasi
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeDocIn(
                                                item.flokB.tanggal
                                            )}
                                        </small>

                                    </div>


                                    <div>

                                        <small>
                                            FLOK C
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.flokC.populasi
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeDocIn(
                                                item.flokC.tanggal
                                            )}
                                        </small>

                                    </div>


                                    <div>

                                        <small>
                                            FLOK D
                                        </small>

                                        <strong>
                                            ${escapeDocIn(
                                                item.flokD.populasi
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeDocIn(
                                                item.flokD.tanggal
                                            )}
                                        </small>

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



// ==========================================
// REFRESH REKAPAN
// ==========================================

function renderDocInTableInPage(){

    const wrap =
        document.getElementById(
            "docinTableWrap"
        );


    if(!wrap){
        return;
    }


    wrap.innerHTML =
        renderDocInTable();

}



// ==========================================
// HAPUS DATA DOC IN
// ==========================================

function hapusDataDocIn(index){

    if(!Number.isInteger(index)){
        return;
    }


    if(
        index < 0 ||
        index >=
        window.fmcDocInDataSesi.length
    ){

        return;

    }


    const yakin =
        confirm(
            `Hapus data DOC In #${index + 1}?`
        );


    if(!yakin){
        return;
    }


    window.fmcDocInDataSesi.splice(
        index,
        1
    );


    renderDocInTableInPage();


    tampilPesanDocIn(
        "Data DOC In berhasil dihapus.",
        "success"
    );

}



// ==========================================
// KOSONGKAN FORM
// ==========================================

function kosongkanFormDocIn(){

    const ids = [

        "docinTanggal",
        "docinPerusahaan",
        "docinPeriode",
        "docinSupplier",
        "docinHarga",

        "docinPopA",
        "docinTglA",

        "docinPopB",
        "docinTglB",

        "docinPopC",
        "docinTglC",

        "docinPopD",
        "docinTglD"

    ];


    ids.forEach(
        function(id){

            const el =
                document.getElementById(id);


            if(el){

                el.value = "";

            }

        }
    );

}



// ==========================================
// SIMPAN DOC IN
// ==========================================

async function simpanDocIn(){

    const formData =
        ambilFormDocIn();


    /*
     * Jika ada data di rekapan,
     * gunakan rekapan sebagai sumber utama.
     *
     * Jika belum ada rekapan,
     * gunakan data form lama.
     */

    let items = [];


    if(
        window.fmcDocInDataSesi &&
        window.fmcDocInDataSesi.length
    ){

        items =
            window.fmcDocInDataSesi.map(
                function(item){

                    return {

                        tanggal:
                            item.tanggal,

                        perusahaan:
                            item.perusahaan,

                        periode:
                            item.periode,

                        supplier:
                            item.supplier,

                        harga:
                            item.harga,

                        popA:
                            item.flokA.populasi,

                        tglA:
                            item.flokA.tanggal,

                        popB:
                            item.flokB.populasi,

                        tglB:
                            item.flokB.tanggal,

                        popC:
                            item.flokC.populasi,

                        tglC:
                            item.flokC.tanggal,

                        popD:
                            item.flokD.populasi,

                        tglD:
                            item.flokD.tanggal

                    };

                }
            );

    }else{

        /*
         * Kompatibilitas dengan
         * cara lama.
         */

        if(!validasiDocIn(formData)){
            return;
        }


        items = [

            {

                tanggal:
                    formData.tanggal,

                perusahaan:
                    formData.perusahaan,

                periode:
                    formData.periode,

                supplier:
                    formData.supplier,

                harga:
                    formData.harga,

                popA:
                    formData.flokA.populasi,

                tglA:
                    formData.flokA.tanggal,

                popB:
                    formData.flokB.populasi,

                tglB:
                    formData.flokB.tanggal,

                popC:
                    formData.flokC.populasi,

                tglC:
                    formData.flokC.tanggal,

                popD:
                    formData.flokD.populasi,

                tglD:
                    formData.flokD.tanggal

            }

        ];

    }


    const button =
        document.getElementById(
            "btnSimpanDocIn"
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
         * DATA SIAP DIKIRIM KE GAS
         * =====================================
         *
         * items = seluruh rekapan.
         *
         * GAS nantinya dapat membaca:
         *
         * payload.items
         *
         * Struktur setiap item:
         *
         * tanggal
         * perusahaan
         * periode
         * supplier
         * harga
         * popA / tglA
         * popB / tglB
         * popC / tglC
         * popD / tglD
         *
         * Field lama tetap dikirim
         * menggunakan item pertama.
         *
         * Ini menjaga kompatibilitas
         * dengan backend lama.
         */


        const pertama =
            items[0];


        const result =
            await apiPost(

                "saveDocIn",

                {

                    // Data lama

                    tanggal:
                        pertama.tanggal,

                    perusahaan:
                        pertama.perusahaan,

                    periode:
                        pertama.periode,

                    supplier:
                        pertama.supplier,

                    harga:
                        pertama.harga,

                    popA:
                        pertama.popA,

                    tglA:
                        pertama.tglA,

                    popB:
                        pertama.popB,

                    tglB:
                        pertama.tglB,

                    popC:
                        pertama.popC,

                    tglC:
                        pertama.tglC,

                    popD:
                        pertama.popD,

                    tglD:
                        pertama.tglD,


                    // Data baru

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
                "Data DOC In gagal disimpan."

            );

        }


        tampilPesanDocIn(

            "Data DOC In berhasil disimpan.",

            "success"

        );


        /*
         * Setelah berhasil,
         * kosongkan rekapan.
         */

        window.fmcDocInDataSesi = [];


        renderDocInTableInPage();


        /*
         * Ambil ulang data server
         * supaya hasil spreadsheet terbaru
         * bisa digunakan FMC.
         */

        serverData = null;

        await ambilDataServer(true);


        /*
         * Ambil ulang DOC IN.
         */

        await muatDocIn();


        showUpdateToast(
            "Data DOC In berhasil disimpan"
        );


    }
    catch(error){

        console.error(
            "SIMPAN DOC IN ERROR:",
            error
        );


        tampilPesanDocIn(

            error.message ||
            "Gagal menyimpan data DOC In.",

            "error"

        );

    }
    finally{

        if(button){

            button.disabled = false;

            button.innerHTML = `

                <span class="material-symbols-rounded">
                    cloud_upload
                </span>

                SIMPAN DATA DOC IN

            `;

        }

    }

}



// ==========================================
// LOAD DATA DOC IN
// ==========================================

async function muatDocIn(){

    /*
     * Fungsi ini tetap menggunakan
     * backend yang sekarang.
     *
     * Rekapan sesi PWA tidak dihapus
     * oleh fungsi ini.
     */

    try{

        const result =
            await apiPost(
                "getDocIn"
            );


        if(
            !result ||
            result.success !== true ||
            !result.data
        ){

            return;

        }


        isiFormDocIn(
            result.data
        );


    }
    catch(error){

        console.error(
            "LOAD DOC IN ERROR:",
            error
        );

    }

}



// ==========================================
// ISI DATA KE FORM
// ==========================================

function isiFormDocIn(data){

    if(!data) return;


    const setValue = (
        id,
        value
    ) => {

        const el =
            document.getElementById(id);


        if(el){

            el.value =
                value ?? "";

        }

    };


    setValue(
        "docinTanggal",
        data.tanggal
    );


    setValue(
        "docinPerusahaan",
        data.perusahaan
    );


    setValue(
        "docinPeriode",
        data.periode
    );


    setValue(
        "docinSupplier",
        data.supplier
    );


    setValue(
        "docinHarga",
        data.harga
    );


    setValue(
        "docinPopA",
        data.popA
    );


    setValue(
        "docinTglA",
        data.tglA
    );


    setValue(
        "docinPopB",
        data.popB
    );


    setValue(
        "docinTglB",
        data.tglB
    );


    setValue(
        "docinPopC",
        data.popC
    );


    setValue(
        "docinTglC",
        data.tglC
    );


    setValue(
        "docinPopD",
        data.popD
    );


    setValue(
        "docinTglD",
        data.tglD
    );


    /*
     * Total DOC bukan dihitung di sini.
     *
     * Nilainya harus datang
     * dari spreadsheet.
     */

    setValue(
        "docinTotal",
        data.total
    );

}



// ==========================================
// PESAN
// ==========================================

function tampilPesanDocIn(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "docinMessage"
        );


    if(!el) return;


    el.style.display =
        "block";


    el.className =
        "docinMessage " + tipe;


    el.textContent =
        pesan;

}



// ==========================================
// ESCAPE HTML
// ==========================================

function escapeDocIn(value){

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