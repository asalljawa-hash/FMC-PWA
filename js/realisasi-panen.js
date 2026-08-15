// ==========================================================
// FMC BROILER MOBILE V11
// REALISASI PANEN.JS
// ==========================================================
//
// FUNGSI:
// - Menampilkan halaman input Realisasi Panen
// - User mengisi data aktual panen
// - Menyimpan data sementara di sesi PWA
// - Menampilkan rekapan di bawah tombol SIMPAN
//
// BELUM:
// - GAS
// - Spreadsheet
// - Rumus Dashboard
//
// NANTI:
// PWA → GAS → Spreadsheet Tenant → Dashboard
//
// ==========================================================

"use strict";


// ==========================================================
// DATA SESI REALISASI PANEN
// ==========================================================
//
// Ini hanya penampungan sementara PWA.
// BUKAN database utama.
//
// Nanti GAS akan mengambil data ini.
// ==========================================================

if (!window.fmcRealisasiPanenDataSesi) {

    window.fmcRealisasiPanenDataSesi = [];

}


// ==========================================================
// FLOK AKTIF
// ==========================================================

function getRealisasiPanenFlokAktif() {

    const flok =
        window.fmcFlokAktif;

    if (
        ["A", "B", "C", "D"].includes(flok)
    ) {

        return flok;

    }

    return "A";

}


// ==========================================================
// TAMPIL HALAMAN REALISASI PANEN
// ==========================================================

async function tampilRealisasiPanen() {

    const page =
        document.getElementById(
            "realisasiPanenPage"
        );


    if (!page) {

        console.warn(
            "REALISASI PANEN: #realisasiPanenPage tidak ditemukan."
        );

        return;

    }


    const flokAktif =
        getRealisasiPanenFlokAktif();


    // ======================================================
    // RENDER HALAMAN
    // ======================================================

    page.innerHTML = `

        <div class="card realisasiPanenInputCard">


            <!-- ==================================================
                 HEADER
            ================================================== -->

            <div class="realisasiPanenHeader">

                <div>

                    <div class="realisasiPanenHeaderSmall">
                        FMC BROILER MOBILE V11
                    </div>


                    <h2>

                        <span class="material-symbols-rounded">
                            local_shipping
                        </span>

                        Realisasi Panen

                    </h2>


                    <p>
                        Input Data Panen Aktual
                    </p>

                </div>


                <div class="realisasiPanenStatusBadge">

                    <span class="material-symbols-rounded">
                        inventory
                    </span>

                    DATA AKTUAL

                </div>

            </div>


            <!-- ==================================================
                 FLOK
            ================================================== -->

            <div class="realisasiPanenSelector">

                ${["A", "B", "C", "D"]
                    .map(f => `

                        <button
                            type="button"
                            class="
                                realisasiPanenSelectorBtn
                                ${flokAktif === f ? "active" : ""}
                            "
                            onclick="
                                pilihRealisasiPanenFlok('${f}')
                            "
                        >

                            FLOK ${f}

                        </button>

                    `)
                    .join("")}

            </div>


            <!-- ==================================================
                 DATA REALISASI
            ================================================== -->

            <div class="realisasiPanenInputSection">

                <h3>

                    <span class="material-symbols-rounded">
                        edit_note
                    </span>

                    Data Realisasi Panen

                </h3>


                <!-- ==================================================
                     TANGGAL
                ================================================== -->

                <label for="realisasiPanenTanggal">
                    Tanggal
                </label>


                <div class="realisasiPanenTanggalWrap">

                    <span class="material-symbols-rounded">
                        calendar_month
                    </span>


                    <input
                        type="date"
                        id="realisasiPanenTanggal"
                        autocomplete="off"
                    >

                </div>


                <!-- ==================================================
                     JENIS PANEN
                ================================================== -->

                <label for="realisasiPanenJenis">
                    Jenis Panen
                </label>


                <select
                    id="realisasiPanenJenis"
                >

                    <option value="">
                        Pilih jenis panen
                    </option>

                    <option value="PENJARANGAN">
                        PENJARANGAN
                    </option>

                    <option value="PANEN RAYA">
                        PANEN RAYA
                    </option>

                </select>


                <!-- ==================================================
                     TOTAL EKOR AKTUAL
                ================================================== -->

                <label for="realisasiTotalEkor">
                    Total Ekor Aktual
                </label>


                <input
                    type="number"
                    id="realisasiTotalEkor"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Jumlah ayam aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     TOTAL TONASE AKTUAL
                ================================================== -->

                <label for="realisasiTotalTonase">
                    Total Tonase Aktual
                </label>


                <input
                    type="number"
                    id="realisasiTotalTonase"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="Tonase aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     BB AKTUAL RATA
                ================================================== -->

                <label for="realisasiBBAktual">
                    BB Aktual Rata
                </label>


                <input
                    type="number"
                    id="realisasiBBAktual"
                    min="0"
                    step="0.001"
                    inputmode="decimal"
                    placeholder="Berat badan aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     FCR AKTUAL
                ================================================== -->

                <label for="realisasiFCR">
                    FCR Aktual
                </label>


                <input
                    type="number"
                    id="realisasiFCR"
                    min="0"
                    step="0.001"
                    inputmode="decimal"
                    placeholder="FCR aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     IP AKTUAL
                ================================================== -->

                <label for="realisasiIP">
                    IP Aktual
                </label>


                <input
                    type="number"
                    id="realisasiIP"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="IP aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     MORTALITAS AKTUAL
                ================================================== -->

                <label for="realisasiMortalitas">
                    Mortalitas Aktual
                </label>


                <input
                    type="number"
                    id="realisasiMortalitas"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="Mortalitas aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     HARGA JUAL AKTUAL
                ================================================== -->

                <label for="realisasiHargaJual">
                    Harga Jual Aktual
                </label>


                <input
                    type="number"
                    id="realisasiHargaJual"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Harga jual / Kg"
                    autocomplete="off"
                >


                <!-- ==================================================
                     OMSET AKTUAL
                ================================================== -->

                <label for="realisasiOmset">
                    Omset Aktual
                </label>


                <input
                    type="number"
                    id="realisasiOmset"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Omset aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     PROFIT AKTUAL
                ================================================== -->

                <label for="realisasiProfit">
                    Profit Aktual
                </label>


                <input
                    type="number"
                    id="realisasiProfit"
                    step="1"
                    inputmode="numeric"
                    placeholder="Profit aktual"
                    autocomplete="off"
                >


                <!-- ==================================================
                     PROFIT AKTUAL / EKOR
                ================================================== -->

                <label for="realisasiProfitPerEkor">
                    Profit Aktual / Ekor
                </label>


                <input
                    type="number"
                    id="realisasiProfitPerEkor"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="Profit per ekor"
                    autocomplete="off"
                >


                <!-- ==================================================
                     PESAN
                ================================================== -->

                <div
                    id="realisasiPanenMessage"
                    class="realisasiPanenMessage"
                    style="display:none;"
                >
                </div>


                <!-- ==================================================
                     SIMPAN
                ================================================== -->

                <button
                    type="button"
                    id="btnSimpanRealisasiPanen"
                    class="realisasiPanenSaveBtn"
                    onclick="simpanRealisasiPanenUI()"
                >

                    <span class="material-symbols-rounded">
                        save
                    </span>

                    SIMPAN DATA REALISASI PANEN

                </button>

            </div>


            <!-- ==================================================
                 REKAP
            ================================================== -->

            <div
                id="realisasiPanenRekap"
                class="realisasiPanenRekapCard"
            >

                ${renderRekapRealisasiPanen()}

            </div>


        </div>

    `;


    // ======================================================
    // TANGGAL DEFAULT
    // ======================================================

    const tanggal =
        document.getElementById(
            "realisasiPanenTanggal"
        );


    if (
        tanggal &&
        !tanggal.value
    ) {

        const sekarang =
            new Date();


        const tahun =
            sekarang.getFullYear();


        const bulan =
            String(
                sekarang.getMonth() + 1
            ).padStart(2, "0");


        const hari =
            String(
                sekarang.getDate()
            ).padStart(2, "0");


        tanggal.value =
            `${tahun}-${bulan}-${hari}`;

    }

}


// ==========================================================
// PILIH FLOK
// ==========================================================

function pilihRealisasiPanenFlok(
    flok
) {

    if (
        !["A", "B", "C", "D"].includes(flok)
    ) {

        return;

    }


    window.fmcFlokAktif =
        flok;


    tampilRealisasiPanen();

}


// ==========================================================
// AMBIL INPUT
// ==========================================================

function ambilDataRealisasiPanen() {

    return {

        tanggal:
            document.getElementById(
                "realisasiPanenTanggal"
            )?.value || "",


        flok:
            getRealisasiPanenFlokAktif(),


        jenisPanen:
            document.getElementById(
                "realisasiPanenJenis"
            )?.value || "",


        totalEkor:
            document.getElementById(
                "realisasiTotalEkor"
            )?.value || "",


        totalTonase:
            document.getElementById(
                "realisasiTotalTonase"
            )?.value || "",


        bbAktual:
            document.getElementById(
                "realisasiBBAktual"
            )?.value || "",


        fcrAktual:
            document.getElementById(
                "realisasiFCR"
            )?.value || "",


        ipAktual:
            document.getElementById(
                "realisasiIP"
            )?.value || "",


        mortalitasAktual:
            document.getElementById(
                "realisasiMortalitas"
            )?.value || "",


        hargaJualAktual:
            document.getElementById(
                "realisasiHargaJual"
            )?.value || "",


        omsetAktual:
            document.getElementById(
                "realisasiOmset"
            )?.value || "",


        profitAktual:
            document.getElementById(
                "realisasiProfit"
            )?.value || "",


        profitAktualPerEkor:
            document.getElementById(
                "realisasiProfitPerEkor"
            )?.value || ""

    };

}


// ==========================================================
// VALIDASI
// ==========================================================

function validasiRealisasiPanen(
    data
) {

    if (!data.tanggal) {

        return "Tanggal belum dipilih.";

    }


    if (!data.jenisPanen) {

        return "Jenis panen belum dipilih.";

    }


    if (
        data.totalEkor === "" ||
        Number(data.totalEkor) < 0
    ) {

        return "Total ekor aktual belum diisi.";

    }


    if (
        data.totalTonase === "" ||
        Number(data.totalTonase) < 0
    ) {

        return "Total tonase aktual belum diisi.";

    }


    if (
        data.bbAktual === "" ||
        Number(data.bbAktual) < 0
    ) {

        return "BB aktual belum diisi.";

    }


    if (
        data.fcrAktual === "" ||
        Number(data.fcrAktual) < 0
    ) {

        return "FCR aktual belum diisi.";

    }


    if (
        data.ipAktual === "" ||
        Number(data.ipAktual) < 0
    ) {

        return "IP aktual belum diisi.";

    }


    if (
        data.mortalitasAktual === "" ||
        Number(data.mortalitasAktual) < 0
    ) {

        return "Mortalitas aktual belum diisi.";

    }


    if (
        data.hargaJualAktual === "" ||
        Number(data.hargaJualAktual) < 0
    ) {

        return "Harga jual aktual belum diisi.";

    }


    if (
        data.omsetAktual === "" ||
        Number(data.omsetAktual) < 0
    ) {

        return "Omset aktual belum diisi.";

    }


    if (
        data.profitAktual === ""
    ) {

        return "Profit aktual belum diisi.";

    }


    if (
        data.profitAktualPerEkor === ""
    ) {

        return "Profit aktual per ekor belum diisi.";

    }


    return "";

}


// ==========================================================
// SIMPAN DATA
// ==========================================================

async function simpanRealisasiPanenUI() {

    const data =
        ambilDataRealisasiPanen();


    // ======================================================
    // VALIDASI
    // ======================================================

    const error =
        validasiRealisasiPanen(
            data
        );


    if (error) {

        tampilPesanRealisasiPanen(
            error,
            "warning"
        );

        return;

    }


    // ======================================================
    // SIMPAN SESI
    // ======================================================

    const item = {

        tanggal:
            data.tanggal,

        flok:
            data.flok,

        jenisPanen:
            data.jenisPanen,

        totalEkor:
            Number(data.totalEkor),

        totalTonase:
            Number(data.totalTonase),

        bbAktual:
            Number(data.bbAktual),

        fcrAktual:
            Number(data.fcrAktual),

        ipAktual:
            Number(data.ipAktual),

        mortalitasAktual:
            Number(data.mortalitasAktual),

        hargaJualAktual:
            Number(data.hargaJualAktual),

        omsetAktual:
            Number(data.omsetAktual),

        profitAktual:
            Number(data.profitAktual),

        profitAktualPerEkor:
            Number(data.profitAktualPerEkor)

    };


    window.fmcRealisasiPanenDataSesi.push(
        item
    );


    // ======================================================
    // UPDATE REKAP
    // ======================================================

    const rekap =
        document.getElementById(
            "realisasiPanenRekap"
        );


    if (rekap) {

        rekap.innerHTML =
            renderRekapRealisasiPanen();

    }


    // ======================================================
    // PESAN
    // ======================================================

    tampilPesanRealisasiPanen(
        "Data realisasi panen berhasil disiapkan.",
        "success"
    );


    // ======================================================
    // BERSIHKAN INPUT
    // ======================================================

    bersihkanInputRealisasiPanen();


    /*
     * DATA TETAP DI SESI PWA.
     *
     * GAS disiapkan melalui fungsi terpisah.
     * Tidak dipanggil otomatis pada tahap ini,
     * sehingga perilaku input yang sekarang tetap aman.
     */

}


// ==========================================================
// KIRIM DATA KE GAS
// Action GAS: saveRealisasiPanen
// ==========================================================

async function kirimRealisasiPanenKeGAS(
    data
) {

    if (
        typeof apiPost !==
        "function"
    ) {

        return {

            success:false,

            message:
                "API belum tersedia."

        };

    }


    const items = [
        data
    ];


    const hasil =
        await apiPost(
            "saveRealisasiPanen",
            {
                items:
                    JSON.stringify(
                        items
                    )
            }
        );


    return hasil || {

        success:false,

        message:
            "Tidak ada respons dari server."

    };

}


// ==========================================================
// BERSIHKAN INPUT
// ==========================================================

function bersihkanInputRealisasiPanen() {

    const ids = [

        "realisasiPanenJenis",

        "realisasiTotalEkor",

        "realisasiTotalTonase",

        "realisasiBBAktual",

        "realisasiFCR",

        "realisasiIP",

        "realisasiMortalitas",

        "realisasiHargaJual",

        "realisasiOmset",

        "realisasiProfit",

        "realisasiProfitPerEkor"

    ];


    ids.forEach(id => {

        const el =
            document.getElementById(id);


        if (el) {

            el.value = "";

        }

    });

}


// ==========================================================
// REKAP
// ==========================================================

function renderRekapRealisasiPanen() {

    const data =
        window.fmcRealisasiPanenDataSesi || [];


    // ======================================================
    // BELUM ADA DATA
    // ======================================================

    if (!data.length) {

        return `

            <div class="realisasiPanenRekapHeader">

                <div>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    <strong>
                        Data Yang Disiapkan
                    </strong>

                </div>


                <span class="realisasiPanenRekapCount">
                    0 Data
                </span>

            </div>


            <div class="realisasiPanenRekapEmpty">

                <span class="material-symbols-rounded">
                    inventory
                </span>


                <strong>
                    Belum ada data realisasi panen
                </strong>


                <small>
                    Isi data panen aktual di atas
                    lalu tekan "Simpan Data Realisasi Panen".
                </small>

            </div>

        `;

    }


    // ======================================================
    // HEADER
    // ======================================================

    let html = `

        <div class="realisasiPanenRekapHeader">

            <div>

                <span class="material-symbols-rounded">
                    inventory_2
                </span>

                <strong>
                    Data Yang Disiapkan
                </strong>

            </div>


            <span class="realisasiPanenRekapCount">
                ${data.length} Data
            </span>

        </div>


        <div class="realisasiPanenRekapTableWrap">

            <table class="realisasiPanenRekapTable">

                <thead>

                    <tr>

                        <th>
                            Tanggal
                        </th>

                        <th>
                            Flok
                        </th>

                        <th>
                            Jenis
                        </th>

                        <th>
                            Ekor
                        </th>

                        <th>
                            Tonase
                        </th>

                        <th>
                            BB
                        </th>

                        <th>
                            FCR
                        </th>

                        <th>
                            IP
                        </th>

                        <th>
                            Mati
                        </th>

                        <th>
                            Harga
                        </th>

                        <th>
                            Omset
                        </th>

                        <th>
                            Profit
                        </th>

                        <th>
                            Profit/Ekor
                        </th>

                        <th>
                            Aksi
                        </th>

                    </tr>

                </thead>


                <tbody>

    `;


    // ======================================================
    // BARIS DATA
    // ======================================================

    data.forEach(
        item => {

            html += `

                <tr>

                    <td>
                        ${formatTanggalRealisasi(
                            item.tanggal
                        )}
                    </td>


                    <td>
                        FLOK ${escapeRealisasi(
                            item.flok
                        )}
                    </td>


                    <td>
                        ${escapeRealisasi(
                            item.jenisPanen
                        )}
                    </td>


                    <td>
                        ${formatAngkaRealisasi(
                            item.totalEkor
                        )}
                    </td>


                    <td>
                        ${formatAngkaRealisasi(
                            item.totalTonase
                        )}
                    </td>


                    <td>
                        ${formatBBRealisasi(
                            item.bbAktual
                        )}
                    </td>


                    <td>
                        ${formatDecimalRealisasi(
                            item.fcrAktual
                        )}
                    </td>


                    <td>
                        ${formatDecimalRealisasi(
                            item.ipAktual
                        )}
                    </td>


                    <td>
                        ${formatDecimalRealisasi(
                            item.mortalitasAktual
                        )}
                    </td>


                    <td>
                        ${formatRupiahRealisasi(
                            item.hargaJualAktual
                        )}
                    </td>


                    <td>
                        ${formatRupiahRealisasi(
                            item.omsetAktual
                        )}
                    </td>


                    <td>
                        ${formatRupiahRealisasi(
                            item.profitAktual
                        )}
                    </td>


                    <td>
                        ${formatRupiahRealisasi(
                            item.profitAktualPerEkor
                        )}
                    </td>

                    <td>
                        <button
                            type="button"
                            class="realisasiPanenDeleteBtn"
                            title="Hapus data"
                            onclick="hapusRealisasiPanenUI(${data.indexOf(item)})"
                        >
                            <span class="material-symbols-rounded">
                                delete
                            </span>
                        </button>
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>


        <div class="realisasiPanenRekapInfo">

      

        </div>

    `;


    return html;

}


// ==========================================================
// HAPUS DATA
// ==========================================================

function hapusRealisasiPanenUI(
    index
) {

    const data =
        window.fmcRealisasiPanenDataSesi || [];


    if (
        index < 0 ||
        index >= data.length
    ) {

        return;

    }


    const item =
        data[index];


    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus data realisasi panen ini?"
        );


    if (!yakin) {

        return;

    }


    data.splice(
        index,
        1
    );


    const rekap =
        document.getElementById(
            "realisasiPanenRekap"
        );


    if (rekap) {

        rekap.innerHTML =
            renderRekapRealisasiPanen();

    }


    tampilPesanRealisasiPanen(
        "Data realisasi panen berhasil dihapus.",
        "info"
    );

}


// ==========================================================
// PESAN
// ==========================================================

function tampilPesanRealisasiPanen(
    text,
    type
) {

    const el =
        document.getElementById(
            "realisasiPanenMessage"
        );


    if (!el) {

        return;

    }


    el.textContent =
        text;


    el.className =
        "realisasiPanenMessage " +
        (type || "info");


    el.style.display =
        "block";


    setTimeout(
        () => {

            el.style.display =
                "none";

        },
        4000
    );

}


// ==========================================================
// FORMAT
// ==========================================================

function formatAngkaRealisasi(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";

    }


    return number.toLocaleString(
        "id-ID"
    );

}


// ==========================================================
// DECIMAL
// ==========================================================

function formatDecimalRealisasi(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";

    }


    return number.toLocaleString(
        "id-ID",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:3
        }
    );

}


// ==========================================================
// BB
// ==========================================================

function formatBBRealisasi(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";

    }


    return number.toLocaleString(
        "id-ID",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:3
        }
    );

}


// ==========================================================
// RUPIAH
// ==========================================================

function formatRupiahRealisasi(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";

    }


    return (
        "Rp " +
        number.toLocaleString(
            "id-ID"
        )
    );

}


// ==========================================================
// TANGGAL
// ==========================================================

function formatTanggalRealisasi(
    value
) {

    if (!value) {

        return "—";

    }


    const parts =
        value.split("-");


    if (
        parts.length !== 3
    ) {

        return value;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


// ==========================================================
// ESCAPE
// ==========================================================

function escapeRealisasi(
    value
) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}