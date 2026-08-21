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
// GAS AKTIF.
// V3: TAMBAH DATA -> SESI PWA; SIMPAN DATA FLOK -> GAS -> SPREADSHEET -> GET HASIL.
// FINAL: UMUR 1-45 BERURUTAN; SESSION PERSISTEN; STATUS SERVER; TOAST GLOBAL; REKAP TABEL.
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

if (!window.fmcInputFlokHasilServer) {

    window.fmcInputFlokHasilServer = {
        A: [],
        B: [],
        C: [],
        D: []
    };

}

if (!window.fmcInputFlokRingkasanServer) {

    window.fmcInputFlokRingkasanServer = {
        A: null,
        B: null,
        C: null,
        D: null
    };

}

if (!window.fmcInputFlokDOCIN) {
    window.fmcInputFlokDOCIN = {};
}

if (!window.fmcFlokAktif) {
    window.fmcFlokAktif = "A";
}

// ==========================================================
// PERSISTENCE INPUT FLOK
// ----------------------------------------------------------
// Server tetap menjadi sumber kebenaran.
// localStorage menjadi checkpoint agar data/umur berikutnya
// tidak hilang saat PWA ditutup lalu dibuka kembali.
// ==========================================================

const FMC_INPUT_FLOK_SESSION_KEY = "FMC_INPUT_FLOK_SESSION_V4";

function getInputFlokSessionStore() {
    try {
        const raw = localStorage.getItem(FMC_INPUT_FLOK_SESSION_KEY);
        if (!raw) return { A: [], B: [], C: [], D: [] };
        const parsed = JSON.parse(raw);
        return {
            A: Array.isArray(parsed?.A) ? parsed.A : [],
            B: Array.isArray(parsed?.B) ? parsed.B : [],
            C: Array.isArray(parsed?.C) ? parsed.C : [],
            D: Array.isArray(parsed?.D) ? parsed.D : []
        };
    } catch (error) {
        console.warn("INPUT FLOK: session local tidak dapat dibaca.", error);
        return { A: [], B: [], C: [], D: [] };
    }
}

function simpanInputFlokSessionLocal() {
    try {
        const clean = {};
        ["A", "B", "C", "D"].forEach(flok => {
            clean[flok] = (window.fmcInputFlokDataSesi[flok] || [])
                .map(item => ({
                    flok,
                    umur: Number(item.umur),
                    tanggal: item.tanggal || "",
                    mati: Number(item.mati || 0),
                    afkir: Number(item.afkir || 0),
                    bbAvg: Number(item.bbAvg || 0),
                    konsumsiPakan: Number(item.konsumsiPakan || 0),
                    jenisPakan: String(item.jenisPakan || "")
                }))
                .filter(item => Number.isInteger(item.umur) && item.umur >= 1 && item.umur <= 45);
        });
        localStorage.setItem(FMC_INPUT_FLOK_SESSION_KEY, JSON.stringify(clean));
    } catch (error) {
        console.warn("INPUT FLOK: gagal menyimpan session local.", error);
    }
}

function muatInputFlokSessionLocal(flok) {

    if (!["A", "B", "C", "D"].includes(flok)) {
        return;
    }

    const store =
        getInputFlokSessionStore();

    const localItems =
        Array.isArray(store[flok])
            ? store[flok]
            : [];

    if (!localItems.length) {
        return;
    }

    const serverItems =
        window.fmcInputFlokHasilServer[flok] || [];

    const serverUmur =
        new Set(
            serverItems.map(
                item => Number(item?.umur)
            )
        );

    const unsavedLocal =
        localItems
            .filter(
                item =>
                    Number.isInteger(Number(item?.umur)) &&
                    Number(item.umur) >= 1 &&
                    Number(item.umur) <= 45 &&
                    !serverUmur.has(Number(item.umur))
            )
            .map(item => ({
                ...item,
                umur: Number(item.umur),
                mati: Number(item.mati || 0),
                afkir: Number(item.afkir || 0),
                bbAvg: Number(item.bbAvg || 0),
                konsumsiPakan: Number(item.konsumsiPakan || 0),
                __server: false
            }));

    const serverMapped =
        serverItems.map(item => ({
            ...item,
            __server: true,
            umur: Number(item.umur)
        }));

    window.fmcInputFlokDataSesi[flok] = [
        ...serverMapped,
        ...unsavedLocal
    ].sort(
        (a, b) =>
            Number(a.umur) -
            Number(b.umur)
    );
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
// STYLE RINGKASAN FLOK
// ----------------------------------------------------------
// Hanya untuk komponen baru Ringkasan FLOK.
// Tidak mengubah CSS modul lain.
// ==========================================================

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

    ensureInputFlokTableStyle();

    muatInputFlokSessionLocal(flokAktif);

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

                    ${buatPilihanJenisPakanInputFlok()}

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
                     TAMBAH DATA
                ================================================== -->

                <button
                    type="button"
                    id="btnTambahDataInputFlok"
                    class="flokSaveBtn"
                    onclick="tambahDataInputFlokUI()">

                    <span class="material-symbols-rounded">
                        add
                    </span>

                    TAMBAH DATA

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


            <!-- ==================================================
                 SIMPAN DATA FLOK
                 PWA -> GAS
            ================================================== -->

            <button
                type="button"
                id="btnSimpanInputFlok"
                class="flokSaveBtn"
                onclick="simpanInputFlokKeGAS()">

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA FLOK

            </button>

        </div>

    `;


    // ======================================================
    // LOAD DOC IN TENANT
    // ======================================================
    //
    // Sumber resmi tanggal:
    // 📝 DOC IN -> H3/H4/H5/H6
    //
    /*
     * Data server Input FLOK harus selesai dimuat
     * sebelum menentukan UMUR berikutnya.
     */
    const hasilLoad =
        await Promise.allSettled([
            muatDOCInputFlok(),
            muatMasterPakanInputFlok(),
            muatInputFlokDariGAS(flokAktif)
        ]);

    hasilLoad.forEach(result => {
        if (result.status === "rejected") {
            console.warn(
                "INPUT FLOK: salah satu data awal gagal dimuat.",
                result.reason
            );
        }
    });


    // ======================================================
    // SINKRON UMUR + TANGGAL SETELAH SERVER SELESAI
    // ======================================================

    const umurBerikutnya =
        getUmurBerikutnyaInputFlok(flokAktif);

    refreshPilihanUmurInputFlok(
        flokAktif,
        umurBerikutnya
    );

    const umurEl =
        document.getElementById(
            "inputFlokUmur"
        );

    if (umurEl) {

        umurEl.value =
            String(umurBerikutnya);

        ubahUmurInputFlok(
            umurBerikutnya
        );

    }

    const jenisEl =
        document.getElementById(
            "inputFlokJenisPakan"
        );

    if (jenisEl) {
        ubahHargaInputFlok(
            jenisEl.value
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
// UMUR YANG SUDAH ADA
// ==========================================================
// Server = data yang sudah tersimpan.
// Sesi   = data yang belum dikirim.
// Keduanya dipakai untuk mencegah duplikat umur.

function getSemuaUmurInputFlok(flok) {

    const server =
        window.fmcInputFlokHasilServer[flok] || [];

    const sesi =
        window.fmcInputFlokDataSesi[flok] || [];

    return [
        ...server,
        ...sesi
    ]
        .map(item => Number(item?.umur))
        .filter(
            umur =>
                Number.isInteger(umur) &&
                umur >= 1 &&
                umur <= 45
        );
}


/*
 * Menentukan umur berikutnya berdasarkan URUTAN KONTINU.
 *
 * Contoh:
 * 1,2      -> 3
 * 1,2,3   -> 4
 * 1,3     -> 2
 * kosong  -> 1
 */
function getUmurBerikutnyaInputFlok(flok) {

    const umurSet =
        new Set(
            getSemuaUmurInputFlok(flok)
        );

    for (
        let umur = 1;
        umur <= 45;
        umur++
    ) {

        if (!umurSet.has(umur)) {
            return umur;
        }

    }

    return 45;
}


// ==========================================================
// REFRESH PILIHAN UMUR
// ==========================================================
// Hanya umur berikutnya yang boleh dipilih.
// Umur yang sudah tersimpan tetap disabled.
// Umur yang lebih jauh juga disabled agar user tidak
// dapat melompati urutan.
// ==========================================================

function refreshPilihanUmurInputFlok(
    flok,
    umurPilihan
) {

    const select =
        document.getElementById(
            "inputFlokUmur"
        );

    if (!select) {
        return;
    }

    const nextUmur =
        getUmurBerikutnyaInputFlok(flok);

    select.innerHTML =
        buatPilihanUmurInputFlok(
            flok,
            nextUmur
        );

    select.value =
        String(nextUmur);

}


// ==========================================================
// BUAT PILIHAN UMUR
// ==========================================================

function buatPilihanUmurInputFlok(
    flok,
    umurPilihan
) {

    const umurSudahAda =
        new Set(
            getSemuaUmurInputFlok(flok)
        );

    const umurBerikutnya =
        getUmurBerikutnyaInputFlok(flok);

    let html = "";

    for (
        let umur = 1;
        umur <= 45;
        umur++
    ) {

        const sudahAda =
            umurSudahAda.has(umur);

        const bolehDipilih =
            umur === umurBerikutnya &&
            !sudahAda;

        html += `
            <option
                value="${umur}"
                ${bolehDipilih ? "" : "disabled"}>
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


    const umurBerikutnya =
        getUmurBerikutnyaInputFlok(flok);


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
                "btnTambahDataInputFlok"
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
            "btnTambahDataInputFlok"
        );


    if (saveBtn) {

        saveBtn.disabled =
            false;

    }


    tampilkanTanggalInputFlok(
        flok,
        umur
    );

}


// ==========================================================
// TAMPILKAN TANGGAL
// ==========================================================
//
// ATURAN FMC:
// UMUR 1 = TANGGAL DOC IN
// UMUR 2 = DOC IN + 1 HARI
// UMUR 3 = DOC IN + 2 HARI
// dst.
//
// Tidak menggunakan tanggal hari ini.
//

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


    const docInMap =
        window.fmcInputFlokDOCIN || {};


    const docIn =
        docInMap[flok];


    if (!docIn) {

        tanggalEl.value =
            "—";

        return;

    }


    const tanggal =
        normalisasiTanggalInputFlok(
            docIn
        );


    if (
        Number.isNaN(
            tanggal.getTime()
        )
    ) {

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
// FORMAT TANGGAL
// ==========================================================

function formatTanggalInputFlok(
    tanggal
) {

    if (
        !(tanggal instanceof Date) ||
        Number.isNaN(
            tanggal.getTime()
        )
    ) {

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


    return `${hari}/${bulan}/${tahun}`;

}


// ==========================================================
// TAMBAH DATA INPUT FLOK
// ==========================================================

function tambahDataInputFlokUI() {

    const flok =
        getInputFlokAktif();


    const umurEl =
        document.getElementById(
            "inputFlokUmur"
        );


    const tanggalEl =
        document.getElementById(
            "inputFlokTanggal"
        );


    const matiEl =
        document.getElementById(
            "inputFlokMati"
        );


    const afkirEl =
        document.getElementById(
            "inputFlokAfkir"
        );


    const bbEl =
        document.getElementById(
            "inputFlokBBAvg"
        );


    const konsumsiEl =
        document.getElementById(
            "inputFlokKonsumsi"
        );


    const jenisEl =
        document.getElementById(
            "inputFlokJenisPakan"
        );


    const message =
        document.getElementById(
            "inputFlokMessage"
        );


    if (
        !umurEl ||
        !tanggalEl ||
        !matiEl ||
        !afkirEl ||
        !bbEl ||
        !konsumsiEl ||
        !jenisEl
    ) {

        return;

    }


    const umur =
        Number(
            umurEl.value
        );


    const tanggal =
        tanggalEl.value;


    const mati =
        Number(
            matiEl.value || 0
        );


    const afkir =
        Number(
            afkirEl.value || 0
        );


    const bbAvg =
        Number(
            bbEl.value || 0
        );


    const konsumsiPakan =
        Number(
            konsumsiEl.value || 0
        );


    const jenisPakan =
        jenisEl.value;


    // ======================================================
    // VALIDASI
    // ======================================================

    if (
        !Number.isFinite(umur) ||
        umur < 1 ||
        umur > 45
    ) {

        tampilPesanInputFlok(
            "Umur tidak valid.",
            "error"
        );

        return;

    }


    if (
        !tanggal ||
        tanggal === "—"
    ) {

        tampilPesanInputFlok(
            "Tanggal belum tersedia. Pastikan DOC IN sudah tersedia.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(mati) ||
        mati < 0
    ) {

        tampilPesanInputFlok(
            "Jumlah mati tidak valid.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(afkir) ||
        afkir < 0
    ) {

        tampilPesanInputFlok(
            "Jumlah afkir tidak valid.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(bbAvg) ||
        bbAvg < 0
    ) {

        tampilPesanInputFlok(
            "BB Avg tidak valid.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(konsumsiPakan) ||
        konsumsiPakan < 0
    ) {

        tampilPesanInputFlok(
            "Konsumsi pakan tidak valid.",
            "error"
        );

        return;

    }


    if (!jenisPakan) {

        tampilPesanInputFlok(
            "Silakan pilih jenis pakan.",
            "error"
        );

        return;

    }


    // ======================================================
    // CEK URUTAN LAGI
    // ======================================================

    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    const umurBerikutnya =
        getUmurBerikutnyaInputFlok(flok);


    if (
        umur !==
        umurBerikutnya
    ) {

        tampilPesanInputFlok(
            `Data harus berurutan mulai dari Hari ${umurBerikutnya}.`,
            "error"
        );

        return;

    }


    // ======================================================
    // CEK DUPLIKAT SERVER + SESI
    // ======================================================

    const duplikat =
        getSemuaUmurInputFlok(flok)
            .includes(umur);


    if (duplikat) {

        tampilPesanInputFlok(
            `Data Hari ${umur} sudah ada.`,
            "error"
        );

        return;

    }


    // ======================================================
    // TAMBAHKAN KE SESI
    // ======================================================

    data.push({

        umur:
            umur,

        tanggal:
            tanggal,

        mati:
            mati,

        afkir:
            afkir,

        bbAvg:
            bbAvg,

        konsumsiPakan:
            konsumsiPakan,

        jenisPakan:
            jenisPakan,

        harga:
            getHargaInputFlok(
                jenisPakan
            )

    });


    data.sort(
        (a, b) =>
            Number(a.umur) -
            Number(b.umur)
    );


    window.fmcInputFlokDataSesi[flok] =
        data;

    simpanInputFlokSessionLocal();


    // ======================================================
    // RENDER ULANG REKAP
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
    // RESET INPUT
    // ======================================================

    resetFormInputFlok();


    // ======================================================
    // UMUR BERIKUTNYA
    // ======================================================

    const umurBaru =
        document.getElementById(
            "inputFlokUmur"
        );


    if (umurBaru) {

        const nextUmur =
            getUmurBerikutnyaInputFlok(flok);


        if (
            nextUmur <= 45
        ) {

            umurBaru.value =
                String(
                    nextUmur
                );


            ubahUmurInputFlok(
                nextUmur
            );

        }

    }


    refreshPilihanUmurInputFlok(
        flok,
        getUmurBerikutnyaInputFlok(flok)
    );


    tampilPesanInputFlok(
        `Data Hari ${umur} berhasil ditambahkan.`,
        "success"
    );

}


// ==========================================================
// RESET FORM INPUT FLOK
// ==========================================================

function resetFormInputFlok() {

    const ids = [

        "inputFlokMati",
        "inputFlokAfkir",
        "inputFlokBBAvg",
        "inputFlokKonsumsi"

    ];


    ids.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );


            if (el) {

                el.value =
                    "";

            }

        }
    );


    const jenis =
        document.getElementById(
            "inputFlokJenisPakan"
        );


    if (jenis) {

        jenis.value =
            "";

    }


    const harga =
        document.getElementById(
            "inputFlokHarga"
        );


    if (harga) {

        harga.value =
            "—";

    }

}


// ==========================================================
// HAPUS DATA INPUT FLOK
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
        index < 0 ||
        index >= data.length
    ) {

        return;

    }


    const item =
        data[index];


    const konfirmasi =
        window.confirm(
            `Hapus data Hari ${item.umur}?`
        );


    if (!konfirmasi) {
        return;
    }


    data.splice(
        index,
        1
    );


    window.fmcInputFlokDataSesi[flok] =
        data;

    simpanInputFlokSessionLocal();


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


    const umurEl =
        document.getElementById(
            "inputFlokUmur"
        );


    if (umurEl) {

        const nextUmur =
            getUmurBerikutnyaInputFlok(flok);


        umurEl.value =
            String(
                Math.min(
                    nextUmur,
                    45
                )
            );


        ubahUmurInputFlok(
            umurEl.value
        );

    }


    tampilPesanInputFlok(
        `Data Hari ${item.umur} dihapus dari daftar sementara.`,
        "success"
    );

}


// ==========================================================
// PESAN INPUT FLOK
// ==========================================================

function tampilPesanInputFlok(
    pesan,
    tipe
) {

    const message =
        document.getElementById(
            "inputFlokMessage"
        );


    if (!message) {
        return;
    }


    message.style.display =
        "block";


    message.className =
        `flokMessage ${tipe || ""}`;


    message.textContent =
        pesan;


    window.setTimeout(
        () => {

            if (message) {

                message.style.display =
                    "none";

            }

        },
        3500
    );

}


// ==========================================================
// RENDER REKAP INPUT FLOK
// ==========================================================

function renderRekapInputFlok(
    flok
) {

    const data =
        window.fmcInputFlokDataSesi[flok] || [];

    const serverData =
        window.fmcInputFlokHasilServer[flok] || [];

    const gabunganMap =
        new Map();

    /*
     * Server adalah sumber kebenaran.
     */
    serverData.forEach(item => {

        const umur =
            Number(item?.umur);

        if (
            Number.isInteger(umur) &&
            umur >= 1 &&
            umur <= 45
        ) {

            gabunganMap.set(
                umur,
                {
                    ...item,
                    __server: true
                }
            );

        }

    });

    /*
     * Data sesi yang belum ada di server tetap
     * ditampilkan sebagai BELUM DISIMPAN.
     */
    data.forEach(item => {

        const umur =
            Number(item?.umur);

        if (
            !Number.isInteger(umur) ||
            umur < 1 ||
            umur > 45
        ) {
            return;
        }

        if (!gabunganMap.has(umur)) {

            gabunganMap.set(
                umur,
                {
                    ...item,
                    __server: false
                }
            );

        }

    });

    const gabungan =
        Array.from(
            gabunganMap.values()
        ).sort(
            (a, b) =>
                Number(a.umur) -
                Number(b.umur)
        );

    let html = `
        <div class="flokRekapHeader">
            <div>
                <span class="material-symbols-rounded">
                    table_view
                </span>
                <strong>
                    Data Input FLOK ${escapeInputFlokText(flok)}
                </strong>
            </div>

            <span class="flokRekapCount">
                ${gabungan.length} Data
            </span>
        </div>
    `;

    if (!gabungan.length) {

        html += `
            <div class="flokRekapEmpty">
                <span class="material-symbols-rounded">
                    table_view
                </span>
                <strong>Belum ada data</strong>
                <small>
                    Data yang ditambahkan akan muncul
                    pada tabel di bawah.
                </small>
            </div>
        `;

        return html;

    }

    html += `
        <div class="flokInputTableWrap">
            <table class="flokInputTable">
                <thead>
                    <tr>
                        <th>UMUR</th>
                        <th>TANGGAL</th>
                        <th>MATI</th>
                        <th>AFKIR</th>
                        <th>BB AVG</th>
                        <th>PAKAN</th>
                        <th>JENIS</th>
                        <th>STATUS</th>
                        <th aria-label="Aksi">🗑</th>
                    </tr>
                </thead>

                <tbody>
                    ${gabungan.map(item => {

                        const sessionIndex =
                            data.findIndex(
                                sessionItem =>
                                    Number(sessionItem?.umur) ===
                                    Number(item.umur)
                            );

                        const tombolHapus =
                            item.__server
                                ? `
                                    <button
                                        type="button"
                                        class="flokTableDeleteBtn disabled"
                                        disabled
                                        title="Data sudah tersimpan di server"
                                        aria-label="Hari ${item.umur} sudah tersimpan di server">
                                        🗑
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="flokTableDeleteBtn"
                                        onclick="hapusDataInputFlok('${flok}', ${sessionIndex})"
                                        title="Hapus data Hari ${item.umur}"
                                        aria-label="Hapus data Hari ${item.umur}">
                                        🗑
                                    </button>
                                `;

                        return `
                            <tr>
                                <td><strong>${formatAngkaInputFlok(item.umur)}</strong></td>
                                <td>${escapeInputFlokText(item.tanggal || "—")}</td>
                                <td>${formatAngkaInputFlok(item.mati)}</td>
                                <td>${formatAngkaInputFlok(item.afkir)}</td>
                                <td>${formatBBInputFlok(item.bbAvg)}</td>
                                <td>${formatAngkaInputFlok(item.konsumsiPakan)}</td>
                                <td>${escapeInputFlokText(item.jenisPakan || "—")}</td>
                                <td>
                                    <span class="flokTableStatus ${item.__server ? "server" : "pending"}">
                                        ${item.__server ? "✓ SERVER" : "BELUM"}
                                    </span>
                                </td>
                                <td>${tombolHapus}</td>
                            </tr>
                        `;

                    }).join("")}
                </tbody>
            </table>
        </div>
    `;

    return html;
}


// ==========================================================
// STYLE TABEL INPUT FLOK
// ==========================================================

function ensureInputFlokTableStyle() {

    if (
        document.getElementById(
            "fmcInputFlokTableStyle"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "fmcInputFlokTableStyle";

    style.textContent = `
        .flokInputTableWrap {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-top: 8px;
            border: 1px solid #e4ebe7;
            border-radius: 18px;
            background: #ffffff;
        }

        .flokInputTable {
            width: 100%;
            min-width: 760px;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 12px;
        }

        .flokInputTable th {
            padding: 11px 9px;
            background: #f3f7f5;
            color: #4f5d56;
            font-size: 10px;
            font-weight: 900;
            white-space: nowrap;
            border-bottom: 1px solid #e3ebe7;
        }

        .flokInputTable td {
            padding: 11px 9px;
            color: #27332d;
            white-space: nowrap;
            border-bottom: 1px solid #edf1ef;
            text-align: center;
            vertical-align: middle;
        }

        .flokInputTable tbody tr:last-child td {
            border-bottom: 0;
        }

        .flokTableStatus {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 64px;
            padding: 5px 7px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: 900;
        }

        .flokTableStatus.server {
            background: #e8f8ee;
            color: #087d3c;
        }

        .flokTableStatus.pending {
            background: #fff4d6;
            color: #8a5a00;
        }

        .flokTableDeleteBtn {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 10px;
            background: #fff0f0;
            color: #d93025;
            font-size: 17px;
            cursor: pointer;
        }

        .flokTableDeleteBtn.disabled {
            opacity: .38;
            cursor: not-allowed;
        }

        @media (max-width: 520px) {
            .flokInputTable {
                min-width: 720px;
            }
        }
    `;

    document.head.appendChild(style);
}


// ==========================================================
// FORMAT ANGKA
// ==========================================================

function formatAngkaInputFlok(
    nilai
) {

    if (
        nilai === undefined ||
        nilai === null ||
        nilai === ""
    ) {

        return "—";

    }


    const number =
        Number(
            nilai
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return String(
            nilai
        );

    }


    return number.toLocaleString(
        "id-ID"
    );

}


// ==========================================================
// FORMAT BB
// ==========================================================

function formatBBInputFlok(
    nilai
) {

    if (
        nilai === undefined ||
        nilai === null ||
        nilai === ""
    ) {

        return "—";

    }


    const number =
        Number(
            nilai
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return String(
            nilai
        );

    }


    return number.toLocaleString(
        "id-ID",
        {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }
    );

}


// ==========================================================
// MASTER PAKAN — SINKRON DENGAN MODUL PAKAN
// ==========================================================
//
// Master dibaca dari GAS melalui action getMasterPakan.
// Harga hanya untuk tampilan readonly pada Input FLOK.
// Harga TIDAK dikirim sebagai field produksi.
//

if (!window.fmcMasterPakan) {
    window.fmcMasterPakan = {};
}

if (!window.fmcMasterPakanMeta) {
    window.fmcMasterPakanMeta = [];
}

function buatPilihanJenisPakanInputFlok() {

    const meta =
        Array.isArray(window.fmcMasterPakanMeta)
            ? window.fmcMasterPakanMeta
            : [];

    const fallback = [
        { kodePakan: "BR1", jenis: "Starter" },
        { kodePakan: "BR2", jenis: "Grower" },
        { kodePakan: "BR3", jenis: "Finisher" },
        { kodePakan: "511", jenis: "Starter" },
        { kodePakan: "512", jenis: "Grower-Finisher" }
    ];

    const source = meta.length ? meta : fallback;

    return `
        <option value="">
            Pilih jenis pakan
        </option>
        ${source.map(item => `
            <option value="${escapeInputFlokText(
                item.kodePakan || item.kode || ""
            )}">
                ${escapeInputFlokText(
                    item.kodePakan || item.kode || ""
                )}
            </option>
        `).join("")}
    `;
}

function escapeInputFlokText(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function muatMasterPakanInputFlok() {

    try {

        const response =
            await apiPost(
                "getMasterPakan",
                {}
            );

        if (!response || response.success === false) {
            return false;
        }

        const payload =
            response.data ||
            response.result ||
            response;

        // GAS dapat mengembalikan array langsung, atau {items/data}.
        const items =
            Array.isArray(payload)
                ? payload
                : Array.isArray(payload.items)
                    ? payload.items
                    : Array.isArray(payload.data)
                        ? payload.data
                        : Array.isArray(response.items)
                            ? response.items
                            : [];

        const harga = {};
        const meta = [];
        const seen = new Set();

        items.forEach(item => {

            if (!item || typeof item !== "object") {
                return;
            }

            const kode = String(
                item.kodePakan ??
                item.KodePakan ??
                item["Kode Pakan"] ??
                item.kode ??
                item.KODE ??
                item.jenisPakan ??
                item["Jenis Pakan"] ??
                ""
            ).trim().toUpperCase();

            const hargaRaw =
                item.hargaKg ??
                item.HargaKg ??
                item["Harga/Kg"] ??
                item["Harga / Kg"] ??
                item.harga ??
                item.HARGA ??
                item["Harga"] ??
                "";

            const jenis = String(
                item.jenis ??
                item.Jenis ??
                item.jenisPakan ??
                item["Jenis Pakan"] ??
                item.nama ??
                item.Nama ??
                ""
            ).trim();

            if (!kode) {
                return;
            }

            const angkaHarga =
                parseNilaiAngkaInputFlok(hargaRaw);

            if (angkaHarga !== "") {
                harga[kode] = angkaHarga;
            }

            if (!seen.has(kode)) {
                seen.add(kode);
                meta.push({
                    kodePakan: kode,
                    jenis: jenis
                });
            }
        });

        window.fmcMasterPakan = harga;
        window.fmcHargaPakan = harga;
        window.fmcMasterPakanMeta = meta;

        const select =
            document.getElementById(
                "inputFlokJenisPakan"
            );

        if (select) {
            const current = select.value;
            select.innerHTML =
                buatPilihanJenisPakanInputFlok();

            if (current) {
                select.value = current;
            }

            ubahHargaInputFlok(select.value || "");
        }

        return true;

    } catch (error) {

        console.warn(
            "INPUT FLOK: master pakan tidak dapat dimuat.",
            error
        );

        return false;
    }
}


// ==========================================================
// HARGA PAKAN
// ==========================================================

function parseNilaiAngkaInputFlok(nilai) {

    if (nilai === undefined || nilai === null || nilai === "") {
        return "";
    }

    if (typeof nilai === "number") {
        return Number.isFinite(nilai) ? nilai : "";
    }

    let text = String(nilai).trim();

    if (!text) {
        return "";
    }

    // Format Indonesia: 11.000,00 -> 11000
    if (text.includes(".") && text.includes(",")) {
        text = text.replace(/\./g, "").replace(",", ".");
    } else if (/^[-+]?\d{1,3}(?:\.\d{3})+$/.test(text)) {
        // Format ribuan tanpa desimal: 11.000 -> 11000
        text = text.replace(/\./g, "");
    } else if (text.includes(",")) {
        text = text.replace(",", ".");
    }

    const number = Number(text);
    return Number.isFinite(number) ? number : "";
}

function getHargaInputFlok(jenisPakan) {

    const master =
        window.fmcMasterPakan ||
        window.fmcHargaPakan ||
        {};

    const value =
        master[String(jenisPakan || "").trim().toUpperCase()];

    return parseNilaiAngkaInputFlok(value);
}


// ==========================================================
// PERUBAHAN JENIS PAKAN
// ==========================================================

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


    const harga =
        getHargaInputFlok(
            jenisPakan
        );


    if (
        harga === "" ||
        harga === null ||
        harga === undefined
    ) {

        hargaEl.value =
            "—";

        return;

    }


    hargaEl.value =
        Number(
            harga
        ).toLocaleString(
            "id-ID"
        );

}


// ==========================================================
// MUAT DOC IN
// ==========================================================

async function muatDOCInputFlok() {

    // ======================================================
    // SUMBER UTAMA: DOC IN DARI GAS
    // ======================================================
    //
    // Input FLOK tidak membuat tanggal sendiri.
    // Tanggal harus berasal dari DOC IN tenant.
    //
    // Prioritas:
    // 1. cache khusus Input FLOK
    // 2. serverData.docin
    // 3. request langsung ke GAS: getDocIn
    // ======================================================

    if (
        window.fmcInputFlokDOCIN &&
        Object.values(
            window.fmcInputFlokDOCIN
        ).some(value => value)
    ) {
        return window.fmcInputFlokDOCIN;
    }

    if (
        window.fmcInputFlokDocIn &&
        typeof window.fmcInputFlokDocIn === "object" &&
        Object.keys(window.fmcInputFlokDocIn).length
    ) {
        window.fmcInputFlokDOCIN = {
            A:
                window.fmcInputFlokDocIn.tglA ||
                window.fmcInputFlokDocIn.A ||
                "",
            B:
                window.fmcInputFlokDocIn.tglB ||
                window.fmcInputFlokDocIn.B ||
                "",
            C:
                window.fmcInputFlokDocIn.tglC ||
                window.fmcInputFlokDocIn.C ||
                "",
            D:
                window.fmcInputFlokDocIn.tglD ||
                window.fmcInputFlokDocIn.D ||
                ""
        };

        if (
            Object.values(
                window.fmcInputFlokDOCIN
            ).some(value => value)
        ) {
            return window.fmcInputFlokDOCIN;
        }
    }

    const server =
        window.serverData;

    const serverDocIn =
        server?.docin ||
        server?.DOCIN ||
        server?.docIn ||
        null;

    if (
        serverDocIn &&
        typeof serverDocIn === "object"
    ) {
        window.fmcInputFlokDOCIN = {
            A:
                serverDocIn.tglA ||
                serverDocIn.A ||
                serverDocIn.flokA ||
                serverDocIn.FLOK_A ||
                "",
            B:
                serverDocIn.tglB ||
                serverDocIn.B ||
                serverDocIn.flokB ||
                serverDocIn.FLOK_B ||
                "",
            C:
                serverDocIn.tglC ||
                serverDocIn.C ||
                serverDocIn.flokC ||
                serverDocIn.FLOK_C ||
                "",
            D:
                serverDocIn.tglD ||
                serverDocIn.D ||
                serverDocIn.flokD ||
                serverDocIn.FLOK_D ||
                ""
        };

        if (
            Object.values(
                window.fmcInputFlokDOCIN
            ).some(value => value)
        ) {
            return window.fmcInputFlokDOCIN;
        }
    }

    // ======================================================
    // REQUEST LANGSUNG KE GAS
    // ======================================================

    const result =
        await apiPost(
            "getDocIn",
            {}
        );

    if (
        !result ||
        result.success !== true ||
        !result.data
    ) {
        throw new Error(
            result?.message ||
            "Data DOC IN tidak tersedia."
        );
    }

    const data =
        result.data;

    // Simpan hasil dalam dua nama cache agar kompatibel
    // dengan modul DOC IN lama dan Input FLOK.
    window.fmcInputFlokDocIn =
        data;

    window.fmcInputFlokDOCIN = {
        A:
            data.tglA ||
            data.A ||
            data.flokA ||
            data.FLOK_A ||
            "",
        B:
            data.tglB ||
            data.B ||
            data.flokB ||
            data.FLOK_B ||
            "",
        C:
            data.tglC ||
            data.C ||
            data.flokC ||
            data.FLOK_C ||
            "",
        D:
            data.tglD ||
            data.D ||
            data.flokD ||
            data.FLOK_D ||
            ""
    };

    return window.fmcInputFlokDOCIN;
}

// ==========================================================
// AMBIL TANGGAL DOC IN
// ==========================================================

function ambilTanggalDOCInputFlok(
    flok
) {

    const candidates = [

        window.fmcDocInData?.[flok],

        window.fmcDOCIN?.[flok],

        window.serverData?.docin?.[flok],

        window.serverData?.docIn?.[flok],

        window.serverData?.DOCIN?.[flok],

        window.serverData?.docin?.[
            `flok${flok}`
        ],

        window.serverData?.docIn?.[
            `flok${flok}`
        ]

    ];


    for (
        const candidate of candidates
    ) {

        if (
            candidate !== undefined &&
            candidate !== null &&
            candidate !== ""
        ) {

            const normalized =
                normalisasiTanggalInputFlok(
                    candidate
                );


            if (normalized) {

                return normalized;

            }

        }

    }


    return "";

}


// ==========================================================
// NORMALISASI TANGGAL
// ==========================================================

function normalisasiTanggalInputFlok(
    value
) {

    if (
        value instanceof Date
    ) {

        return value;

    }


    if (
        typeof value ===
        "number"
    ) {

        const date =
            new Date(
                value
            );


        return Number.isNaN(
            date.getTime()
        )
            ? ""
            : date;

    }


    const text =
        String(
            value
        ).trim();


    if (!text) {
        return "";
    }


    // Format dd/MM/yyyy

    let match =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        const day =
            Number(
                match[1]
            );


        const month =
            Number(
                match[2]
            ) - 1;


        const year =
            Number(
                match[3]
            );


        const date =
            new Date(
                year,
                month,
                day
            );


        return Number.isNaN(
            date.getTime()
        )
            ? ""
            : date;

    }


    // ISO date / timestamp:
    // 2026-08-17 atau 2026-08-17T00:00:00.000Z
    const isoDate =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/
        );

    if (isoDate) {

        const year =
            Number(isoDate[1]);

        const month =
            Number(isoDate[2]) - 1;

        const day =
            Number(isoDate[3]);

        const date =
            new Date(
                year,
                month,
                day
            );

        return Number.isNaN(
            date.getTime()
        )
            ? ""
            : date;

    }

    // Format yyyy-MM-dd

    match =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        const year =
            Number(
                match[1]
            );


        const month =
            Number(
                match[2]
            ) - 1;


        const day =
            Number(
                match[3]
            );


        const date =
            new Date(
                year,
                month,
                day
            );


        return Number.isNaN(
            date.getTime()
        )
            ? ""
            : date;

    }


    const date =
        new Date(
            text
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date;

}


// ==========================================================
// SIMPAN INPUT FLOK KE GAS
// ==========================================================
//
// Tombol ini adalah satu-satunya tombol yang mengirim data
// ke server.
// TAMBAH DATA tidak melakukan request server.
//

function tampilToastServerInputFlok(pesan = "Data telah tersimpan di server") {
    let toast = document.getElementById("fmcInputFlokServerToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "fmcInputFlokServerToast";
        toast.innerHTML = `<span style="font-size:20px;line-height:1">📢</span><span class="fmcInputFlokToastText"></span>`;
        toast.style.cssText = `position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-18px);z-index:2147483647;display:flex;align-items:center;gap:10px;width:min(92vw,520px);box-sizing:border-box;padding:13px 17px;border-radius:14px;background:#f6c344;color:#2b240b;border:2px solid #e0a800;box-shadow:0 10px 30px rgba(0,0,0,.22);font-size:14px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease;`;
        document.body.appendChild(toast);
    }
    const text = toast.querySelector(".fmcInputFlokToastText");
    if (text) text.textContent = String(pesan).replace(/^📢\s*/, "");
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(window.__fmcInputFlokToastTimer);
    window.__fmcInputFlokToastTimer = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-18px)";
    }, 3500);
}

async function simpanInputFlokKeGAS() {

    const flok = getInputFlokAktif();
    const btn = document.getElementById("btnSimpanInputFlok");
    const semuaDataSesi = window.fmcInputFlokDataSesi[flok] || [];
    const dataServer = window.fmcInputFlokHasilServer[flok] || [];

    const umurServer = new Set(
        dataServer.map(item => Number(item?.umur))
    );

    const data = semuaDataSesi.filter(
        item =>
            item &&
            item.__server !== true &&
            !umurServer.has(Number(item.umur))
    );

    if (!data.length) {
        tampilToastServerInputFlok(
            "📢 Tidak ada data baru untuk disimpan di server"
        );
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <span class="material-symbols-rounded">sync</span>
            MENYIMPAN...
        `;
    }

    try {

        const items = data.map(item => ({
            flok,
            umur: Number(item.umur),
            tanggal: item.tanggal || "",
            mati: Number(item.mati || 0),
            afkir: Number(item.afkir || 0),
            bbAvg: Number(item.bbAvg || 0),
            konsumsiPakan: Number(item.konsumsiPakan || 0),
            jenisPakan: String(item.jenisPakan || "")
                .trim()
                .toUpperCase()
        }));

        /*
         * SAVE ke GAS.
         * Response POST bukan satu-satunya sumber status.
         * Jika response bermasalah, kita tetap melakukan GET
         * untuk memastikan apakah data sudah benar-benar masuk.
         */
        let response = null;
        let postError = null;

        try {
            response = await apiPost(
                "saveInputFlok",
                {
                    flok,
                    items: JSON.stringify(items)
                }
            );
        } catch (saveError) {
            postError = saveError;
            console.warn(
                "INPUT FLOK: response POST bermasalah, lanjut verifikasi server.",
                saveError
            );
        }

        /*
         * Server tetap menjadi sumber kebenaran.
         * Verifikasi cukup memastikan UMUR yang baru dikirim
         * sudah muncul kembali dari server.
         * Kita tidak membandingkan nilai input satu per satu,
         * karena Spreadsheet dapat mengubah format/nilai melalui
         * formula atau normalisasi.
         */
        let serverVerified = false;
        let verificationError = null;

        try {
            await muatInputFlokDariGAS(flok);

            const serverAfterSave =
                window.fmcInputFlokHasilServer[flok] || [];

            const umurServerAfterSave = new Set(
                serverAfterSave.map(
                    serverItem => Number(serverItem?.umur)
                )
            );

            serverVerified = data.every(
                savedItem =>
                    umurServerAfterSave.has(
                        Number(savedItem.umur)
                    )
            );

        } catch (refreshError) {
            verificationError = refreshError;
            console.warn(
                "INPUT FLOK: GET verifikasi setelah SAVE gagal.",
                refreshError
            );
        }

        /*
         * SAVE dinyatakan berhasil apabila:
         * 1. GET menemukan kembali umur yang baru dikirim, ATAU
         * 2. POST dari GAS secara eksplisit mengembalikan success:true.
         *
         * GET hanya berfungsi sebagai sinkronisasi/verifikasi tambahan,
         * bukan alasan untuk membatalkan SAVE yang sudah dikonfirmasi POST.
         */
        const postConfirmed = !!(
            response &&
            response.success === true
        );

        if (serverVerified || postConfirmed) {

            const umurTersimpan = new Set(
                (
                    window.fmcInputFlokHasilServer[flok] || []
                ).map(item => Number(item?.umur))
            );

            window.fmcInputFlokDataSesi[flok] =
                (window.fmcInputFlokDataSesi[flok] || [])
                    .map(item =>
                        umurTersimpan.has(Number(item.umur))
                            ? { ...item, __server: true }
                            : item
                    );

            simpanInputFlokSessionLocal();

            tampilToastServerInputFlok(
                "📢 Data telah tersimpan di server"
            );

            tampilPesanInputFlok(
                serverVerified
                    ? "Data FLOK berhasil disimpan dan dikonfirmasi dari server."
                    : "Data FLOK berhasil disimpan di server.",
                "success"
            );

            return;
        }

        const alasan =
            verificationError?.message ||
            response?.message ||
            postError?.message ||
            "Server belum mengonfirmasi data yang dikirim.";

        throw new Error(alasan);

    } catch (error) {

        console.error(
            "INPUT FLOK SAVE ERROR:",
            error
        );

        tampilPesanInputFlok(
            error?.message ||
            "Data Input FLOK gagal dikirim ke server.",
            "error"
        );

        tampilToastServerInputFlok(
            "📢 Data belum berhasil tersimpan di server"
        );

    } finally {

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <span class="material-symbols-rounded">save</span>
                SIMPAN DATA FLOK
            `;
        }
    }
}


// ==========================================================
// MUAT DATA INPUT FLOK DARI GAS
// ==========================================================
//
// GAS membaca kembali hasil Spreadsheet setelah formula
// bekerja. PWA tidak menghitung FCR/IP/Tonase sendiri.
//

function normalisasiRingkasanInputFlok(payload) {

    if (!payload || typeof payload !== "object") {
        return null;
    }

    const source =
        payload.ringkasan ||
        payload.summary ||
        payload.Ringkasan ||
        payload.summaryData ||
        payload;

    if (!source || typeof source !== "object") {
        return null;
    }

    const rawSatuan =
        source.satuanZak ||
        source.SatuanZak ||
        source.satuan ||
        source.stok ||
        source.stock ||
        payload.satuanZak ||
        payload.SatuanZak ||
        {};

    const ambilSatuan = kode => {
        if (rawSatuan === null || typeof rawSatuan !== "object") {
            return 0;
        }

        const value =
            rawSatuan[kode] ??
            rawSatuan[kode.toLowerCase()] ??
            rawSatuan[kode.toUpperCase()] ??
            rawSatuan[`zak${kode}`] ??
            rawSatuan[`zak_${kode}`] ??
            rawSatuan[`jumlah${kode}`] ??
            rawSatuan[`jumlah_${kode}`] ??
            0;

        return parseNilaiAngkaInputFlok(value) || 0;
    };

    const br1 = ambilSatuan("BR1");
    const br2 = ambilSatuan("BR2");
    const br3 = ambilSatuan("BR3");

    const totalRaw =
        source.totalZak ??
        source.TotalZak ??
        source.total ??
        source.TOTAL ??
        source.totalStok ??
        source.totalStock ??
        payload.totalZak ??
        payload.TotalZak ??
        payload.total ??
        (br1 + br2 + br3);

    const biayaPakan =
        source.biayaPakan ??
        source.BiayaPakan ??
        source["Biaya Pakan"] ??
        source.BIAYA_PAKAN ??
        source.biaya ??
        payload.biayaPakan ??
        payload.BiayaPakan ??
        "";

    const akumulasi =
        source.akumulasi ??
        source.Akumulasi ??
        source.AKUMULASI ??
        source["Akumulasi"] ??
        payload.akumulasi ??
        payload.Akumulasi ??
        "";

    return {
        biayaPakan: biayaPakan,
        akumulasi: akumulasi,
        satuanZak: {
            BR1: br1,
            BR2: br2,
            BR3: br3
        },
        totalZak: parseNilaiAngkaInputFlok(totalRaw) || (br1 + br2 + br3)
    };
}

async function muatInputFlokDariGAS(flok) {

    if (!["A", "B", "C", "D"].includes(flok)) {
        throw new Error("FLOK tidak valid.");
    }

    /*
     * Simpan checkpoint lokal yang belum tersimpan
     * sebelum meminta data terbaru dari server.
     */
    const localBefore =
        window.fmcInputFlokDataSesi[flok] || [];

    const unsavedBefore =
        localBefore.filter(
            item =>
                item &&
                item.__server !== true &&
                Number.isInteger(Number(item.umur))
        );

    const response =
        await apiPost(
            "getInputFlok",
            { flok }
        );

    if (
        !response ||
        response.success !== true ||
        !response.data ||
        !Array.isArray(response.data.items)
    ) {

        throw new Error(
            response?.message ||
            "Data Input FLOK dari server tidak valid."
        );

    }

    const serverItems =
        response.data.items
            .map(item => normalisasiItemInputFlokAktif(item))
            .filter(Boolean)
            .sort(
                (a, b) =>
                    Number(a.umur) -
                    Number(b.umur)
            )
            .map(item => ({
                ...item,
                __server: true
            }));

    window.fmcInputFlokHasilServer[flok] =
        serverItems;

    const serverUmur =
        new Set(
            serverItems.map(
                item => Number(item.umur)
            )
        );

    const unsaved =
        unsavedBefore
            .filter(
                item =>
                    !serverUmur.has(
                        Number(item.umur)
                    )
            )
            .map(item => ({
                ...item,
                __server: false
            }));

    window.fmcInputFlokDataSesi[flok] = [
        ...serverItems,
        ...unsaved
    ].sort(
        (a, b) =>
            Number(a.umur) -
            Number(b.umur)
    );

    simpanInputFlokSessionLocal();

    const rekap =
        document.getElementById(
            "inputFlokRekap"
        );

    if (rekap) {
        rekap.innerHTML =
            renderRekapInputFlok(flok);
    }

    /*
     * Umur berikutnya dihitung ulang setelah server
     * selesai dimuat. Tidak menggunakan nilai dropdown
     * lama.
     */
    const nextUmur =
        getUmurBerikutnyaInputFlok(flok);

    refreshPilihanUmurInputFlok(
        flok,
        nextUmur
    );

    const umurEl =
        document.getElementById(
            "inputFlokUmur"
        );

    if (umurEl) {

        umurEl.value =
            String(nextUmur);

        ubahUmurInputFlok(
            nextUmur
        );

    }

    return serverItems;
}


/* ==========================================================
   NORMALISASI ITEM SERVER
   ========================================================== */

function normalisasiItemInputFlokAktif(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {
        return null;
    }

    const umur =
        Number(
            item.umur ??
            item.UMUR ??
            item.age ??
            item.AGE
        );

    if (
        !Number.isInteger(umur) ||
        umur < 1 ||
        umur > 45
    ) {
        return null;
    }

    return {

        flok:
            item.flok ||
            item.FLOK ||
            getInputFlokAktif(),

        umur,

        tanggal:
            item.tanggal ??
            item.Tanggal ??
            item.TANGGAL ??
            item.date ??
            item.DATE ??
            "",

        mati:
            item.mati ??
            item.Mati ??
            item.MATI ??
            0,

        afkir:
            item.afkir ??
            item.Afkir ??
            item.AFKIR ??
            0,

        bbAvg:
            item.bbAvg ??
            item.BBAvg ??
            item["BB Avg"] ??
            item.BB_AVG ??
            "",

        konsumsiPakan:
            item.konsumsiPakan ??
            item.KonsumsiPakan ??
            item["Konsumsi Pakan"] ??
            item.KONSUMSI_PAKAN ??
            0,

        jenisPakan:
            item.jenisPakan ??
            item.JenisPakan ??
            item["Jenis Pakan"] ??
            item.JENIS_PAKAN ??
            item.jenis ??
            "",

        harga:
            item.harga ??
            item.Harga ??
            "",

        ayamHidup:
            item.ayamHidup ??
            item.AyamHidup ??
            item["Ayam Hidup"] ??
            item.AYAM_HIDUP ??
            "",

        mortalitas:
            item.mortalitas ??
            item.Mortalitas ??
            item["Mortalitas"] ??
            item.MORTALITAS ??
            "",

        fcr:
            item.fcr ??
            item.FCR ??
            "",

        ip:
            item.ip ??
            item.IP ??
            "",

        tonase:
            item.tonase ??
            item.Tonase ??
            item.TONASE ??
            "",

        biayaPakan:
            item.biayaPakan ??
            item.BiayaPakan ??
            item["Biaya Pakan"] ??
            item.BIAYA_PAKAN ??
            "",

        akumulasi:
            item.akumulasi ??
            item.Akumulasi ??
            item.AKUMULASI ??
            ""

    };
}

// ==========================================================
// PUBLIC API — AUDITED V3
// ==========================================================
// Hanya expose fungsi yang memang dipakai oleh HTML / aplikasi utama.

window.tampilInputFlok = tampilInputFlok;
window.pilihInputFlok = pilihInputFlok;
window.ubahUmurInputFlok = ubahUmurInputFlok;
window.tambahDataInputFlokUI = tambahDataInputFlokUI;
window.hapusDataInputFlok = hapusDataInputFlok;
window.simpanInputFlokKeGAS = simpanInputFlokKeGAS;
window.muatInputFlokDariGAS = muatInputFlokDariGAS;
window.ubahHargaInputFlok = ubahHargaInputFlok;
window.muatMasterPakanInputFlok = muatMasterPakanInputFlok;
window.renderRekapInputFlok = renderRekapInputFlok;
window.tampilPesanInputFlok = tampilPesanInputFlok;

// END OF INPUT FLOK.JS — AUDITED V3
