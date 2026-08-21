// ==========================================================
// FMC BROILER MOBILE
// OPERASIONAL.JS
// UI + HITUNG TOTAL + REKAPAN
// ==========================================================

"use strict";


/* OPERASIONAL SERVER TABLE V1 */
(function(){

    if(document.getElementById("operasionalServerTableStyle")) return;

    const style = document.createElement("style");

    style.id = "operasionalServerTableStyle";

    style.textContent = `
        .operasionalTableScroll{
            width:100%;
            max-width:100%;
            overflow-x:auto;
            overflow-y:hidden;
            -webkit-overflow-scrolling:touch;
            overscroll-behavior-x:contain;
            scrollbar-width:thin;
            padding-bottom:6px;
        }

        .operasionalDataTable{
            width:max-content;
            min-width:760px;
            border-collapse:collapse;
            table-layout:auto;
            font-size:.78rem;
        }

        .operasionalDataTable th,
        .operasionalDataTable td{
            padding:10px 9px;
            text-align:left;
            vertical-align:middle;
            border-bottom:1px solid rgba(127,127,127,.16);
            white-space:nowrap;
        }

        .operasionalDataTable th{
            font-size:.65rem;
            letter-spacing:.035em;
            font-weight:700;
        }

        .operasionalDataTable th:nth-child(1),
        .operasionalDataTable td:nth-child(1){
            min-width:105px;
        }

        .operasionalDataTable th:nth-child(2),
        .operasionalDataTable td:nth-child(2){
            min-width:95px;
        }

        .operasionalDataTable th:nth-child(3),
        .operasionalDataTable td:nth-child(3){
            min-width:160px;
            max-width:220px;
        }

        .operasionalDataTable th:nth-child(4),
        .operasionalDataTable td:nth-child(4){
            min-width:105px;
        }

        .operasionalDataTable th:nth-child(5),
        .operasionalDataTable td:nth-child(5){
            min-width:60px;
            text-align:right;
        }

        .operasionalDataTable th:nth-child(6),
        .operasionalDataTable td:nth-child(6){
            min-width:120px;
            text-align:right;
        }

        .operasionalDataTable th:nth-child(7),
        .operasionalDataTable td:nth-child(7){
            width:52px;
            min-width:52px;
            text-align:center;
        }

        .operasionalDataTable tbody tr:last-child td{
            border-bottom:0;
        }

        .operasionalDetailMain{
            display:block;
            font-weight:600;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }

        .operasionalDetailSub{
            display:block;
            margin-top:3px;
            font-size:.67rem;
            opacity:.68;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }

        .operasionalNumber{
            text-align:right !important;
            white-space:nowrap;
        }

        .operasionalTableTotal{
            font-weight:700;
        }

        .operasionalActionCell{
            text-align:center !important;
            width:52px;
            min-width:52px !important;
        }

        .operasionalDeleteBtn{
            width:34px;
            height:34px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border:0;
            border-radius:9px;
            cursor:pointer;
            padding:0;
        }

        .operasionalDeleteBtn .material-symbols-rounded{
            font-size:18px;
        }

        @media (max-width:600px){
            .operasionalTableScroll{
                margin-right:-2px;
            }

            .operasionalDataTable{
                min-width:760px;
            }

            .operasionalDataTable th,
            .operasionalDataTable td{
                padding:9px 8px;
            }
        }

    `

    document.head.appendChild(style);

})();


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

    /*
     * GET SERVER OPERASIONAL
     * Server menjadi sumber utama data yang sudah tersimpan.
     * Jika GET gagal, sesi yang masih ada tidak dihapus.
     */
    try{

        const result =
            await apiPost(
                "getOperasional",
                {}
            );

        if(
            result &&
            result.success === true &&
            result.data
        ){

            const serverItems =
                Array.isArray(result.data.items)
                    ? result.data.items
                    : [];

            window.fmcOperasionalDataSesi =
                serverItems.map(
                    function(item){

                        return {
                            tanggal:
                                item.tanggal || "",

                            kategori:
                                item.kategori || "",

                            keterangan:
                                item.keterangan || "",

                            harga:
                                Number(item.harga) || 0,

                            qty:
                                Number(item.qty) || 0,

                            total:
                                Number(item.total) ||
                                (
                                    (Number(item.harga) || 0) *
                                    (Number(item.qty) || 0)
                                ),

                            __server: true
                        };

                    }
                );

        }

    }catch(error){

        console.warn(
            "GET OPERASIONAL SERVER GAGAL:",
            error
        );

    }


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

    const totalEl =
        document.getElementById(
            "totalOperasional"
        );

    if(!totalEl) return;

    /*
     * TOTAL PENGELUARAN mengikuti seluruh
     * data yang sudah masuk ke "Data Yang Disiapkan".
     * Setelah TAMBAH DATA, form dikosongkan, jadi
     * total tidak boleh hanya membaca form aktif.
     */
    const data =
        window.fmcOperasionalDataSesi || [];

    let totalRekap =
        data.reduce(
            function(sum, item){

                const harga =
                    Number(item?.harga) || 0;

                const qty =
                    Number(item?.qty) || 0;

                const totalItem =
                    Number(item?.total) ||
                    (harga * qty);

                return sum + totalItem;
            },
            0
        );

    /*
     * Jika belum ada rekapan, tetap tampilkan
     * preview dari form aktif seperti perilaku lama.
     */
    if(data.length === 0){

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

        totalRekap =
            harga * qty;
    }

    if(totalRekap <= 0){
        totalEl.textContent = "—";
        return;
    }

    totalEl.textContent =
        formatRupiahOperasional(
            totalRekap
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

    hitungTotalOperasional();


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
        <div class="operasionalTableScroll">

            <table class="operasionalDataTable">

                <thead>

                    <tr>
                        <th>TANGGAL</th>
                        <th>KATEGORI</th>
                        <th>KETERANGAN</th>
                        <th>HARGA</th>
                        <th>QTY</th>
                        <th>TOTAL</th>
                        <th>🗑️</th>
                    </tr>

                </thead>

                <tbody>

                    ${
                        data.map(
                            function(item,index){

                                return `
                                    <tr>

                                        <td>
                                            ${escapeOperasional(
                                                item.tanggal
                                            )}
                                        </td>

                                        <td>
                                            ${escapeOperasional(
                                                item.kategori
                                            )}
                                        </td>

                                        <td>
                                            ${escapeOperasional(
                                                item.keterangan
                                            )}
                                        </td>

                                        <td class="operasionalNumber">
                                            ${formatRupiahOperasional(
                                                item.harga
                                            )}
                                        </td>

                                        <td class="operasionalNumber">
                                            ${escapeOperasional(
                                                item.qty
                                            )}
                                        </td>

                                        <td class="operasionalNumber operasionalTableTotal">
                                            ${formatRupiahOperasional(
                                                item.total
                                            )}
                                        </td>

                                        <td class="operasionalActionCell">

                                            <button
                                                type="button"
                                                class="operasionalDeleteBtn"
                                                onclick="hapusDataOperasional(${index})"
                                                aria-label="Hapus data"
                                                title="Hapus dari daftar">

                                                <span class="material-symbols-rounded">
                                                    delete
                                                </span>

                                            </button>

                                        </td>

                                    </tr>
                                `;

                            }
                        ).join("")
                    }

                </tbody>

            </table>

        </div>
    `;

}

// ==========================================================
// REFRESH OPERASIONAL LANGSUNG DARI SERVER
// ==========================================================
async function refreshOperasionalDariServer(){

    try{

        const result =
            await apiPost(
                "getOperasional",
                {}
            );

        if(
            !result ||
            result.success !== true ||
            !result.data
        ){
            throw new Error(
                (result && result.message) ||
                "Data Operasional dari server tidak tersedia."
            );
        }

        const serverItems =
            Array.isArray(result.data.items)
                ? result.data.items
                : [];

        window.fmcOperasionalDataSesi =
            serverItems.map(
                function(item){

                    return {
                        tanggal:
                            item.tanggal || "",

                        kategori:
                            item.kategori || "",

                        keterangan:
                            item.keterangan || "",

                        harga:
                            Number(item.harga) || 0,

                        qty:
                            Number(item.qty) || 0,

                        total:
                            Number(item.total) ||
                            (
                                (Number(item.harga) || 0) *
                                (Number(item.qty) || 0)
                            ),

                        __server: true
                    };

                }
            );

        renderOperasionalTableInPage();

        return true;

    }catch(error){

        console.warn(
            "REFRESH OPERASIONAL DARI SERVER GAGAL:",
            error
        );

        return false;

    }

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
    hitungTotalOperasional();


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
                        JSON.stringify(items)

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


        /*
         * Bersihkan form.
         */

        kosongkanFormOperasional();


        /*
         * Ambil ulang DATA OPERASIONAL langsung dari server.
         *
         * Jangan memakai ambilDataServer() di sini karena
         * yang dibutuhkan adalah getOperasional secara khusus.
         * Dengan begitu tabel langsung kembali tanpa refresh
         * halaman atau pindah menu.
         */
        const refreshed =
            await refreshOperasionalDariServer();

        if(!refreshed){

            /*
             * SAVE tetap sukses walaupun GET ulang gagal.
             * Tabel dibiarkan mengikuti status terakhir.
             */
            renderOperasionalTableInPage();

        }


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