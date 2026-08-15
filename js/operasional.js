// ==========================================================
// FMC BROILER MOBILE
// OPERASIONAL.JS
// UI + HITUNG TOTAL + REKAPAN
// ==========================================================

"use strict";


// ==========================================================
// DATA SEMENTARA OPERASIONAL
// ==========================================================

window.fmcOperasionalDataSesi =
    window.fmcOperasionalDataSesi || [];


// ==========================================================
// TAMPILKAN HALAMAN OPERASIONAL
// ==========================================================

async function tampilOperasional(){

    const page =
        document.getElementById(
            "operasionalPage"
        );

    if(!page) return;


    page.innerHTML = `

        <div class="card operasionalCard">


            <!-- ==========================================
                 HEADER
            ========================================== -->

            <div class="operasionalHeader">

                <div>

                    <h2>

                        <span class="material-symbols-rounded">
                            payments
                        </span>

                        Operasional

                    </h2>

                    <p>
                        Pencatatan biaya operasional farm
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 INPUT OPERASIONAL
            ========================================== -->

            <div class="operasionalSection">

                <h3>

                    <span class="material-symbols-rounded">
                        receipt_long
                    </span>

                    Data Pengeluaran

                </h3>


                <!-- TANGGAL -->

                <label for="operasionalTanggal">
                    Tanggal
                </label>

                <input
                    type="date"
                    id="operasionalTanggal"
                    autocomplete="off">


                <!-- KATEGORI MANUAL -->

                <label for="operasionalKategori">
                    Kategori
                </label>

                <input
                    type="text"
                    id="operasionalKategori"
                    placeholder="Ketik kategori sendiri"
                    autocomplete="off">


                <!-- KETERANGAN MANUAL -->

                <label for="operasionalKeterangan">
                    Keterangan
                </label>

                <textarea
                    id="operasionalKeterangan"
                    rows="3"
                    placeholder="Ketik keterangan pengeluaran"
                    autocomplete="off">
                </textarea>


                <!-- HARGA SATUAN -->

                <label for="operasionalHarga">
                    Harga Satuan
                </label>

                <input
                    type="number"
                    id="operasionalHarga"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Masukkan harga satuan"
                    autocomplete="off">


                <!-- QTY -->

                <label for="operasionalQty">
                    Qty
                </label>

                <input
                    type="number"
                    id="operasionalQty"
                    min="0"
                    step="1"
                    inputmode="decimal"
                    placeholder="Masukkan jumlah"
                    autocomplete="off">

            </div>


            <!-- ==========================================
                 TAMBAH DATA
            ========================================== -->

            <button
                type="button"
                id="btnTambahOperasional"
                class="operasionalAddBtn"
                onclick="tambahDataOperasional()">

                <span class="material-symbols-rounded">
                    add
                </span>

                TAMBAH DATA

            </button>


            <!-- ==========================================
                 DATA YANG DISIAPKAN
            ========================================== -->

            <div class="operasionalSection">

                <h3>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    Data Yang Disiapkan

                </h3>


                <div
                    id="operasionalTableWrap"
                    class="operasionalTableWrap">

                    ${renderOperasionalTable()}

                </div>

            </div>


            <!-- ==========================================
                 TOTAL
            ========================================== -->

            <div class="operasionalTotal">

                <div class="operasionalTotalIcon">

                    <span class="material-symbols-rounded">
                        calculate
                    </span>

                </div>

                <div>

                    <small>
                        TOTAL PENGELUARAN
                    </small>

                    <strong id="totalOperasional">
                        —
                    </strong>

                </div>

            </div>


            <!-- ==========================================
                 MESSAGE
            ========================================== -->

            <div
                id="operasionalMessage"
                class="operasionalMessage"
                style="display:none;">
            </div>


            <!-- ==========================================
                 BUTTON
            ========================================== -->

            <button
                type="button"
                id="btnSimpanOperasional"
                class="operasionalSaveBtn"
                onclick="simpanOperasionalUI()">

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA OPERASIONAL

            </button>


        </div>

    `;


    // ======================================================
    // EVENT HITUNG TOTAL OTOMATIS
    // ======================================================

    const hargaInput =
        document.getElementById(
            "operasionalHarga"
        );


    const qtyInput =
        document.getElementById(
            "operasionalQty"
        );


    if(hargaInput){

        hargaInput.addEventListener(
            "input",
            hitungTotalOperasional
        );

    }


    if(qtyInput){

        qtyInput.addEventListener(
            "input",
            hitungTotalOperasional
        );

    }


    // Tampilkan kondisi total awal
    hitungTotalOperasional();

}


// ==========================================================
// HITUNG TOTAL OPERASIONAL
// ==========================================================

function hitungTotalOperasional(){

    const harga =
        parseFloat(
            document.getElementById(
                "operasionalHarga"
            )?.value
        ) || 0;


    const qty =
        parseFloat(
            document.getElementById(
                "operasionalQty"
            )?.value
        ) || 0;


    // RUMUS LAMA TETAP:
    // HARGA SATUAN × QTY

    const total =
        harga * qty;


    const totalEl =
        document.getElementById(
            "totalOperasional"
        );


    if(!totalEl) return;


    if(total <= 0){

        totalEl.textContent = "—";

        return;

    }


    totalEl.textContent =
        formatRupiahOperasional(
            total
        );

}


// ==========================================================
// FORMAT RUPIAH
// ==========================================================

function formatRupiahOperasional(
    value
){

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    );

}


// ==========================================================
// AMBIL DATA FORM
// ==========================================================

function ambilFormOperasional(){

    const harga =
        parseFloat(
            document.getElementById(
                "operasionalHarga"
            )?.value
        ) || 0;


    const qty =
        parseFloat(
            document.getElementById(
                "operasionalQty"
            )?.value
        ) || 0;


    return {

        tanggal:
            document.getElementById(
                "operasionalTanggal"
            )?.value || "",


        kategori:
            document.getElementById(
                "operasionalKategori"
            )?.value.trim() || "",


        keterangan:
            document.getElementById(
                "operasionalKeterangan"
            )?.value.trim() || "",


        harga:
            harga,


        qty:
            qty,


        total:
            harga * qty

    };

}


// ==========================================================
// VALIDASI OPERASIONAL
// ==========================================================

function validasiOperasional(
    data
){

    if(!data.tanggal){

        tampilPesanOperasional(
            "Tanggal belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.kategori){

        tampilPesanOperasional(
            "Kategori belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.keterangan){

        tampilPesanOperasional(
            "Keterangan belum diisi.",
            "error"
        );

        return false;

    }


    if(data.harga <= 0){

        tampilPesanOperasional(
            "Harga satuan harus lebih dari 0.",
            "error"
        );

        return false;

    }


    if(data.qty <= 0){

        tampilPesanOperasional(
            "Qty harus lebih dari 0.",
            "error"
        );

        return false;

    }


    return true;

}


// ==========================================================
// TAMBAH DATA OPERASIONAL
// ==========================================================

function tambahDataOperasional(){

    const data =
        ambilFormOperasional();


    if(
        !validasiOperasional(
            data
        )
    ){

        return;

    }


    /*
     * Simpan data ke sesi PWA.
     */

    window.fmcOperasionalDataSesi.push(
        data
    );


    /*
     * Tampilkan rekapan terbaru.
     */

    renderOperasionalTableInPage();


    /*
     * Kosongkan form
     * untuk input berikutnya.
     */

    kosongkanFormOperasional();


    tampilPesanOperasional(
        "Data operasional berhasil ditambahkan.",
        "success"
    );

}


// ==========================================================
// RENDER REKAPAN OPERASIONAL
// ==========================================================

function renderOperasionalTable(){

    const data =
        window.fmcOperasionalDataSesi || [];


    if(!data.length){

        return `

            <div class="operasionalEmpty">

                <span class="material-symbols-rounded">
                    receipt_long
                </span>


                <strong>
                    Belum ada data
                </strong>


                <small>
                    Data pengeluaran yang ditambahkan
                    akan muncul di sini.
                </small>

            </div>

        `;

    }


    return `

        <div class="operasionalRekapList">

            ${
                data.map(
                    function(item,index){

                        return `

                            <div
                                class="operasionalRekapItem">


                                <!-- HEADER -->

                                <div
                                    class="operasionalRekapHeader">

                                    <div>

                                        <strong>
                                            Pengeluaran #${index + 1}
                                        </strong>

                                        <small>
                                            ${escapeOperasional(
                                                item.tanggal
                                            )}
                                        </small>

                                    </div>


                                    <button
                                        type="button"
                                        class="operasionalDeleteBtn"
                                        onclick="hapusDataOperasional(${index})"
                                        aria-label="Hapus data">

                                        <span class="material-symbols-rounded">
                                            delete
                                        </span>

                                    </button>

                                </div>


                                <!-- DATA UTAMA -->

                                <div
                                    class="operasionalRekapGrid">


                                    <div>

                                        <small>
                                            KATEGORI
                                        </small>

                                        <strong>
                                            ${escapeOperasional(
                                                item.kategori
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            KETERANGAN
                                        </small>

                                        <strong>
                                            ${escapeOperasional(
                                                item.keterangan
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            HARGA SATUAN
                                        </small>

                                        <strong>
                                            ${formatRupiahOperasional(
                                                item.harga
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <small>
                                            QTY
                                        </small>

                                        <strong>
                                            ${escapeOperasional(
                                                item.qty
                                            )}
                                        </strong>

                                    </div>


                                </div>


                                <!-- TOTAL ITEM -->

                                <div
                                    class="operasionalRekapTotal">

                                    <small>
                                        TOTAL
                                    </small>

                                    <strong>
                                        ${formatRupiahOperasional(
                                            item.total
                                        )}
                                    </strong>

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

function renderOperasionalTableInPage(){

    const wrap =
        document.getElementById(
            "operasionalTableWrap"
        );


    if(!wrap){

        return;

    }


    wrap.innerHTML =
        renderOperasionalTable();

}


// ==========================================================
// HAPUS DATA OPERASIONAL
// ==========================================================

function hapusDataOperasional(
    index
){

    if(
        !Number.isInteger(index)
    ){

        return;

    }


    if(
        index < 0 ||
        index >=
        window.fmcOperasionalDataSesi.length
    ){

        return;

    }


    const yakin =
        confirm(
            `Hapus data pengeluaran #${index + 1}?`
        );


    if(!yakin){

        return;

    }


    window.fmcOperasionalDataSesi.splice(
        index,
        1
    );


    renderOperasionalTableInPage();


    tampilPesanOperasional(
        "Data operasional berhasil dihapus.",
        "success"
    );

}


// ==========================================================
// KOSONGKAN FORM
// ==========================================================

function kosongkanFormOperasional(){

    const tanggal =
        document.getElementById(
            "operasionalTanggal"
        );


    const kategori =
        document.getElementById(
            "operasionalKategori"
        );


    const keterangan =
        document.getElementById(
            "operasionalKeterangan"
        );


    const harga =
        document.getElementById(
            "operasionalHarga"
        );


    const qty =
        document.getElementById(
            "operasionalQty"
        );


    if(tanggal){

        tanggal.value = "";

    }


    if(kategori){

        kategori.value = "";

    }


    if(keterangan){

        keterangan.value = "";

    }


    if(harga){

        harga.value = "";

    }


    if(qty){

        qty.value = "";

    }


    hitungTotalOperasional();

}


// ==========================================================
// SIMPAN OPERASIONAL
// ==========================================================

async function simpanOperasionalUI(){

    /*
     * Jika sudah ada data di rekapan,
     * gunakan seluruh data tersebut.
     */

    let items = [];


    if(
        window.fmcOperasionalDataSesi &&
        window.fmcOperasionalDataSesi.length
    ){

        items =
            window.fmcOperasionalDataSesi.map(
                function(item){

                    return {

                        tanggal:
                            item.tanggal,

                        kategori:
                            item.kategori,

                        keterangan:
                            item.keterangan,

                        harga:
                            item.harga,

                        qty:
                            item.qty,

                        total:
                            item.total

                    };

                }
            );

    }else{

        /*
         * Kompatibilitas:
         * jika user langsung menekan SIMPAN
         * tanpa menekan TAMBAH DATA,
         * form tetap dapat diproses.
         */

        const formData =
            ambilFormOperasional();


        if(
            !validasiOperasional(
                formData
            )
        ){

            return;

        }


        items = [

            {

                tanggal:
                    formData.tanggal,

                kategori:
                    formData.kategori,

                keterangan:
                    formData.keterangan,

                harga:
                    formData.harga,

                qty:
                    formData.qty,

                total:
                    formData.total

            }

        ];

    }


    const button =
        document.getElementById(
            "btnSimpanOperasional"
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
         * Seluruh rekapan dikirim melalui:
         *
         * payload.items
         *
         * Action GAS:
         *
         * saveOperasional
         */

        const pertama =
            items[0];


        const result =
            await apiPost(

                "saveOperasional",

                {

                    /*
                     * Field utama.
                     */

                    tanggal:
                        pertama.tanggal,

                    kategori:
                        pertama.kategori,

                    keterangan:
                        pertama.keterangan,

                    harga:
                        pertama.harga,

                    qty:
                        pertama.qty,

                    total:
                        pertama.total,


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
                "Data operasional gagal disimpan."

            );

        }


        tampilPesanOperasional(
            "Data operasional berhasil disimpan.",
            "success"
        );


        /*
         * Bersihkan sesi setelah berhasil.
         */

        window.fmcOperasionalDataSesi =
            [];


        renderOperasionalTableInPage();


        /*
         * Bersihkan form.
         */

        kosongkanFormOperasional();


        /*
         * Refresh data server.
         */

        serverData = null;


        await ambilDataServer(true);


        /*
         * Toast jika tersedia.
         */

        if(
            typeof showUpdateToast ===
            "function"
        ){

            showUpdateToast(
                "Data operasional berhasil disimpan"
            );

        }

    }
    catch(error){

        console.error(
            "SIMPAN OPERASIONAL ERROR:",
            error
        );


        tampilPesanOperasional(

            error.message ||
            "Gagal menyimpan data operasional.",

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

                SIMPAN DATA OPERASIONAL

            `;

        }

    }

}


// ==========================================================
// PESAN
// ==========================================================

function tampilPesanOperasional(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "operasionalMessage"
        );


    if(!el) return;


    el.style.display =
        "block";


    el.className =
        "operasionalMessage " + tipe;


    el.textContent =
        pesan;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeOperasional(
    value
){

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