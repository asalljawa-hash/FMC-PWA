// ==========================================================
// FMC BROILER MOBILE V11
// PLAN-PANEN.JS
// UI INPUT + REKAPAN PLAN PANEN
// ==========================================================

"use strict";


// ==========================================================
// DATA SEMENTARA SESI
// ==========================================================

window.fmcPlanPanenData =
    window.fmcPlanPanenData || [];


// ==========================================================
// KONSTANTA FLOK
// ==========================================================

const PLAN_PANEN_FLOK = [
    "FLOK A",
    "FLOK B",
    "FLOK C",
    "FLOK D"
];


// ==========================================================
// DROPDOWN KE
// Nilai KE tetap 1 - 100.
// ID internal tetap planTotal100 agar kompatibel
// dengan fungsi pengambilan dan reset data.
// ==========================================================

function buatPilihanKE() {

    let html = `
        <option value="">
            Pilih KE
        </option>
    `;

    for (let i = 1; i <= 100; i++) {

        html += `
            <option value="${i}">
                ${i}
            </option>
        `;

    }

    return html;
}


// ==========================================================
// TAMPILKAN HALAMAN PLAN PANEN
// ==========================================================

function tampilPlanPanen(){

    const page =
        document.getElementById(
            "planpanenPage"
        );


    if(!page){

        console.warn(
            "PLAN PANEN: #planpanenPage tidak ditemukan."
        );

        return;
    }


    // ======================================================
    // JIKA HALAMAN SUDAH DIBUAT
    // JANGAN RENDER ULANG
    //
    // Ini penting karena app.js melakukan auto refresh
    // setiap 30 detik.
    // ======================================================

    if(
        page.dataset.rendered === "true"
    ){

        renderRekapanPlanPanen();

        return;

    }


    // ======================================================
    // RENDER PERTAMA KALI
    // ======================================================

    page.innerHTML =
        renderPlanPanenPage();


    page.dataset.rendered =
        "true";


    renderRekapanPlanPanen();

}


// ==========================================================
// RENDER HALAMAN
// ==========================================================

function renderPlanPanenPage() {

    return `

        <section class="planPanenPage">


            <!-- ==================================================
                 HEADER
            ================================================== -->

            <div class="planPanenHeader">

                <div>

                    <div class="planPanenSmall">
                        FMC BROILER MOBILE V11
                    </div>

                    <h2>

                        <span class="material-symbols-rounded">
                            event_available
                        </span>

                        Plan Panen

                    </h2>

                    <p>
                        Rencana panen flok
                    </p>

                </div>


                <div class="planPanenStatusBadge">

                    <span class="material-symbols-rounded">
                        calendar_month
                    </span>

                    PLAN PANEN

                </div>

            </div>


            <!-- ==================================================
                 PETUNJUK
            ================================================== -->

            <div class="planPanenInfo">

                <span class="material-symbols-rounded">
                    info
                </span>

                <div>

                    <strong>
                        Petunjuk Plan Panen
                    </strong>

                    <p>
                        Silakan isi data rencana panen
                        sesuai kondisi dan target panen Anda.
                        Data ini akan digunakan FMC untuk
                        membantu perhitungan dan rekapan
                        rencana panen.
                    </p>

                </div>

            </div>


            <!-- ==================================================
                 INPUT CARD
            ================================================== -->

            <div class="planPanenCard">


                <div class="planPanenSectionTitle">

                    <span class="material-symbols-rounded">
                        edit_note
                    </span>

                    <h3>
                        Input Rencana Panen
                    </h3>

                </div>


                <div class="planPanenForm">


                    <!-- ==========================================
                         JENIS PANEN
                    =========================================== -->

                    <div class="planPanenField">

                        <label for="planJenisPanen">
                            Jenis Panen
                        </label>

                        <select
                            id="planJenisPanen">

                            <option value="">
                                Pilih Jenis Panen
                            </option>

                            <option value="Penjarangan">
                                Penjarangan
                            </option>

                            <option value="Panen Raya">
                                Panen Raya
                            </option>

                        </select>

                    </div>


                    <!-- ==========================================
                         KE
                    =========================================== -->

                    <div class="planPanenField">

                        <label for="planTotal100">
                            KE
                        </label>

                        <select
                            id="planTotal100">

                            ${buatPilihanKE()}

                        </select>

                    </div>


                    <!-- ==========================================
                         FLOK
                    =========================================== -->

                    <div class="planPanenField">

                        <label for="planFlok">
                            Flok
                        </label>

                        <select
                            id="planFlok">

                            <option value="">
                                Pilih Flok
                            </option>

                            ${PLAN_PANEN_FLOK
                                .map(
                                    flok => `
                                        <option value="${flok}">
                                            ${flok}
                                        </option>
                                    `
                                )
                                .join("")}

                        </select>

                    </div>


                    <!-- ==========================================
                         EKOR
                    =========================================== -->

                    <div class="planPanenField">

                        <label for="planEkor">
                            Ekor
                        </label>

                        <input
                            type="number"
                            id="planEkor"
                            min="1"
                            step="1"
                            inputmode="numeric"
                            placeholder="Jumlah ayam"
                            autocomplete="off">

                    </div>


                    <!-- ==========================================
                         TARGET TONASE
                    =========================================== -->

                    <div class="planPanenField">

                        <label for="planTargetTonase">
                            Target Tonase
                        </label>

                        <input
                            type="number"
                            id="planTargetTonase"
                            min="0.001"
                            step="0.001"
                            inputmode="decimal"
                            placeholder="Contoh 2.000"
                            autocomplete="off">

                    </div>


                    <!-- ==========================================
                         BB TARGET
                    =========================================== -->

                    <div class="planPanenField">

                        <label for="planBBTarget">
                            BB Target
                        </label>

                        <input
                            type="number"
                            id="planBBTarget"
                            min="0.01"
                            step="0.01"
                            inputmode="decimal"
                            placeholder="Contoh 0.80"
                            autocomplete="off">

                        <small>
                            kg/ekor
                        </small>

                    </div>


                </div>


                <!-- ==================================================
                     PESAN
                ================================================== -->

                <div
                    id="planPanenMessage"
                    class="planPanenMessage"
                    style="display:none;">
                </div>


                <!-- ==================================================
                     TAMBAH DATA
                ================================================== -->

                <button
                    type="button"
                    class="planPanenAddBtn"
                    onclick="tambahPlanPanenUI()">

                    <span class="material-symbols-rounded">
                        add
                    </span>

                    TAMBAH RENCANA PANEN

                </button>


            </div>


            <!-- ==================================================
                 REKAPAN
            ================================================== -->

            <div
                class="planPanenCard
                       planPanenRekapCard">


                <div class="planPanenSectionTitle">

                    <span class="material-symbols-rounded">
                        list_alt
                    </span>

                    <h3>
                        Rekapan Rencana Panen
                    </h3>

                </div>


                <div
                    id="planPanenRekap"
                    class="planPanenRekap">
                </div>


            </div>


            <!-- ==================================================
                 SIMPAN
            ================================================== -->

            <button
                type="button"
                class="planPanenSaveBtn"
                onclick="simpanPlanPanenUI()">

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA PLAN PANEN

            </button>


            <!-- ==================================================
                 FOOTER
            ================================================== -->

            <div class="planPanenFooterInfo">

                Data rencana panen akan digunakan
                untuk rekapan dan perhitungan FMC.

            </div>


        </section>

    `;

}


// ==========================================================
// AMBIL INPUT
// ==========================================================

function ambilInputPlanPanen() {

    return {

        jenisPanen:
            document.getElementById(
                "planJenisPanen"
            )?.value || "",


        // ID HTML = planTotal100
        // Nama internal = total100
        total100:
            document.getElementById(
                "planTotal100"
            )?.value || "",


        flok:
            document.getElementById(
                "planFlok"
            )?.value || "",


        ekor:
            document.getElementById(
                "planEkor"
            )?.value || "",


        targetTonase:
            document.getElementById(
                "planTargetTonase"
            )?.value || "",


        bbTarget:
            document.getElementById(
                "planBBTarget"
            )?.value || ""

    };

}


// ==========================================================
// VALIDASI
// ==========================================================

function validasiPlanPanen(data) {


    if (!data.jenisPanen) {

        return {

            valid: false,

            message:
                "Silakan pilih Jenis Panen."

        };

    }


    if (!data.total100) {

        return {

            valid: false,

            message:
                "Silakan pilih KE."

        };

    }


    if (!data.flok) {

        return {

            valid: false,

            message:
                "Silakan pilih Flok."

        };

    }


    if (
        data.ekor === "" ||
        Number(data.ekor) <= 0
    ) {

        return {

            valid: false,

            message:
                "Silakan isi jumlah Ekor dengan benar."

        };

    }


    if (
        data.targetTonase === "" ||
        Number(data.targetTonase) <= 0
    ) {

        return {

            valid: false,

            message:
                "Silakan isi Target Tonase."

        };

    }


    if (
        data.bbTarget === "" ||
        Number(data.bbTarget) <= 0
    ) {

        return {

            valid: false,

            message:
                "Silakan isi BB Target."

        };

    }


    return {

        valid: true,

        message:
            "Data valid."

    };

}


// ==========================================================
// TAMBAH RENCANA PANEN
// ==========================================================

function tambahPlanPanenUI() {

    const data =
        ambilInputPlanPanen();


    const hasil =
        validasiPlanPanen(data);


    if (!hasil.valid) {

        tampilPesanPlanPanen(
            hasil.message,
            "warning"
        );

        return;
    }


    window.fmcPlanPanenData.push({

        jenisPanen:
            data.jenisPanen,


        total100:
            Number(data.total100),


        flok:
            data.flok,


        ekor:
            Number(data.ekor),


        targetTonase:
            Number(data.targetTonase),


        bbTarget:
            Number(data.bbTarget)

    });


    renderRekapanPlanPanen();


    kosongkanFormPlanPanen();


    tampilPesanPlanPanen(
        "Rencana panen berhasil ditambahkan.",
        "success"
    );

}


// ==========================================================
// RENDER REKAPAN
// ==========================================================

function renderRekapanPlanPanen() {

    const container =
        document.getElementById(
            "planPanenRekap"
        );


    if (!container) {

        return;
    }


    const data =
        window.fmcPlanPanenData;


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <div class="planPanenEmpty">

                <span class="material-symbols-rounded">
                    event_note
                </span>

                <strong>
                    Belum ada rencana panen
                </strong>

                <small>
                    Isi data di atas lalu tekan
                    "Tambah Rencana Panen".
                </small>

            </div>

        `;

        return;
    }


    container.innerHTML =

        data
            .map(
                (item, index) => `

                    <div
                        class="planPanenRekapItem">


                        <!-- ======================================
                             HEADER
                        ======================================= -->

                        <div
                            class="planPanenRekapTop">


                            <div>

                                <strong>
                                    ${escapePlanPanen(
                                        item.flok
                                    )}
                                </strong>

                                <small>
                                    ${escapePlanPanen(
                                        item.jenisPanen
                                    )}
                                </small>

                            </div>


                            <button
                                type="button"
                                class="planPanenDeleteBtn"
                                onclick="hapusPlanPanenUI(${index})"
                                aria-label="Hapus rencana">

                                <span class="material-symbols-rounded">
                                    delete
                                </span>

                            </button>


                        </div>


                        <!-- ======================================
                             DATA INPUT
                        ======================================= -->

                        <div
                            class="planPanenRekapGrid">


                            <div>

                                <small>
                                    KE
                                </small>

                                <strong>
                                    ${item.total100}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    EKOR
                                </small>

                                <strong>
                                    ${formatAngkaPlanPanen(
                                        item.ekor
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    TARGET TONASE
                                </small>

                                <strong>
                                    ${formatTonasePlanPanen(
                                        item.targetTonase
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    BB TARGET
                                </small>

                                <strong>
                                    ${formatBBPlanPanen(
                                        item.bbTarget
                                    )}
                                    kg/ekor
                                </strong>

                            </div>


                        </div>


                        <!-- ======================================
                             HASIL OTOMATIS
                        ======================================= -->

                        <div
                            class="planPanenAutoBox">


                            <div>

                                <small>
                                    TANGGAL PANEN
                                </small>

                                <strong>
                                    —
                                </strong>

                            </div>


                            <div>

                                <small>
                                    UMUR
                                </small>

                                <strong>
                                    —
                                </strong>

                            </div>


                            <div>

                                <small>
                                    HARGA KONTRAK
                                </small>

                                <strong>
                                    —
                                </strong>

                            </div>


                            <div>

                                <small>
                                    ESTIMASI RUPIAH
                                </small>

                                <strong>
                                    —
                                </strong>

                            </div>


                        </div>


                    </div>

                `
            )
            .join("");

}


// ==========================================================
// HAPUS RENCANA
// ==========================================================

function hapusPlanPanenUI(index) {

    if (
        index < 0 ||
        index >=
        window.fmcPlanPanenData.length
    ) {

        return;
    }


    const data =
        window.fmcPlanPanenData[index];


    const flok =
        data?.flok ||
        "rencana panen ini";


    const yakin =
        confirm(
            `Hapus rencana panen ${flok}?`
        );


    if (!yakin) {

        return;
    }


    window.fmcPlanPanenData.splice(
        index,
        1
    );


    renderRekapanPlanPanen();


    tampilPesanPlanPanen(
        "Rencana panen dihapus.",
        "info"
    );

}


// ==========================================================
// KOSONGKAN FORM
// ==========================================================

function kosongkanFormPlanPanen() {

    const ids = [

        "planJenisPanen",
        "planTotal100",
        "planFlok",
        "planEkor",
        "planTargetTonase",
        "planBBTarget"

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
// SIMPAN DATA
// ==========================================================

async function simpanPlanPanenUI() {

    const data =
        window.fmcPlanPanenData || [];


    if (!data.length) {

        tampilPesanPlanPanen(
            "Belum ada data rencana panen untuk disimpan.",
            "warning"
        );

        return;
    }


    const tombol =
        document.querySelector(
            ".planPanenSaveBtn"
        );


    if (tombol) {

        tombol.disabled = true;

        tombol.dataset.oldText =
            tombol.textContent;

        tombol.textContent =
            " MENYIMPAN... ";

    }


    try {

        const hasil =
            await simpanPlanPanenKeGAS(
                data
            );


        if (
            hasil &&
            hasil.success === true
        ) {

            window.fmcPlanPanenData =
                [];


            renderRekapanPlanPanen();


            tampilPesanPlanPanen(
                hasil.message ||
                "Data Plan Panen berhasil disimpan.",
                "success"
            );

            return;
        }


        /*
         * GAS belum siap / gagal.
         * Data sesi TIDAK dihapus.
         */

        tampilPesanPlanPanen(
            hasil?.message ||
            "Data belum tersimpan. Silakan coba lagi.",
            "warning"
        );

    } catch (error) {

        console.error(
            "PLAN PANEN GAS:",
            error
        );


        /*
         * Data sesi tetap dipertahankan
         * agar tidak hilang saat koneksi gagal.
         */

        tampilPesanPlanPanen(
            "Koneksi penyimpanan belum tersedia. Data tetap berada di sesi PWA.",
            "warning"
        );

    } finally {

        if (tombol) {

            tombol.disabled = false;

            tombol.textContent =
                tombol.dataset.oldText ||
                " SIMPAN DATA PLAN PANEN ";

            delete tombol.dataset.oldText;

        }

    }

}


// ==========================================================
// SIMPAN KE GAS
// Action GAS: savePlanPanen
// ==========================================================

async function simpanPlanPanenKeGAS(
    data
) {

    if (
        typeof apiPost !==
        "function"
    ) {

        return {

            success: false,

            message:
                "API belum tersedia."

        };

    }


    const items =
        data.map(
            function(item){

                return {

                    jenisPanen:
                        item.jenisPanen,

                    total100:
                        Number(
                            item.total100
                        ),

                    flok:
                        item.flok,

                    ekor:
                        Number(
                            item.ekor
                        ),

                    targetTonase:
                        Number(
                            item.targetTonase
                        ),

                    bbTarget:
                        Number(
                            item.bbTarget
                        )

                };

            }
        );


    const payload = {

        items:
            JSON.stringify(
                items
            )

    };


    const hasil =
        await apiPost(
            "savePlanPanen",
            payload
        );


    return hasil || {

        success: false,

        message:
            "Tidak ada respons dari server."

    };

}


// ==========================================================
// TAMPILKAN PESAN
// ==========================================================

function tampilPesanPlanPanen(
    pesan,
    tipe = "info"
) {

    const el =
        document.getElementById(
            "planPanenMessage"
        );


    if (!el) {

        return;
    }


    el.style.display =
        "block";


    el.className =
        "planPanenMessage " +
        tipe;


    el.textContent =
        pesan;

}


// ==========================================================
// FORMAT ANGKA
// ==========================================================

function formatAngkaPlanPanen(value) {

    return Number(
        value || 0
    )
        .toLocaleString(
            "id-ID"
        );

}


// ==========================================================
// FORMAT TONASE
// ==========================================================

function formatTonasePlanPanen(value) {

    return Number(
        value || 0
    )
        .toLocaleString(
            "id-ID",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            }
        ) + " ton";

}


// ==========================================================
// FORMAT BB
// ==========================================================

function formatBBPlanPanen(value) {

    return Number(
        value || 0
    )
        .toLocaleString(
            "id-ID",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapePlanPanen(value) {

    return String(
        value ?? ""
    )
        .replace(
            /[&<>"']/g,
            function(char) {

                return {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                }[char];

            }
        );

}


// ==========================================================
// STATUS
// ==========================================================

console.log(
    "PLAN PANEN.JS LOADED"
);