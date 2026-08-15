// ==========================================================
// FMC BROILER MOBILE V11
// INPUT FLOK.JS
// ==========================================================
//
// INPUT USER:
// 1. UMUR
// 2. MATI
// 3. AFKIR
// 4. BB AVG
// 5. KONSUMSI PAKAN
// 6. JENIS PAKAN
//
// OTOMATIS / READONLY:
// - TANGGAL
// - HARGA PAKAN
//
// PERHITUNGAN MASTER SPREADSHEET:
// - TONASE
// - MORTALITAS
// - FCR
// - IP
// - BIAYA PAKAN
// - AKUMULASI
//
// GAS BELUM DIGUNAKAN.
// FLOK.JS TIDAK DISENTUH.
// ==========================================================

"use strict";


// ==========================================================
// DATA SESI INPUT FLOK
// ==========================================================
//
// Menyimpan data yang sudah dimasukkan user selama sesi PWA.
// Ini BUKAN database utama.
// Nanti GAS akan menggantikan proses penyimpanan ini.
//

if (!window.fmcInputFlokDataSesi) {

    window.fmcInputFlokDataSesi = {
        A: [],
        B: [],
        C: [],
        D: []
    };

}


// ==========================================================
// FLOK AKTIF
// ==========================================================

function getInputFlokAktif() {

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
// TAMPIL INPUT FLOK
// ==========================================================

async function tampilInputFlok() {

    const page =
        document.getElementById(
            "inputFlokPage"
        );

    if (!page) {

        console.warn(
            "INPUT FLOK: #inputFlokPage tidak ditemukan."
        );

        return;
    }


    const flokAktif =
        getInputFlokAktif();


    window.fmcFlokAktif =
        flokAktif;


    // ======================================================
    // RENDER HALAMAN
    // ======================================================

    page.innerHTML = `

        <div class="card flokInputCard">

            <!-- ==================================================
                 HEADER
            ================================================== -->

            <div class="flokInputHeader">

                <div>

                    <div class="flokHeaderSmall">
                        FMC BROILER MOBILE V11
                    </div>

                    <h2>

                        <span class="material-symbols-rounded">
                            edit_note
                        </span>

                        FLOK ${flokAktif}

                    </h2>

                    <p>
                        Input Data Produksi FLOK
                    </p>

                </div>


                <div class="flokStatusBadge">

                    <span class="material-symbols-rounded">
                        HOME
                    </span>

                    FLOK ${flokAktif}

                </div>

            </div>


            <!-- ==================================================
                 PILIH FLOK
            ================================================== -->

            <div class="flokSelector">

                ${["A", "B", "C", "D"]
                    .map(f => `

                        <button
                            type="button"
                            class="flokSelectorBtn ${
                                flokAktif === f
                                    ? "active"
                                    : ""
                            }"
                            onclick="pilihInputFlok('${f}')">

                            FLOK ${f}

                        </button>

                    `)
                    .join("")}

            </div>


            <!-- ==================================================
                 DATA PRODUKSI
            ================================================== -->

            <div class="flokInputSection">

                <h3>

                    <span class="material-symbols-rounded">
                        edit_note
                    </span>

                    Data Produksi

                </h3>


                <!-- ==================================================
                     UMUR
                ================================================== -->

                <label for="inputFlokUmur">
                    Umur
                </label>

                <select
                    id="inputFlokUmur"
                    onchange="ubahUmurInputFlok(this.value)">

                    ${buatPilihanUmurInputFlok(
                        flokAktif
                    )}

                </select>


                <!-- ==================================================
                     TANGGAL
                     READONLY
                ================================================== -->

                <label for="inputFlokTanggal">
                    Tanggal
                </label>

                <div class="flokTanggalWrap">

                    <span class="material-symbols-rounded">
                        calendar_month
                    </span>

                    <input
                        type="text"
                        id="inputFlokTanggal"
                        value="—"
                        readonly
                        tabindex="-1"
                        aria-readonly="true">

                    <span class="flokReadonlyIcon">
                        lock
                    </span>

                </div>

                <small class="flokAutoInfo">
                    Otomatis mengikuti tanggal DOC IN dan umur
                </small>


                <!-- ==================================================
                     PESAN URUTAN
                ================================================== -->

                <div
                    id="inputFlokUrutanMessage"
                    class="flokUrutanMessage"
                    style="display:none;">
                </div>


                <!-- ==================================================
                     MATI
                ================================================== -->

                <label for="inputFlokMati">
                    Mati
                </label>

                <input
                    type="number"
                    id="inputFlokMati"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Jumlah ayam mati"
                    autocomplete="off">


                <!-- ==================================================
                     AFKIR
                ================================================== -->

                <label for="inputFlokAfkir">
                    Afkir
                </label>

                <input
                    type="number"
                    id="inputFlokAfkir"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Jumlah ayam afkir"
                    autocomplete="off">


                <!-- ==================================================
                     BB AVG
                ================================================== -->

                <label for="inputFlokBBAvg">
                    BB Avg
                </label>

                <input
                    type="number"
                    id="inputFlokBBAvg"
                    min="0"
                    step="0.001"
                    inputmode="decimal"
                    placeholder="Berat badan rata-rata"
                    autocomplete="off">


                <!-- ==================================================
                     KONSUMSI PAKAN
                ================================================== -->

                <label for="inputFlokKonsumsi">
                    Konsumsi Pakan
                </label>

                <input
                    type="number"
                    id="inputFlokKonsumsi"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="Jumlah konsumsi pakan"
                    autocomplete="off">


                <!-- ==================================================
                     JENIS PAKAN
                ================================================== -->

                <label for="inputFlokJenisPakan">
                    Jenis Pakan
                </label>

                <select
                    id="inputFlokJenisPakan"
                    onchange="ubahHargaInputFlok(this.value)">

                    <option value="">
                        Pilih jenis pakan
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

                </select>


                <!-- ==================================================
                     HARGA PAKAN
                     READONLY
                ================================================== -->

                <label for="inputFlokHarga">
                    Harga / Kg
                </label>

                <input
                    type="text"
                    id="inputFlokHarga"
                    value="—"
                    readonly
                    tabindex="-1"
                    aria-readonly="true"
                    placeholder="Otomatis dari MASTER PAKAN">


                <!-- ==================================================
                     PESAN
                ================================================== -->

                <div
                    id="inputFlokMessage"
                    class="flokMessage"
                    style="display:none;">
                </div>


                <!-- ==================================================
                     SIMPAN
                ================================================== -->

                <button
                    type="button"
                    id="btnSimpanInputFlok"
                    class="flokSaveBtn"
                    onclick="simpanInputFlokUI()">

                    <span class="material-symbols-rounded">
                        save
                    </span>

                    SIMPAN DATA FLOK

                </button>

            </div>


            <!-- ==================================================
                 REKAP DATA
            ================================================== -->

            <div
                id="inputFlokRekap"
                class="flokRekapCard">

                ${renderRekapInputFlok(
                    flokAktif
                )}

            </div>

        </div>

    `;


    // ======================================================
    // SET UMUR AWAL
    // ======================================================

    const umurEl =
        document.getElementById(
            "inputFlokUmur"
        );

    if (umurEl) {

        ubahUmurInputFlok(
            umurEl.value
        );

    }

}


// ==========================================================
// PILIH FLOK
// ==========================================================

function pilihInputFlok(
    flok
) {

    if (
        !["A", "B", "C", "D"].includes(
            flok
        )
    ) {
        return;
    }


    window.fmcFlokAktif =
        flok;


    tampilInputFlok();

}


// ==========================================================
// BUAT PILIHAN UMUR
// ==========================================================

function buatPilihanUmurInputFlok(
    flok
) {

    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    let html = "";


    for (
        let umur = 0;
        umur <= 45;
        umur++
    ) {

        const sudahAda =
            data.some(
                item =>
                    Number(item.umur) === umur
            );


        html += `

            <option
                value="${umur}"
                ${sudahAda ? "disabled" : ""}>

                Hari ${umur}

            </option>

        `;

    }


    return html;

}


// ==========================================================
// PERUBAHAN UMUR
// ==========================================================

function ubahUmurInputFlok(
    nilai
) {

    if (
        nilai === undefined ||
        nilai === ""
    ) {
        return;
    }


    const umur =
        Number(nilai);


    const flok =
        getInputFlokAktif();


    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    const umurTerakhir =
        data.length
            ? Math.max(
                ...data.map(
                    item =>
                        Number(item.umur)
                )
            )
            : -1;


    const umurBerikutnya =
        umurTerakhir + 1;


    const message =
        document.getElementById(
            "inputFlokUrutanMessage"
        );


    // ======================================================
    // CEK URUTAN
    // ======================================================

    if (
        umur !== umurBerikutnya
    ) {

        if (message) {

            message.style.display =
                "block";

            message.className =
                "flokUrutanMessage warning";

            message.textContent =
                `Data belum berurutan. ` +
                `Silakan isi data Hari ${umurBerikutnya} terlebih dahulu.`;

        }


        const saveBtn =
            document.getElementById(
                "btnSimpanInputFlok"
            );


        if (saveBtn) {

            saveBtn.disabled =
                true;

        }


        // Tetap tampilkan tanggal
        // berdasarkan umur yang dipilih.

        tampilkanTanggalInputFlok(
            flok,
            umur
        );

        return;

    }


    // ======================================================
    // URUTAN BENAR
    // ======================================================

    if (message) {

        message.style.display =
            "none";

        message.textContent =
            "";

    }


    const saveBtn =
        document.getElementById(
            "btnSimpanInputFlok"
        );


    if (saveBtn) {

        saveBtn.disabled =
            false;

    }


    // ======================================================
    // TANGGAL OTOMATIS
    // ======================================================

    tampilkanTanggalInputFlok(
        flok,
        umur
    );

}


// ==========================================================
// TAMPILKAN TANGGAL BERDASARKAN UMUR
// ==========================================================
//
// Prinsip master Spreadsheet:
//
// Tanggal = Tanggal DOC IN + Umur - 1
//
// Jika sumber tanggal DOC IN belum tersedia di PWA,
// field tetap "—".
//
// Fungsi ini TIDAK memakai tanggal hari ini.
// ==========================================================

function tampilkanTanggalInputFlok(
    flok,
    umur
) {

    const tanggalEl =
        document.getElementById(
            "inputFlokTanggal"
        );


    if (!tanggalEl) {
        return;
    }


    const tanggalDOC =
        ambilTanggalDOCInputFlok(
            flok
        );


    if (!tanggalDOC) {

        tanggalEl.value =
            "—";

        return;

    }


    const tanggal =
        parseTanggalInputFlok(
            tanggalDOC
        );


    if (!tanggal) {

        tanggalEl.value =
            "—";

        return;

    }


    tanggal.setDate(
        tanggal.getDate() +
        Number(umur) -
        1
    );


    tanggalEl.value =
        formatTanggalInputFlok(
            tanggal
        );

}


// ==========================================================
// AMBIL TANGGAL DOC IN
// ==========================================================
//
// Fungsi ini membaca beberapa struktur frontend yang
// mungkin sudah disediakan modul DOC IN.
//
// TIDAK membuat tanggal baru.
// TIDAK menggunakan tanggal perangkat.
//
// Jika belum ada data DOC IN di frontend,
// hasilnya null dan UI menampilkan "—".
//
// Nanti saat GAS dibuat, sumber ini dapat disesuaikan
// dengan object hasil Spreadsheet Tenant.
// ==========================================================

function ambilTanggalDOCInputFlok(
    flok
) {

    // ------------------------------------------------------
    // 1. Object khusus DOC IN
    // ------------------------------------------------------

    const docIn =
        window.fmcDocInData;


    if (
        docIn &&
        docIn[flok]
    ) {

        const item =
            docIn[flok];


        if (
            typeof item === "string"
        ) {

            return item;

        }


        if (
            item.tanggal ||
            item.tanggalDOC ||
            item.chickIn
        ) {

            return (
                item.tanggal ||
                item.tanggalDOC ||
                item.chickIn
            );

        }

    }


    // ------------------------------------------------------
    // 2. Object DATA DOC IN
    // ------------------------------------------------------

    const dataDOC =
        window.fmcDOCIN;


    if (
        dataDOC &&
        dataDOC[flok]
    ) {

        const item =
            dataDOC[flok];


        if (
            typeof item === "string"
        ) {

            return item;

        }


        if (
            item.tanggal ||
            item.tanggalDOC ||
            item.chickIn
        ) {

            return (
                item.tanggal ||
                item.tanggalDOC ||
                item.chickIn
            );

        }

    }


    // ------------------------------------------------------
    // 3. Data server bila tersedia
    // ------------------------------------------------------

    const server =
        window.serverData;


    if (
        server &&
        server.docin &&
        server.docin[flok]
    ) {

        const item =
            server.docin[flok];


        if (
            typeof item === "string"
        ) {

            return item;

        }


        if (
            item.tanggal ||
            item.tanggalDOC ||
            item.chickIn
        ) {

            return (
                item.tanggal ||
                item.tanggalDOC ||
                item.chickIn
            );

        }

    }


    return null;

}


// ==========================================================
// PARSE TANGGAL
// ==========================================================

function parseTanggalInputFlok(
    nilai
) {

    if (!nilai) {
        return null;
    }


    if (
        nilai instanceof Date
    ) {

        const d =
            new Date(nilai);

        return Number.isNaN(
            d.getTime()
        )
            ? null
            : d;

    }


    const text =
        String(nilai)
            .trim();


    // ------------------------------------------------------
    // FORMAT YYYY-MM-DD
    // ------------------------------------------------------

    let match =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (match) {

        const tahun =
            Number(match[1]);

        const bulan =
            Number(match[2]) - 1;

        const hari =
            Number(match[3]);


        const d =
            new Date(
                tahun,
                bulan,
                hari
            );


        return Number.isNaN(
            d.getTime()
        )
            ? null
            : d;

    }


    // ------------------------------------------------------
    // FORMAT DD/MM/YYYY
    // ------------------------------------------------------

    match =
        text.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );


    if (match) {

        const hari =
            Number(match[1]);

        const bulan =
            Number(match[2]) - 1;

        const tahun =
            Number(match[3]);


        const d =
            new Date(
                tahun,
                bulan,
                hari
            );


        return Number.isNaN(
            d.getTime()
        )
            ? null
            : d;

    }


    // ------------------------------------------------------
    // FALLBACK
    // ------------------------------------------------------

    const d =
        new Date(text);


    return Number.isNaN(
        d.getTime()
    )
        ? null
        : d;

}


// ==========================================================
// FORMAT TANGGAL INDONESIA
// ==========================================================

function formatTanggalInputFlok(
    tanggal
) {

    if (!tanggal) {
        return "—";
    }


    const hari =
        String(
            tanggal.getDate()
        ).padStart(
            2,
            "0"
        );


    const bulan =
        String(
            tanggal.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const tahun =
        tanggal.getFullYear();


    return (
        hari +
        "/" +
        bulan +
        "/" +
        tahun
    );

}


// ==========================================================
// HARGA PAKAN
// ==========================================================
//
// Harga bukan input user.
// Hanya ditampilkan readonly bila MASTER PAKAN tersedia.
//

function ubahHargaInputFlok(
    jenisPakan
) {

    const hargaEl =
        document.getElementById(
            "inputFlokHarga"
        );


    if (!hargaEl) {
        return;
    }


    if (!jenisPakan) {

        hargaEl.value =
            "—";

        return;

    }


    const master =
        window.fmcMasterPakan || {};


    const harga =
        master[jenisPakan];


    if (
        harga === undefined ||
        harga === null ||
        harga === ""
    ) {

        hargaEl.value =
            "—";

        return;

    }


    const angka =
        Number(harga);


    if (
        Number.isNaN(angka)
    ) {

        hargaEl.value =
            String(harga);

        return;

    }


    hargaEl.value =
        new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }
        ).format(
            angka
        );

}


// ==========================================================
// SIMPAN DATA INPUT FLOK
// ==========================================================
//
// Untuk sekarang:
// PWA menyimpan ke sesi lokal.
//
// BELUM dikirim ke GAS.
//
// Nanti titik koneksi GAS berada di sini.
//

function simpanInputFlokUI() {

    const flok =
        getInputFlokAktif();


    const umurEl =
        document.getElementById(
            "inputFlokUmur"
        );


    const umur =
        Number(
            umurEl?.value
        );


    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    const umurTerakhir =
        data.length
            ? Math.max(
                ...data.map(
                    item =>
                        Number(item.umur)
                )
            )
            : -1;


    const umurBerikutnya =
        umurTerakhir + 1;


    // ======================================================
    // VALIDASI URUTAN
    // ======================================================

    if (
        umur !== umurBerikutnya
    ) {

        tampilPesanInputFlok(

            `Data belum berurutan. ` +
            `Silakan isi data Hari ${umurBerikutnya} terlebih dahulu.`,

            "warning"

        );

        return;

    }


    // ======================================================
    // AMBIL INPUT
    // ======================================================

    const dataInput = {

        flok:
            flok,

        umur:
            umur,

        tanggal:
            document.getElementById(
                "inputFlokTanggal"
            )?.value || "—",

        mati:
            document.getElementById(
                "inputFlokMati"
            )?.value || "",

        afkir:
            document.getElementById(
                "inputFlokAfkir"
            )?.value || "",

        bbAvg:
            document.getElementById(
                "inputFlokBBAvg"
            )?.value || "",

        konsumsiPakan:
            document.getElementById(
                "inputFlokKonsumsi"
            )?.value || "",

        jenisPakan:
            document.getElementById(
                "inputFlokJenisPakan"
            )?.value || ""

    };


    // ======================================================
    // VALIDASI FIELD
    // ======================================================

    const error =
        validasiInputFlok(
            dataInput
        );


    if (error) {

        tampilPesanInputFlok(
            error,
            "warning"
        );

        return;

    }


    // ======================================================
    // SIMPAN SESI
    // ======================================================

    if (
        !window.fmcInputFlokDataSesi[flok]
    ) {

        window.fmcInputFlokDataSesi[flok] =
            [];

    }


    window.fmcInputFlokDataSesi[flok]
        .push({

            flok:
                flok,

            umur:
                umur,

            tanggal:
                dataInput.tanggal,

            mati:
                Number(
                    dataInput.mati
                ),

            afkir:
                Number(
                    dataInput.afkir
                ),

            bbAvg:
                Number(
                    dataInput.bbAvg
                ),

            konsumsiPakan:
                Number(
                    dataInput.konsumsiPakan
                ),

            jenisPakan:
                dataInput.jenisPakan

        });


    // ======================================================
    // DATA TERAKHIR
    // ======================================================

    window.fmcFlokInputTerakhir =
        dataInput;


    // ======================================================
    // RENDER REKAP
    // ======================================================

    const rekap =
        document.getElementById(
            "inputFlokRekap"
        );


    if (rekap) {

        rekap.innerHTML =
            renderRekapInputFlok(
                flok
            );

    }


    // ======================================================
    // PESAN
    // ======================================================

    tampilPesanInputFlok(

        `Data FLOK ${flok} Hari ${umur} berhasil disiapkan.`,

        "success"

    );


    // ======================================================
    // BERSIHKAN FIELD INPUT
    // ======================================================

    const matiEl =
        document.getElementById(
            "inputFlokMati"
        );

    const afkirEl =
        document.getElementById(
            "inputFlokAfkir"
        );

    const bbAvgEl =
        document.getElementById(
            "inputFlokBBAvg"
        );

    const konsumsiEl =
        document.getElementById(
            "inputFlokKonsumsi"
        );

    const jenisPakanEl =
        document.getElementById(
            "inputFlokJenisPakan"
        );


    if (matiEl) {
        matiEl.value = "";
    }

    if (afkirEl) {
        afkirEl.value = "";
    }

    if (bbAvgEl) {
        bbAvgEl.value = "";
    }

    if (konsumsiEl) {
        konsumsiEl.value = "";
    }

    if (jenisPakanEl) {
        jenisPakanEl.value = "";
    }


    // Harga kembali kosong

    ubahHargaInputFlok(
        ""
    );


    // ======================================================
    // UMUR BERIKUTNYA
    // ======================================================

    const umurBaru =
        tentukanUmurBerikutnyaInputFlok(
            flok
        );


    if (umurEl) {

        umurEl.value =
            String(
                umurBaru
            );

    }


    // ======================================================
    // TANGGAL UMUR BERIKUTNYA
    // ======================================================

    tampilkanTanggalInputFlok(
        flok,
        umurBaru
    );


    // ======================================================
    // NANTI DI SINI GAS
    // ======================================================
    //
    // Contoh konsep:
    //
    // await kirimInputFlokKeGAS(dataInput);
    //
    // TAPI BELUM DIIMPLEMENTASIKAN.
    //
    // ======================================================

}


// ==========================================================
// VALIDASI
// ==========================================================

function validasiInputFlok(
    data
) {

    if (
        !Number.isInteger(
            data.umur
        ) ||
        data.umur < 0
    ) {

        return "Umur belum dipilih.";

    }


    if (
        data.mati === "" ||
        Number(data.mati) < 0
    ) {

        return "Jumlah ayam mati belum diisi.";

    }


    if (
        data.afkir === "" ||
        Number(data.afkir) < 0
    ) {

        return "Jumlah ayam afkir belum diisi.";

    }


    if (
        data.bbAvg === "" ||
        Number(data.bbAvg) < 0
    ) {

        return "BB Avg belum diisi.";

    }


    if (
        data.konsumsiPakan === "" ||
        Number(data.konsumsiPakan) < 0
    ) {

        return "Konsumsi pakan belum diisi.";

    }


    if (
        !data.jenisPakan
    ) {

        return "Jenis pakan belum dipilih.";

    }


    return "";

}


// ==========================================================
// UMUR BERIKUTNYA
// ==========================================================

function tentukanUmurBerikutnyaInputFlok(
    flok
) {

    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    if (!data.length) {

        return 0;

    }


    const umurTerakhir =
        Math.max(
            ...data.map(
                item =>
                    Number(item.umur)
            )
        );


    return umurTerakhir + 1;

}


// ==========================================================
// RENDER REKAP
// ==========================================================

function renderRekapInputFlok(
    flok
) {

    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    // ======================================================
    // BELUM ADA DATA
    // ======================================================

    if (!data.length) {

        return `

            <div class="flokRekapHeader">

                <div>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    <strong>
                        Data Yang Disiapkan
                    </strong>

                </div>

                <span class="flokRekapCount">
                    0 Data
                </span>

            </div>


            <div class="flokRekapEmpty">

                Belum ada data FLOK ${flok}
                yang disimpan.

            </div>


            <div class="flokHasilHeader">

                <span class="material-symbols-rounded">
                    analytics
                </span>

                <strong>
                    Hasil Perhitungan
                </strong>

            </div>


            <div class="flokKpiGrid">

                ${buatKpiInputFlok(
                    "Ayam Hidup",
                    "—"
                )}

                ${buatKpiInputFlok(
                    "Mortalitas",
                    "—"
                )}

                ${buatKpiInputFlok(
                    "BB Avg",
                    "—"
                )}

                ${buatKpiInputFlok(
                    "FCR",
                    "—"
                )}

                ${buatKpiInputFlok(
                    "IP",
                    "—"
                )}

                ${buatKpiInputFlok(
                    "Tonase",
                    "—"
                )}

            </div>


            <small class="flokRekapInfo">

      

            </small>

        `;

    }


    // ======================================================
    // HEADER
    // ======================================================

    let html = `

        <div class="flokRekapHeader">

            <div>

                <span class="material-symbols-rounded">
                    inventory_2
                </span>

                <strong>
                    Data Yang Disiapkan
                </strong>

            </div>

            <span class="flokRekapCount">
                ${data.length} Data
            </span>

        </div>


        <div class="flokRekapTableWrap">

            <table class="flokRekapTable">

                <thead>

                    <tr>

                        <th>
                            Umur
                        </th>

                        <th>
                            Tanggal
                        </th>

                        <th>
                            Mati
                        </th>

                        <th>
                            Afkir
                        </th>

                        <th>
                            BB Avg
                        </th>

                        <th>
                            Pakan
                        </th>

                        <th>
                            Jenis
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
                        ${item.umur}
                    </td>

                    <td>
                        ${item.tanggal || "—"}
                    </td>

                    <td>
                        ${formatAngkaInputFlok(
                            item.mati
                        )}
                    </td>

                    <td>
                        ${formatAngkaInputFlok(
                            item.afkir
                        )}
                    </td>

                    <td>
                        ${formatBBInputFlok(
                            item.bbAvg
                        )}
                    </td>

                    <td>
                        ${formatAngkaInputFlok(
                            item.konsumsiPakan
                        )}
                    </td>

                    <td>
                        ${item.jenisPakan || "—"}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="flokDeleteBtn"
                            onclick="hapusDataInputFlok('${flok}', ${data.indexOf(item)})"
                            aria-label="Hapus data Hari ${item.umur}">

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


        <!-- ==================================================
             HASIL PERHITUNGAN
        ================================================== -->

        <div class="flokHasilHeader">

            <span class="material-symbols-rounded">
                analytics
            </span>

            <strong>
                Hasil Perhitungan
            </strong>

        </div>


        <div class="flokKpiGrid">

            ${buatKpiInputFlok(
                "Ayam Hidup",
                "—"
            )}

            ${buatKpiInputFlok(
                "Mortalitas",
                "—"
            )}

            ${buatKpiInputFlok(
                "BB Avg",
                "—"
            )}

            ${buatKpiInputFlok(
                "FCR",
                "—"
            )}

            ${buatKpiInputFlok(
                "IP",
                "—"
            )}

            ${buatKpiInputFlok(
                "Tonase",
                "—"
            )}

        </div>


        <small class="flokRekapInfo">


        </small>

    `;


    return html;

}


// ==========================================================
// KPI
// ==========================================================

function buatKpiInputFlok(
    label,
    nilai
) {

    return `

        <div class="flokKpiItem">

            <span class="flokKpiLabel">
                ${label}
            </span>

            <strong class="flokKpiValue">
                ${nilai}
            </strong>

        </div>

    `;

}


// ==========================================================
// FORMAT ANGKA
// ==========================================================

function formatAngkaInputFlok(
    nilai
) {

    const angka =
        Number(nilai);


    if (
        Number.isNaN(angka)
    ) {

        return "—";

    }


    return new Intl.NumberFormat(
        "id-ID",
        {
            maximumFractionDigits: 2
        }
    ).format(
        angka
    );

}


// ==========================================================
// FORMAT BB AVG
// ==========================================================

function formatBBInputFlok(
    nilai
) {

    const angka =
        Number(nilai);


    if (
        Number.isNaN(angka)
    ) {

        return "—";

    }


    return new Intl.NumberFormat(
        "id-ID",
        {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }
    ).format(
        angka
    );

}


// ==========================================================
// HAPUS DATA REKAP INPUT FLOK
// ==========================================================

function hapusDataInputFlok(
    flok,
    index
) {

    if (
        !["A", "B", "C", "D"].includes(
            flok
        )
    ) {
        return;
    }


    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= data.length
    ) {
        return;
    }


    const item =
        data[index];


    const yakin =
        confirm(
            `Hapus data FLOK ${flok} Hari ${item.umur}?`
        );


    if (!yakin) {
        return;
    }


    data.splice(
        index,
        1
    );


    // Render ulang rekapan.
    const rekap =
        document.getElementById(
            "inputFlokRekap"
        );


    if (rekap) {

        rekap.innerHTML =
            renderRekapInputFlok(
                flok
            );

    }


    // Setelah data dihapus, umur berikutnya mengikuti data terakhir.
    const umurEl =
        document.getElementById(
            "inputFlokUmur"
        );


    const umurBerikutnya =
        tentukanUmurBerikutnyaInputFlok(
            flok
        );


    if (umurEl) {

        umurEl.value =
            String(
                umurBerikutnya
            );

    }


    // Tampilkan tanggal untuk umur berikutnya.
    tampilkanTanggalInputFlok(
        flok,
        umurBerikutnya
    );


    // Pastikan tombol simpan kembali aktif.
    const saveBtn =
        document.getElementById(
            "btnSimpanInputFlok"
        );


    if (saveBtn) {

        saveBtn.disabled =
            false;

    }


    tampilPesanInputFlok(
        `Data FLOK ${flok} Hari ${item.umur} berhasil dihapus.`,
        "success"
    );

}


// ==========================================================
// SIAPKAN DATA INPUT FLOK UNTUK GAS
// ==========================================================
//
// Fungsi ini BELUM dipanggil dari alur input utama.
// Tujuannya hanya menyiapkan koneksi backend sejak sekarang.
// Nanti GAS menangani action: saveInputFlok.
//

async function kirimInputFlokKeGAS(
    flok = getInputFlokAktif()
) {

    if (
        !["A", "B", "C", "D"].includes(
            flok
        )
    ) {
        throw new Error(
            "FLOK tidak valid."
        );
    }


    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    const items =
        data.map(
            item => ({

                flok:
                    flok,

                umur:
                    Number(item.umur),

                tanggal:
                    item.tanggal || "—",

                mati:
                    Number(item.mati) || 0,

                afkir:
                    Number(item.afkir) || 0,

                bbAvg:
                    Number(item.bbAvg) || 0,

                konsumsiPakan:
                    Number(item.konsumsiPakan) || 0,

                jenisPakan:
                    item.jenisPakan || ""

            })
        );


    if (!items.length) {

        return {
            success: false,
            message: "Belum ada data Input Flok untuk dikirim."
        };

    }


    // Action GAS yang akan digunakan nanti.
    return await apiPost(
        "saveInputFlok",
        {

            flok:
                flok,

            items:
                items

        }
    );

}


// ==========================================================
// PESAN
// ==========================================================

function tampilPesanInputFlok(
    pesan,
    tipe = "info"
) {

    const el =
        document.getElementById(
            "inputFlokMessage"
        );


    if (!el) {
        return;
    }


    el.style.display =
        "block";


    el.className =
        "flokMessage " +
        tipe;


    el.textContent =
        pesan;


    clearTimeout(
        window.fmcInputFlokMessageTimer
    );


    window.fmcInputFlokMessageTimer =
        setTimeout(
            () => {

                if (el) {

                    el.style.display =
                        "none";

                    el.textContent =
                        "";

                }

            },
            3500
        );

}


// ==========================================================
// RESET SESI
// ==========================================================

function resetSesiInputFlok(
    flok = getInputFlokAktif()
) {

    if (
        !["A", "B", "C", "D"].includes(
            flok
        )
    ) {

        return;

    }


    window.fmcInputFlokDataSesi[flok] =
        [];


    tampilInputFlok();

}


// ==========================================================
// LOAD MESSAGE
// ==========================================================

console.log(
    "FMC INPUT FLOK.JS V11 LOADED"
)