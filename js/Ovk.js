// ==========================================================
// FMC BROILER MOBILE V11
// OVK.JS
// ==========================================================
// MODUL : OVK / OBAT & VITAMIN
// STATUS: UI + PERHITUNGAN LOKAL
// GAS   : BELUM DIHUBUNGKAN
//
// STRUKTUR SHEET 💊 Obat
//
// A = No
// B = Tgl/Bulan
// C = Nama Obat
// D = Harga
// E = Qty
// F = Total
//
// RUMUS:
// Total Item = Harga × Qty
// Total OVK  = jumlah seluruh Total Item
// ==========================================================

"use strict";


// ==========================================================
// DATA SEMENTARA OVK
// ==========================================================

window.fmcOVKDataSesi =
    window.fmcOVKDataSesi || [];


// ==========================================================
// TAMPILKAN HALAMAN OVK
// ==========================================================

function tampilOVK(){

    const page =
        document.getElementById(
            "ovkPage"
        );


    if(!page){

        console.warn(
            "OVK: #ovkPage tidak ditemukan."
        );

        return;
    }


    page.innerHTML =
        renderOVKPage();


    initOVK();

}


// ==========================================================
// RENDER HALAMAN UTAMA
// ==========================================================

function renderOVKPage(){

    return `

        <section class="ovkPage">


            <!-- ==========================================
                 HEADER
            ========================================== -->

            <div class="ovkHeader">

                <div class="ovkHeaderIcon">

                    <span class="material-symbols-rounded">
                        medication
                    </span>

                </div>


                <div class="ovkHeaderText">

                    <div class="ovkHeaderSmall">
                        FMC BROILER MOBILE V11
                    </div>

                    <h2>
                        OVK
                    </h2>

                    <p>
                        Data Obat & Vitamin
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 INFORMASI
            ========================================== -->

            <div class="ovkInfo">

                <span class="material-symbols-rounded">
                    info
                </span>


                <div>

                    <strong>
                        Data OVK
                    </strong>

                    <p>
                        Silakan isi data obat atau vitamin
                        sesuai data yang diterima dari perusahaan.
                        Sistem FMC menghitung biaya berdasarkan
                        Harga × Qty.
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 INPUT DATA
            ========================================== -->

            <div class="ovkCard">


                <div class="ovkSectionTitle">

                    <span class="material-symbols-rounded">
                        edit_note
                    </span>

                    <h3>
                        Input Data Obat
                    </h3>

                </div>


                <div class="ovkForm">


                    <!-- TANGGAL -->

                    <div class="ovkField">

                        <label for="ovkTanggal">
                            Tgl / Bulan
                        </label>

                        <input
                            type="date"
                            id="ovkTanggal"
                            autocomplete="off">

                    </div>


                    <!-- NAMA OBAT -->

                    <div class="ovkField">

                        <label for="ovkNamaObat">
                            Nama Obat
                        </label>

                        <input
                            type="text"
                            id="ovkNamaObat"
                            maxlength="100"
                            placeholder="Contoh: Vitamin, obat, vaksin"
                            autocomplete="off">

                    </div>


                    <!-- HARGA DAN QTY -->

                    <div class="ovkFormRow">


                        <div class="ovkField">

                            <label for="ovkHarga">
                                Harga
                            </label>

                            <input
                                type="number"
                                id="ovkHarga"
                                min="0"
                                step="1"
                                inputmode="numeric"
                                placeholder="Harga"
                                autocomplete="off"
                                oninput="hitungTotalOVKInput()">

                        </div>


                        <div class="ovkField">

                            <label for="ovkQty">
                                Qty
                            </label>

                            <input
                                type="number"
                                id="ovkQty"
                                min="0"
                                step="0.01"
                                inputmode="decimal"
                                placeholder="Jumlah"
                                autocomplete="off"
                                oninput="hitungTotalOVKInput()">

                        </div>


                    </div>


                    <!-- TOTAL INPUT -->

                    <div class="ovkField">

                        <label for="ovkTotal">
                            Total
                        </label>

                        <input
                            type="text"
                            id="ovkTotal"
                            value="—"
                            readonly
                            tabindex="-1"
                            aria-readonly="true">

                    </div>


                    <!-- PESAN -->

                    <div
                        id="ovkMessage"
                        class="ovkMessage"
                        style="display:none;">
                    </div>


                    <!-- TAMBAH DATA -->

                    <button
                        type="button"
                        id="btnTambahOVK"
                        class="ovkAddBtn"
                        onclick="tambahDataOVK()">

                        <span class="material-symbols-rounded">
                            add
                        </span>

                        TAMBAH DATA

                    </button>


                </div>

            </div>


            <!-- ==========================================
                 DATA YANG DISIAPKAN
            ========================================== -->

            <div class="ovkCard">


                <div class="ovkSectionTitle">

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    <h3>
                        Data Yang Disiapkan
                    </h3>

                </div>


                <div
                    id="ovkTableWrap"
                    class="ovkTableWrap">

                    ${renderOVKTable()}

                </div>


            </div>


            <!-- ==========================================
                 SIMPAN
            ========================================== -->

            <div class="ovkSaveArea">

                <button
                    type="button"
                    id="btnSimpanOVK"
                    class="ovkSaveBtn"
                    onclick="simpanDataOVK()">

                    <span class="material-symbols-rounded">
                        save
                    </span>

                    SIMPAN DATA OVK

                </button>


                <small>

                    
                    <b> 💊 </b>
                    

                </small>

            </div>


        </section>

    `;

}


// ==========================================================
// INISIALISASI OVK
// ==========================================================

function initOVK(){

    const tanggal =
        document.getElementById(
            "ovkTanggal"
        );


    if(
        tanggal &&
        !tanggal.value
    ){

        tanggal.value =
            tanggalHariIniOVK();

    }


    renderOVKTableInPage();

}


// ==========================================================
// TANGGAL HARI INI
// ==========================================================
// Menggunakan waktu lokal perangkat.
// Tidak menggunakan toISOString()
// agar tidak bergeser tanggal karena UTC.
// ==========================================================

function tanggalHariIniOVK(){

    const now =
        new Date();


    const tahun =
        now.getFullYear();


    const bulan =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const hari =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        tahun +
        "-" +
        bulan +
        "-" +
        hari
    );

}


// ==========================================================
// HITUNG TOTAL INPUT
// ==========================================================
// Harga × Qty
// ==========================================================

function hitungTotalOVKInput(){

    const harga =
        parseFloat(
            document.getElementById(
                "ovkHarga"
            )?.value
        );


    const qty =
        parseFloat(
            document.getElementById(
                "ovkQty"
            )?.value
        );


    const totalEl =
        document.getElementById(
            "ovkTotal"
        );


    if(!totalEl){

        return;
    }


    if(
        !Number.isFinite(harga) ||
        !Number.isFinite(qty) ||
        harga <= 0 ||
        qty <= 0
    ){

        totalEl.value =
            "—";

        return;
    }


    const total =
        harga * qty;


    totalEl.value =
        formatRupiahOVK(
            total
        );

}


// ==========================================================
// TAMBAH DATA OVK
// ==========================================================

function tambahDataOVK(){

    const tanggal =
        document.getElementById(
            "ovkTanggal"
        )?.value || "";


    const namaObat =
        document.getElementById(
            "ovkNamaObat"
        )?.value.trim() || "";


    const hargaRaw =
        document.getElementById(
            "ovkHarga"
        )?.value || "";


    const qtyRaw =
        document.getElementById(
            "ovkQty"
        )?.value || "";


    // ==========================================
    // VALIDASI TANGGAL
    // ==========================================

    if(!tanggal){

        tampilPesanOVK(
            "Silakan isi tanggal / bulan.",
            "warning"
        );

        return;
    }


    // ==========================================
    // VALIDASI NAMA
    // ==========================================

    if(!namaObat){

        tampilPesanOVK(
            "Silakan isi nama obat atau vitamin.",
            "warning"
        );

        return;
    }


    // ==========================================
    // VALIDASI HARGA
    // ==========================================

    if(
        hargaRaw === ""
    ){

        tampilPesanOVK(
            "Silakan isi harga.",
            "warning"
        );

        return;
    }


    const harga =
        Number(
            hargaRaw
        );


    if(
        !Number.isFinite(harga) ||
        harga <= 0
    ){

        tampilPesanOVK(
            "Harga harus lebih dari 0.",
            "warning"
        );

        return;
    }


    // ==========================================
    // VALIDASI QTY
    // ==========================================

    if(
        qtyRaw === ""
    ){

        tampilPesanOVK(
            "Silakan isi Qty.",
            "warning"
        );

        return;
    }


    const qty =
        Number(
            qtyRaw
        );


    if(
        !Number.isFinite(qty) ||
        qty <= 0
    ){

        tampilPesanOVK(
            "Qty harus lebih dari 0.",
            "warning"
        );

        return;
    }


    // ==========================================
    // HITUNG TOTAL ITEM
    // ==========================================

    const total =
        harga * qty;


    // ==========================================
    // DATA BARU
    // ==========================================

    const data = {

        tanggal:
            tanggal,

        namaObat:
            namaObat,

        harga:
            harga,

        qty:
            qty,

        total:
            total

    };


    // ==========================================
    // MASUKKAN KE DATA SESI
    // ==========================================

    window.fmcOVKDataSesi.push(
        data
    );


    // ==========================================
    // REFRESH TABEL
    // ==========================================

    renderOVKTableInPage();


    // ==========================================
    // RESET INPUT
    // ==========================================

    resetFormOVK();


    // ==========================================
    // PESAN
    // ==========================================

    tampilPesanOVK(
        "Data OVK berhasil ditambahkan.",
        "success"
    );

}


// ==========================================================
// RENDER TABEL
// ==========================================================

function renderOVKTable(){

    const data =
        window.fmcOVKDataSesi || [];


    // ==========================================
    // BELUM ADA DATA
    // ==========================================

    if(
        !data.length
    ){

        return `

            <div class="ovkEmpty">

                <span class="material-symbols-rounded">
                    medication
                </span>

                <strong>
                    Belum ada data
                </strong>

                <small>
                    Data obat atau vitamin yang
                    ditambahkan akan muncul di sini.
                </small>

            </div>

        `;

    }


    // ==========================================
    // HITUNG TOTAL KESELURUHAN
    // ==========================================

    const totalKeseluruhan =
        data.reduce(
            function(
                total,
                item
            ){

                return (
                    total +
                    (
                        Number(
                            item.total
                        ) || 0
                    )
                );

            },
            0
        );


    // ==========================================
    // TABEL
    // ==========================================

    return `

        <div class="ovkTableScroll">

            <table class="ovkTable">


                <!-- HEADER -->

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Tgl/Bulan
                        </th>

                        <th>
                            Nama Obat
                        </th>

                        <th>
                            Harga
                        </th>

                        <th>
                            Qty
                        </th>

                        <th>
                            Total
                        </th>

                        <th>
                        </th>

                    </tr>

                </thead>


                <!-- DATA -->

                <tbody>

                    ${
                        data.map(
                            function(
                                item,
                                index
                            ){

                                return `

                                    <tr>


                                        <!-- NO -->

                                        <td>
                                            ${index + 1}
                                        </td>


                                        <!-- TANGGAL -->

                                        <td>
                                            ${escapeOVK(
                                                formatTanggalOVK(
                                                    item.tanggal
                                                )
                                            )}
                                        </td>


                                        <!-- NAMA -->

                                        <td
                                            class="ovkNameCell">

                                            ${escapeOVK(
                                                item.namaObat
                                            )}

                                        </td>


                                        <!-- HARGA -->

                                        <td>
                                            ${formatRupiahOVK(
                                                item.harga
                                            )}
                                        </td>


                                        <!-- QTY -->

                                        <td>
                                            ${formatQtyOVK(
                                                item.qty
                                            )}
                                        </td>


                                        <!-- TOTAL -->

                                        <td>
                                            ${formatRupiahOVK(
                                                item.total
                                            )}
                                        </td>


                                        <!-- HAPUS -->

                                        <td>

                                            <button
                                                type="button"
                                                class="ovkDeleteBtn"
                                                onclick="hapusDataOVK(${index})"
                                                aria-label="Hapus data">

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


        <!-- ======================================
             TOTAL KESELURUHAN
        ======================================= -->

        <div class="ovkGrandTotal">

            <div>

                <small>
                    TOTAL KESELURUHAN OVK
                </small>

                <strong>
                    ${formatRupiahOVK(
                        totalKeseluruhan
                    )}
                </strong>

            </div>


            <span class="material-symbols-rounded">
                calculate
            </span>

        </div>

    `;

}


// ==========================================================
// RENDER ULANG TABEL
// ==========================================================

function renderOVKTableInPage(){

    const wrap =
        document.getElementById(
            "ovkTableWrap"
        );


    if(!wrap){

        return;
    }


    wrap.innerHTML =
        renderOVKTable();

}


// ==========================================================
// HAPUS DATA
// ==========================================================

function hapusDataOVK(
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
        window.fmcOVKDataSesi.length
    ){

        return;
    }


    const data =
        window.fmcOVKDataSesi[
            index
        ];


    const nama =
        data?.namaObat ||
        "data ini";


    const yakin =
        confirm(
            `Hapus ${nama}?`
        );


    if(!yakin){

        return;
    }


    window.fmcOVKDataSesi.splice(
        index,
        1
    );


    renderOVKTableInPage();


    tampilPesanOVK(
        "Data OVK berhasil dihapus.",
        "success"
    );

}


// ==========================================================
// RESET FORM
// ==========================================================

function resetFormOVK(){

    const nama =
        document.getElementById(
            "ovkNamaObat"
        );


    const harga =
        document.getElementById(
            "ovkHarga"
        );


    const qty =
        document.getElementById(
            "ovkQty"
        );


    const total =
        document.getElementById(
            "ovkTotal"
        );


    if(nama){

        nama.value =
            "";

    }


    if(harga){

        harga.value =
            "";

    }


    if(qty){

        qty.value =
            "";

    }


    if(total){

        total.value =
            "—";

    }


    // Tanggal sengaja tidak dihapus.
    // User masih berada pada tanggal
    // yang sama.


    if(nama){

        setTimeout(
            function(){

                nama.focus();

            },
            50
        );

    }

}


// ==========================================================
// SIMPAN DATA
// ==========================================================
// GAS BELUM DIHUBUNGKAN.
// ==========================================================

function simpanDataOVK(){

    const data =
        window.fmcOVKDataSesi || [];


    if(
        !data.length
    ){

        tampilPesanOVK(
            "Belum ada data OVK yang siap disimpan.",
            "warning"
        );

        return;
    }


    // ==========================================
    // TOTAL AKHIR
    // ==========================================

    const total =
        data.reduce(
            function(
                hasil,
                item
            ){

                return (
                    hasil +
                    (
                        Number(
                            item.total
                        ) || 0
                    )
                );

            },
            0
        );


    // ==========================================
    // SEMENTARA
    // ==========================================

    tampilPesanOVK(
        "Data OVK siap dikirim ke Spreadsheet. Koneksi GAS belum diaktifkan.",
        "success"
    );


    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
        "=========================================="
    );

    console.log(
        "FMC OVK - DATA SIAP DIKIRIM"
    );

    console.log(
        "=========================================="
    );

    console.log(
        "Data:",
        data
    );

    console.log(
        "Total OVK:",
        total
    );

}


// ==========================================================
// PESAN
// ==========================================================

function tampilPesanOVK(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "ovkMessage"
        );


    if(!el){

        return;
    }


    el.textContent =
        pesan;


    el.className =
        "ovkMessage " +
        tipe;


    el.style.display =
        "block";


    clearTimeout(
        window.fmcOVKMessageTimer
    );


    window.fmcOVKMessageTimer =
        setTimeout(
            function(){

                el.style.display =
                    "none";

            },
            4000
        );

}


// ==========================================================
// FORMAT RUPIAH
// ==========================================================

function formatRupiahOVK(
    value
){

    const angka =
        Number(
            value
        );


    if(
        !Number.isFinite(
            angka
        )
    ){

        return "—";
    }


    return new Intl.NumberFormat(
        "id-ID",
        {
            style:
                "currency",

            currency:
                "IDR",

            minimumFractionDigits:
                0
        }
    ).format(
        angka
    );

}


// ==========================================================
// FORMAT QTY
// ==========================================================

function formatQtyOVK(
    value
){

    const angka =
        Number(
            value
        );


    if(
        !Number.isFinite(
            angka
        )
    ){

        return "—";
    }


    return new Intl.NumberFormat(
        "id-ID",
        {
            maximumFractionDigits:
                2
        }
    ).format(
        angka
    );

}


// ==========================================================
// FORMAT TANGGAL
// ==========================================================

function formatTanggalOVK(
    value
){

    if(!value){

        return "—";
    }


    const bagian =
        String(
            value
        ).split(
            "-"
        );


    if(
        bagian.length !== 3
    ){

        return value;
    }


    return (
        bagian[2] +
        "/" +
        bagian[1] +
        "/" +
        bagian[0]
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeOVK(
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


// ==========================================================
// DEBUG LOAD
// ==========================================================

console.log(
    "FMC OVK.JS LOADED"
);