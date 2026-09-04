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

// ==========================================================
// ENVIRONMENT GUARD — BROWSER/PWA ONLY
// ==========================================================
// Google Apps Script / Worker dapat mengevaluasi source ini
// tanpa objek window/document. Jangan menyentuh window pada
// level global di environment tersebut.
//
// PENTING:
// Guard ini hanya memperbaiki environment error.
// UI, HTML, CSS, dan alur Input FLOK lama tidak diubah.
// ==========================================================

const FMC_INPUTFLOK_BROWSER =
    typeof window !== "undefined" &&
    typeof document !== "undefined";

if (FMC_INPUTFLOK_BROWSER) {

    if (!window.fmcInputFlokDataSesi) {
        window.fmcInputFlokDataSesi = {
            A: [],
            B: [],
            C: [],
            D: [],
            E: [],
            F: []
        };
    }

    if (!window.fmcInputFlokHasilServer) {
        window.fmcInputFlokHasilServer = {
            A: [],
            B: [],
            C: [],
            D: [],
            E: [],
            F: []
        };
    }

    window.fmcInputFlokServerLoaded =
        window.fmcInputFlokServerLoaded || {
            A: false, B: false, C: false,
            D: false, E: false, F: false
        };
}




// ==========================================================
// FMC INPUT FLOK — FAST OPEN CACHE V1
// ==========================================================
//
// Tujuan:
// - halaman cepat tampil setelah aplikasi dibuka kembali
// - cache HANYA untuk tampilan sementara
// - DB / Calculation Engine tetap SOURCE OF TRUTH
// - cache dipisahkan per tenant + period
// - serverLoaded tetap FALSE sampai server benar-benar tersinkron
//
// Cache tidak pernah dipakai untuk SAVE sebelum server sync berhasil.
// ==========================================================

const FMC_INPUTFLOK_FAST_CACHE_VERSION = "V1";
const FMC_INPUTFLOK_FAST_CACHE_PREFIX = "fmcInputFlokFastCache_";
const FMC_INPUTFLOK_FAST_LAST_PERIOD_PREFIX = "fmcInputFlokFastLastPeriod_";

function fmcInputFlokGetTenantKey_() {
    if (!FMC_INPUTFLOK_BROWSER) {
        return "";
    }

    const candidates = [];

    try {
        const server = window.serverData || null;
        if (server) {
            candidates.push(
                server.tenant_id,
                server.tenantId,
                server.context?.tenant_id,
                server.context?.tenantId,
                server.profile?.tenant_id,
                server.profile?.tenantId,
                server.user_id,
                server.userId
            );
        }
    } catch (error) {}

    try {
        const user =
            typeof getLoginUser === "function"
                ? getLoginUser()
                : typeof ambilSession === "function"
                    ? ambilSession()
                    : null;

        if (user) {
            candidates.push(
                user.tenant_id,
                user.tenantId,
                user.profile?.tenant_id,
                user.profile?.tenantId,
                user.user_id,
                user.userId,
                user.id
            );
        }
    } catch (error) {}

    for (const value of candidates) {
        const key = String(value ?? "").trim();
        if (key) {
            return key;
        }
    }

    // Tidak membuat cache global bila tenant tidak dapat dikenali.
    return "";
}

function fmcInputFlokCacheSafePart_(value) {
    return encodeURIComponent(String(value ?? "").trim());
}

function fmcInputFlokCacheKey_(tenantKey, periodId) {
    return (
        FMC_INPUTFLOK_FAST_CACHE_PREFIX +
        fmcInputFlokCacheSafePart_(tenantKey) +
        "_" +
        fmcInputFlokCacheSafePart_(periodId)
    );
}

function fmcInputFlokLastPeriodKey_(tenantKey) {
    return (
        FMC_INPUTFLOK_FAST_LAST_PERIOD_PREFIX +
        fmcInputFlokCacheSafePart_(tenantKey)
    );
}

function fmcInputFlokWriteFastCache_(periodId) {
    if (!FMC_INPUTFLOK_BROWSER) {
        return;
    }

    const tenantKey = fmcInputFlokGetTenantKey_();
    const period = String(periodId ?? "").trim();

    if (!tenantKey || !period) {
        return;
    }

    try {
        let previous = null;

        try {
            const oldRaw = localStorage.getItem(
                fmcInputFlokCacheKey_(tenantKey, period)
            );
            previous = oldRaw ? JSON.parse(oldRaw) : null;
        } catch (error) {
            previous = null;
        }

        const payload = {
            version: FMC_INPUTFLOK_FAST_CACHE_VERSION,
            tenant_id: tenantKey,
            period_id: period,
            period_no: String(
                window.fmcInputFlokActivePeriodNo ||
                previous?.period_no ||
                ""
            ).trim(),
            saved_at: Date.now(),
            active_floks: getInputFlokDaftarAktif_(),
            docin: window.fmcInputFlokDocIn || previous?.docin || null,
            floks: previous?.floks && typeof previous.floks === "object"
                ? previous.floks
                : {}
        };

        const active = getInputFlokDaftarAktif_();

        active.forEach(flok => {
            const current = window.fmcInputFlokHasilServer?.[flok];

            // Hanya overwrite cache FLOK bila state server saat ini benar-benar
            // berupa array. Ini mencegah cache FLOK lain terhapus saat user
            // hanya membuka satu FLOK.
            if (Array.isArray(current)) {
                payload.floks[flok] = {
                    items: current
                };
            } else if (!payload.floks[flok]) {
                payload.floks[flok] = { items: [] };
            }
        });

        localStorage.setItem(
            fmcInputFlokCacheKey_(tenantKey, period),
            JSON.stringify(payload)
        );

        localStorage.setItem(
            fmcInputFlokLastPeriodKey_(tenantKey),
            period
        );
    } catch (error) {
        // Cache adalah optimasi saja; kegagalannya tidak boleh mengganggu PWA.
        console.warn("INPUT FLOK CACHE: gagal menyimpan cache.", error);
    }
}

function fmcInputFlokHydrateFastCache_() {
    if (!FMC_INPUTFLOK_BROWSER) {
        return null;
    }

    const tenantKey = fmcInputFlokGetTenantKey_();
    if (!tenantKey) {
        return null;
    }

    try {
        const lastPeriod = String(
            localStorage.getItem(
                fmcInputFlokLastPeriodKey_(tenantKey)
            ) || ""
        ).trim();

        if (!lastPeriod) {
            return null;
        }

        const raw = localStorage.getItem(
            fmcInputFlokCacheKey_(tenantKey, lastPeriod)
        );

        if (!raw) {
            return null;
        }

        const cache = JSON.parse(raw);

        if (
            !cache ||
            cache.version !== FMC_INPUTFLOK_FAST_CACHE_VERSION ||
            String(cache.tenant_id || "") !== tenantKey ||
            String(cache.period_id || "") !== lastPeriod
        ) {
            return null;
        }

        const activeFloks = Array.isArray(cache.active_floks)
            ? cache.active_floks
                .map(x => String(x || "").trim().toUpperCase())
                .filter(x => ["A", "B", "C", "D", "E", "F"].includes(x))
            : [];

        if (activeFloks.length) {
            window.fmcInputFlokActiveList = activeFloks;
        }

        window.fmcInputFlokActivePeriodId = lastPeriod;
        window.fmcInputFlokActivePeriodNo =
            String(cache.period_no || "").trim();

        if (
            cache.docin &&
            typeof cache.docin === "object"
        ) {
            window.fmcInputFlokDocIn = cache.docin;
        }

        if (!window.fmcInputFlokDataSesi) {
            window.fmcInputFlokDataSesi = {};
        }

        if (!window.fmcInputFlokHasilServer) {
            window.fmcInputFlokHasilServer = {};
        }

        if (!window.fmcInputFlokServerLoaded) {
            window.fmcInputFlokServerLoaded = {};
        }

        activeFloks.forEach(flok => {
            const cachedItems = Array.isArray(cache.floks?.[flok]?.items)
                ? cache.floks[flok].items
                : [];

            window.fmcInputFlokHasilServer[flok] = cachedItems;

            window.fmcInputFlokDataSesi[flok] = cachedItems
                .filter(item => Number.isFinite(Number(item?.umur)))
                .map(item => ({
                    flok: flok,
                    umur: Number(item.umur),
                    tanggal: item.tanggal || "",
                    mati: Number(item.mati) || 0,
                    afkir: Number(item.afkir) || 0,
                    bbAvg: Number(item.bbAvg) || 0,
                    konsumsiPakan: Number(item.konsumsiPakan) || 0,
                    jenisPakan: item.jenisPakan || "",
                    __cache: true
                }));

            // Sangat penting: cache TIDAK dianggap sudah diverifikasi server.
            window.fmcInputFlokServerLoaded[flok] = false;
        });

        window.fmcInputFlokFastCacheHydrated = true;
        window.fmcInputFlokFastCachePeriodId = lastPeriod;

        return cache;
    } catch (error) {
        console.warn("INPUT FLOK CACHE: cache tidak dapat dibaca.", error);
        return null;
    }
}

function fmcInputFlokRenderCurrent_() {
    const flok = getInputFlokAktif();
    const rekap = document.getElementById("inputFlokRekap");

    if (rekap && flok) {
        rekap.innerHTML = renderRekapInputFlok(flok);
    }

    const umurEl = document.getElementById("inputFlokUmur");
    const umurBerikutnya = tentukanUmurBerikutnyaInputFlok(flok);

    if (umurEl) {
        umurEl.value = String(umurBerikutnya);
    }

    if (flok) {
        tampilkanTanggalInputFlok(flok, umurBerikutnya);
    }
}

function getInputFlokDaftarAktif_() {

    if (!FMC_INPUTFLOK_BROWSER) {
        return [];
    }

    const list = Array.isArray(window.fmcInputFlokActiveList)
        ? window.fmcInputFlokActiveList : [];

    return list
        .map(x => String(x?.id || x?.name || x || "")
            .trim().toUpperCase().replace(/^FLOK\s+/, ""))
        .filter((x,i,a) =>
            ["A","B","C","D","E","F"].includes(x) &&
            a.indexOf(x) === i
        );
}

async function resolveInputFlokDaftarAktif_() {

    /*
     * ==========================================================
     * FMC D2 — TENANT FLOK SOURCE OF TRUTH
     * ==========================================================
     *
     * Urutan sumber:
     * 1. Config server yang sudah diterima PWA.
     * 2. Konfigurasi user/session.
     * 3. Config DOC IN bila tersedia.
     * 4. flok_count sebagai fallback.
     *
     * Tidak pernah menganggap A-F sebagai jumlah default.
     * A-F hanya daftar maksimum yang diizinkan FMC (1..6).
     */

    let candidates = [];

    // ----------------------------------------------------------
    // 1. SERVER DATA
    // ----------------------------------------------------------
    try {

        const server =
            (typeof window !== "undefined" && window.serverData)
                ? window.serverData
                : null;

        if (server) {

            if (server.config) {
                candidates.push(server.config);
            }

            if (server.dashboard?.config) {
                candidates.push(server.dashboard.config);
            }

            if (server.profile?.config) {
                candidates.push(server.profile.config);
            }

            // Normalisasi dashboard.flok -> config.floks.
            if (Array.isArray(server.dashboard?.flok)) {
                candidates.push({
                    floks: server.dashboard.flok,
                    flok_count: server.dashboard.flok.length
                });
            }

            // Beberapa bridge D2 menyimpan konfigurasi di context.
            if (server.context?.config) {
                candidates.push(server.context.config);
            }

            if (Array.isArray(server.context?.floks)) {
                candidates.push({
                    floks: server.context.floks,
                    flok_count: server.context.flok_count
                });
            }
        }

    } catch (error) {

        console.warn(
            "INPUT FLOK: gagal membaca serverData.",
            error
        );

    }


    // ----------------------------------------------------------
    // 2. SESSION / LOGIN USER
    // ----------------------------------------------------------
    try {

        const user =
            typeof getLoginUser === "function"
                ? getLoginUser()
                : typeof ambilSession === "function"
                    ? ambilSession()
                    : null;

        if (user) {

            if (user.config) {
                candidates.push(user.config);
            }

            candidates.push(user);

            if (Array.isArray(user.floks)) {
                candidates.push({
                    floks: user.floks,
                    flok_count: user.flok_count
                });
            }

        }

    } catch (error) {

        console.warn(
            "INPUT FLOK: gagal membaca session login.",
            error
        );

    }


    // ----------------------------------------------------------
    // 3. DOC IN CONFIG — KOMPATIBILITAS
    // ----------------------------------------------------------
    try {

        if (
            typeof fmcDocInGetFlokConfig_ === "function"
        ) {

            const docInFloks =
                await fmcDocInGetFlokConfig_();

            if (
                Array.isArray(docInFloks) &&
                docInFloks.length
            ) {

                candidates.unshift({
                    floks: docInFloks,
                    flok_count: docInFloks.length
                });

            }

        }

    } catch (error) {

        console.warn(
            "INPUT FLOK: config DOC IN tidak tersedia.",
            error
        );

    }


    // ----------------------------------------------------------
    // RESOLVE DAFTAR FLOK
    // ----------------------------------------------------------

    const allowedLetters = [
        "A", "B", "C", "D", "E", "F"
    ];

    let configuredFloks = [];
    let configuredCount = 0;


    // Daftar FLOK eksplisit lebih kuat daripada count.
    for (const source of candidates) {

        if (
            source &&
            Array.isArray(source.floks) &&
            source.floks.length
        ) {

            configuredFloks =
                source.floks;

            break;

        }

    }


    // Ambil flok_count dari sumber tenant.
    for (const source of candidates) {

        if (!source) {
            continue;
        }

        const count =
            Number(
                source.flok_count ??
                source.flokCount ??
                source.cage ??
                source.cage_count ??
                0
            );

        if (
            Number.isInteger(count) &&
            count >= 1
        ) {

            configuredCount =
                Math.min(
                    count,
                    allowedLetters.length
                );

            break;

        }

    }


    const normalized = [];

    if (configuredFloks.length) {

        configuredFloks.forEach(item => {

            const id =
                String(
                    item?.id ??
                    item?.flok_id ??
                    item?.flok ??
                    item?.name ??
                    item ??
                    ""
                )
                .trim()
                .toUpperCase()
                .replace(/^FLOK\s+/, "");

            if (
                !allowedLetters.includes(id)
            ) {
                return;
            }

            if (
                item &&
                typeof item === "object" &&
                item.active === false
            ) {
                return;
            }

            if (
                !normalized.includes(id)
            ) {
                normalized.push(id);
            }

        });

    }


    /*
     * Jika tenant punya flok_count tetapi daftar eksplisit
     * belum tersedia, bentuk A.. sesuai count tenant.
     *
     * Contoh:
     * 1 -> A
     * 2 -> A B
     * 3 -> A B C
     * ...
     * 6 -> A B C D E F
     */
    if (
        !normalized.length &&
        configuredCount > 0
    ) {

        normalized.push(
            ...allowedLetters.slice(
                0,
                configuredCount
            )
        );

    }


    /*
     * Jika ada daftar eksplisit sekaligus flok_count,
     * count tenant menjadi batas maksimum yang boleh tampil.
     */
    const finalList =
        configuredCount > 0
            ? normalized.slice(0, configuredCount)
            : normalized.slice(0, allowedLetters.length);


    if (!finalList.length) {

        throw new Error(
            "Konfigurasi FLOK tenant belum tersedia."
        );

    }


    // ----------------------------------------------------------
    // SIMPAN STATE HANYA DI BROWSER
    // ----------------------------------------------------------

    if (FMC_INPUTFLOK_BROWSER) {

        window.fmcInputFlokActiveList =
            finalList;

        const oldSesi =
            window.fmcInputFlokDataSesi || {};

        const oldServer =
            window.fmcInputFlokHasilServer || {};

        const oldLoaded =
            window.fmcInputFlokServerLoaded || {};

        window.fmcInputFlokDataSesi = {};
        window.fmcInputFlokHasilServer = {};
        window.fmcInputFlokServerLoaded = {};

        finalList.forEach(f => {

            window.fmcInputFlokDataSesi[f] =
                Array.isArray(oldSesi[f])
                    ? oldSesi[f]
                    : [];

            window.fmcInputFlokHasilServer[f] =
                Array.isArray(oldServer[f])
                    ? oldServer[f]
                    : [];

            window.fmcInputFlokServerLoaded[f] =
                oldLoaded[f] === true;

        });

    }


    return finalList;

}

// ==========================================================
// FLOK AKTIF
// ==========================================================

function getInputFlokAktif() {

    if (!FMC_INPUTFLOK_BROWSER) {
        return "";
    }

    const flok =
        String(window.fmcFlokAktif || "").trim().toUpperCase();

    const daftar =
        getInputFlokDaftarAktif_();

    return daftar.includes(flok)
        ? flok
        : (daftar[0] || "");
}


// ==========================================================
// D2 ACTIVE PERIOD — SERVER SOURCE OF TRUTH
// ==========================================================
// Input FLOK wajib membaca periode aktif dari server.
// LocalStorage/session hanya cache; tidak boleh menentukan
// periode yang dipakai untuk GET/SAVE data FLOK.
//
// Ini penting terutama untuk tenant yang mempunyai banyak
// FLOK dan/atau Active Period seperti period 10.
// ==========================================================

async function resolveInputFlokActivePeriod_() {

    if (!FMC_INPUTFLOK_BROWSER) {
        throw new Error(
            "Active Period hanya dapat dibaca dari environment PWA."
        );
    }

    let result = null;

    try {

        if (typeof d2GetPeriods === "function") {

            result =
                await d2GetPeriods({});

        } else {

            result =
                await apiPost(
                    "getPeriods",
                    {}
                );

        }

    } catch (error) {

        throw new Error(
            "Gagal membaca Active Period dari server: " +
            (error?.message || error)
        );

    }

    if (!result || result.success !== true) {

        throw new Error(
            result?.message ||
            "Active Period dari server tidak tersedia."
        );

    }

    const periodId =
        String(
            result.active_period_id ??
            result.activePeriodId ??
            result.data?.active_period_id ??
            result.data?.activePeriodId ??
            ""
        ).trim();

    const periodNo =
        String(
            result.active_period_no ??
            result.activePeriodNo ??
            result.data?.active_period_no ??
            result.data?.activePeriodNo ??
            ""
        ).trim();

    if (!periodId) {

        throw new Error(
            "Server tidak mengembalikan active_period_id. " +
            "Input FLOK dibatalkan agar tidak salah periode."
        );

    }

    window.fmcInputFlokActivePeriodId =
        periodId;

    window.fmcInputFlokActivePeriodNo =
        periodNo;

    try {

        localStorage.setItem(
            "fmcD2ActivePeriodId",
            periodId
        );

    } catch (error) {
        // Cache gagal tidak boleh menggagalkan request server.
    }

    console.log(
        "INPUT FLOK ACTIVE PERIOD:",
        {
            period_id: periodId,
            period_no: periodNo
        }
    );

    return periodId;
}


// ==========================================================
// VALIDASI PERIOD RESPONSE
// ==========================================================

function assertInputFlokPeriod_(
    result,
    expectedPeriodId,
    action
) {

    const returned =
        String(
            result?.period_id ??
            result?.periodId ??
            result?.active_period_id ??
            result?.activePeriodId ??
            result?.data?.period_id ??
            result?.data?.periodId ??
            ""
        ).trim();

    if (
        returned &&
        returned !== String(expectedPeriodId).trim()
    ) {

        throw new Error(
            "Period mismatch pada " +
            action +
            ". Diminta " +
            expectedPeriodId +
            ", server mengembalikan " +
            returned +
            "."
        );

    }

}


// ==========================================================
// TAMPIL INPUT FLOK
// ==========================================================

async function tampilInputFlok() {

    const page =
        document.getElementById("inputFlokPage");

    if (!page) {
        console.warn(
            "INPUT FLOK: #inputFlokPage tidak ditemukan."
        );
        return;
    }

    // ======================================================
    // FAST PATH
    // ======================================================
    // Pulihkan cache terlebih dahulu agar halaman bisa tampil
    // tanpa menunggu round-trip GAS. Cache bukan source of truth.
    // ======================================================

    const cached =
        fmcInputFlokHydrateFastCache_();

    let daftarFlok =
        getInputFlokDaftarAktif_();

    // Jika belum ada cache/config lokal, baru tunggu konfigurasi server.
    if (!daftarFlok.length) {
        try {
            daftarFlok =
                await resolveInputFlokDaftarAktif_();
        } catch (error) {
            console.warn(
                "INPUT FLOK: konfigurasi FLOK belum tersedia.",
                error
            );
            return;
        }
    }

    if (!daftarFlok.length) {
        return;
    }

    if (!daftarFlok.includes(
        String(window.fmcFlokAktif || "")
            .trim()
            .toUpperCase()
    )) {
        window.fmcFlokAktif = daftarFlok[0];
    }

    const flokAktif =
        getInputFlokAktif();

    window.fmcFlokAktif = flokAktif;

    // ======================================================
    // RENDER HALAMAN SEGERA
    // ======================================================

    page.innerHTML = `

        <div class="card flokInputCard">

            <div class="flokInputHeader">
                <div>
                    <div class="flokHeaderSmall">
                        FMC BROILER MOBILE V11
                    </div>
                    <h2>
                        <span class="material-symbols-rounded">edit_note</span>
                        FLOK ${flokAktif}
                    </h2>
                    <p>
                        Input Data Produksi FLOK
                    </p>
                </div>

                <div class="flokStatusBadge">
                    <span class="material-symbols-rounded">HOME</span>
                    FLOK ${flokAktif}
                </div>
            </div>

            <div class="flokSelector">
                ${getInputFlokDaftarAktif_().map(f => `
                    <button
                        type="button"
                        class="flokSelectorBtn ${flokAktif === f ? "active" : ""}"
                        onclick="pilihInputFlok('${f}')">
                        FLOK ${f}
                    </button>
                `).join("")}
            </div>

            <div class="flokInputSection">
                <h3>
                    <span class="material-symbols-rounded">edit_note</span>
                    Data Produksi
                </h3>

                <label for="inputFlokUmur">Umur</label>
                <select
                    id="inputFlokUmur"
                    onchange="ubahUmurInputFlok(this.value)">
                    ${buatPilihanUmurInputFlok(flokAktif)}
                </select>

                <label for="inputFlokTanggal">Tanggal</label>
                <div class="flokTanggalWrap">
                    <span class="material-symbols-rounded">calendar_month</span>
                    <input
                        type="text"
                        id="inputFlokTanggal"
                        value="—"
                        readonly
                        tabindex="-1"
                        aria-readonly="true">
                    <span class="flokReadonlyIcon">lock</span>
                </div>
                <small class="flokAutoInfo">
                    Otomatis mengikuti tanggal DOC IN dan umur
                </small>

                <div
                    id="inputFlokUrutanMessage"
                    class="flokUrutanMessage"
                    style="display:none;">
                </div>

                <label for="inputFlokMati">Mati</label>
                <input
                    type="number"
                    id="inputFlokMati"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Jumlah ayam mati"
                    autocomplete="off">

                <label for="inputFlokAfkir">Afkir</label>
                <input
                    type="number"
                    id="inputFlokAfkir"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Jumlah ayam afkir"
                    autocomplete="off">

                <label for="inputFlokBBAvg">BB Avg</label>
                <input
                    type="number"
                    id="inputFlokBBAvg"
                    min="0"
                    step="0.001"
                    inputmode="decimal"
                    placeholder="Berat badan rata-rata"
                    autocomplete="off">

                <label for="inputFlokKonsumsi">Konsumsi Pakan</label>
                <input
                    type="number"
                    id="inputFlokKonsumsi"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="Jumlah konsumsi pakan"
                    autocomplete="off">

                <label for="inputFlokJenisPakan">Jenis Pakan</label>
                <select
                    id="inputFlokJenisPakan"
                    onchange="ubahHargaInputFlok(this.value)">
                    <option value="">Pilih jenis pakan</option>
                    <option value="BR1">BR1</option>
                    <option value="BR2">BR2</option>
                    <option value="BR3">BR3</option>
                </select>

                <label for="inputFlokHarga">Harga / Kg</label>
                <input
                    type="text"
                    id="inputFlokHarga"
                    value="—"
                    readonly
                    tabindex="-1"
                    aria-readonly="true"
                    placeholder="Otomatis dari MASTER PAKAN">

                <div
                    id="inputFlokMessage"
                    class="flokMessage"
                    style="display:none;">
                </div>

                <button
                    type="button"
                    id="btnTambahDataInputFlok"
                    class="flokSaveBtn"
                    onclick="tambahDataInputFlokUI()">
                    <span class="material-symbols-rounded">add</span>
                    TAMBAH DATA
                </button>
            </div>

            <div
                id="inputFlokRekap"
                class="flokRekapCard">
                ${renderRekapInputFlok(flokAktif)}
            </div>

            <button
                type="button"
                id="btnSimpanInputFlok"
                class="flokSaveBtn"
                onclick="simpanInputFlokKeGAS()">
                <span class="material-symbols-rounded">save</span>
                SIMPAN DATA FLOK
            </button>

        </div>
    `;

    // Cache sudah ada -> render benar-benar langsung.
    if (cached) {
        fmcInputFlokRenderCurrent_();
    }

    // ======================================================
    // BACKGROUND SYNC
    // ======================================================
    // Tidak menahan first paint. Server tetap menjadi source of truth.
    // ======================================================

    Promise.resolve().then(async () => {
        try {
            // Setelah first paint, validasi ulang konfigurasi tenant dari server.
            // Ini menjaga agar cache lama tidak pernah menjadi source of truth.
            const serverFloks =
                await resolveInputFlokDaftarAktif_();

            let syncFlok = flokAktif;

            if (!serverFloks.includes(syncFlok)) {
                syncFlok = serverFloks[0] || flokAktif;
                window.fmcFlokAktif = syncFlok;
            }

            await muatDOCInputFlok();
            await muatInputFlokDariGAS(syncFlok);

            // Setelah server sukses, render ulang dengan data terbaru.
            fmcInputFlokRenderCurrent_();
        } catch (error) {
            console.warn(
                "INPUT FLOK: background sync gagal.",
                error
            );
        }
    });

    // Set umur awal segera, lalu DOC IN akan diperbarui saat sync selesai.
    const umurEl =
        document.getElementById("inputFlokUmur");

    if (umurEl) {
        ubahUmurInputFlok(umurEl.value);
    }
}


// ==========================================================
// PILIH FLOK
// ==========================================================

function pilihInputFlok(
    flok
) {

    if (
        !["A", "B", "C", "D", "E", "F"].includes(
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
        let umur = 1;
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
// UMUR BERIKUTNYA — KONTRAK TUNGGAL
// ==========================================================
function tentukanUmurBerikutnyaInputFlokCanonical(flok) {

    const data =
        window.fmcInputFlokDataSesi?.[flok];

    if (!Array.isArray(data) || data.length === 0) {
        return 1;
    }

    const ages = data
        .map(item => Number(item?.umur))
        .filter(Number.isFinite)
        .filter(age => age >= 1);

    if (!ages.length) {
        return 1;
    }

    return Math.max(...ages) + 1;
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


    const umurBerikutnya =
        tentukanUmurBerikutnyaInputFlokCanonical(
            flok
        );


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

async function muatDOCInputFlok() {

    if (
        window.fmcInputFlokDocIn &&
        typeof window.fmcInputFlokDocIn === "object"
    ) {
        return window.fmcInputFlokDocIn;
    }

    const server =
        window.serverData;

    if (
        server &&
        server.docin &&
        typeof server.docin === "object"
    ) {

        window.fmcInputFlokDocIn =
            server.docin;

        return window.fmcInputFlokDocIn;
    }

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

    window.fmcInputFlokDocIn =
        result.data;

    // DOC IN ikut dicache agar tanggal bisa muncul pada fast open.
    try {
        const periodId =
            window.fmcInputFlokActivePeriodId ||
            window.fmcInputFlokFastCachePeriodId ||
            "";

        if (periodId) {
            fmcInputFlokWriteFastCache_(periodId);
        }
    } catch (error) {}

    return window.fmcInputFlokDocIn;

}


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

    // DOC IN per FLOK adalah dependency wajib.
    // Tanpa DOC IN, Input FLOK tidak boleh dilewati.
    if (!tanggalDOC) {
        tanggalEl.value = "—";

        const message =
            document.getElementById(
                "inputFlokUrutanMessage"
            );

        if (message) {
            message.style.display = "block";
            message.className =
                "flokUrutanMessage warning";
            message.textContent =
                `DOC IN FLOK ${flok} belum tersedia. ` +
                "Silakan isi DOC IN terlebih dahulu.";
        }

        const saveBtn =
            document.getElementById(
                "btnTambahDataInputFlok"
            );

        if (saveBtn) {
            saveBtn.disabled = true;
        }

        return;
    }


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
// Sumber tanggal tetap DOC IN Tenant. Tidak menggunakan tanggal perangkat.
// ==========================================================

function ambilTanggalDOCInputFlok(
    flok
) {

    /*
     * SUMBER RESMI D2:
     * period.doc_in.floks[]
     *
     * Setiap FLOK mempunyai DOC IN sendiri:
     * {
     *   id: "A",
     *   name: "FLOK A",
     *   populasi: ...,
     *   tanggal: "YYYY-MM-DD"
     * }
     *
     * Tidak menggunakan DOC IN global.
     * Tidak menggunakan tanggal perangkat.
     */

    const docIn =
        window.fmcInputFlokDocIn;

    if (!docIn || typeof docIn !== "object") {
        return null;
    }

    // Bentuk D2 utama: { floks: [...] }
    const floks =
        Array.isArray(docIn.floks)
            ? docIn.floks
            : Array.isArray(docIn.items)
                ? docIn.items
                : null;

    if (floks) {
        const item =
            floks.find(row =>
                String(
                    row?.id ??
                    row?.flok ??
                    row?.name ??
                    ""
                )
                    .trim()
                    .toUpperCase()
                    .replace(/^FLOK\s+/, "") === flok
            );

        if (item) {
            return (
                item.tanggal ||
                item.tanggalDOC ||
                item.chickIn ||
                null
            );
        }
    }

    // Kompatibilitas bila D2 mengembalikan map FLOK:
    // { A: { tanggal: ... }, B: {...} }
    const mapped = docIn[flok];

    if (mapped) {
        if (typeof mapped === "string") {
            return mapped;
        }

        if (typeof mapped === "object") {
            return (
                mapped.tanggal ||
                mapped.tanggalDOC ||
                mapped.chickIn ||
                null
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
// TAMBAH DATA hanya menyiapkan data di sesi PWA.
// Pengiriman ke GAS dilakukan oleh tombol
// SIMPAN DATA FLOK.

function tambahDataInputFlokUI() {

    return simpanInputFlokUI();

}


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


    const umurBerikutnya =
        tentukanUmurBerikutnyaInputFlokCanonical(
            flok
        );


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
        data.umur < 1
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

    return tentukanUmurBerikutnyaInputFlokCanonical(
        flok
    );

}


// ==========================================================
// RENDER REKAP
// ==========================================================

function ambilKPIInputFlok(
    flok
) {

    const hasil =
        window.fmcInputFlokHasilServer &&
        window.fmcInputFlokHasilServer[flok];

    if (
        !Array.isArray(hasil) ||
        !hasil.length
    ) {
        return {
            ayamHidup: "—",
            mortalitas: "—",
            bbAvg: "—",
            fcr: "—",
            ip: "—",
            tonase: "—"
        };
    }

    // Engine D2 V2 menyimpan populasi hidup pada field
    // "populasiHidup" di setiap baris calculated. Beberapa bridge
    // lama dapat memakai "live" / "ayamHidup", jadi semua alias
    // yang kompatibel tetap diterima di sini.
    const terakhir =
        hasil[hasil.length - 1] || {};

    const live =
        terakhir.live ??
        terakhir.ayamHidup ??
        terakhir.AyamHidup ??
        terakhir["Ayam Hidup"] ??
        terakhir.AYAM_HIDUP ??
        terakhir.populasiHidup ??
        terakhir["populasi_hidup"];

    return {
        ayamHidup:
            formatJumlahInputFlok_(live),

        mortalitas:
            formatPersenInputFlok_(terakhir.mortalitas),

        bbAvg:
            formatBBInputFlok(terakhir.bbAvg),

        fcr:
            formatFCRInputFlok_(terakhir.fcr),

        ip:
            formatIPInputFlok_(terakhir.ip),

        tonase:
            formatTonaseInputFlok_(terakhir.tonase)
    };
}


function renderRekapInputFlok(
    flok
) {

    const data =
        window.fmcInputFlokDataSesi[flok] || [];


    const kpi =
        ambilKPIInputFlok(
            flok
        );


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
                    kpi.ayamHidup
                )}

                ${buatKpiInputFlok(
                    "Mortalitas",
                    kpi.mortalitas
                )}

                ${buatKpiInputFlok(
                    "BB Avg",
                    kpi.bbAvg
                )}

                ${buatKpiInputFlok(
                    "FCR",
                    kpi.fcr
                )}

                ${buatKpiInputFlok(
                    "IP",
                    kpi.ip
                )}

                ${buatKpiInputFlok(
                    "Tonase",
                    kpi.tonase
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
                kpi.ayamHidup
            )}

            ${buatKpiInputFlok(
                "Mortalitas",
                kpi.mortalitas
            )}

            ${buatKpiInputFlok(
                "BB Avg",
                kpi.bbAvg
            )}

            ${buatKpiInputFlok(
                "FCR",
                kpi.fcr
            )}

            ${buatKpiInputFlok(
                "IP",
                kpi.ip
            )}

            ${buatKpiInputFlok(
                "Tonase",
                kpi.tonase
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
// FORMAT KPI PROFESIONAL FMC
// ==========================================================
// Nilai DB/Engine tidak diubah. Ini murni formatter tampilan PWA.

function fmcNumberOrNull_(nilai) {
    if (nilai === null || nilai === undefined || nilai === "") {
        return null;
    }

    const angka = Number(nilai);
    return Number.isFinite(angka) ? angka : null;
}

function formatJumlahInputFlok_(nilai) {
    const angka = fmcNumberOrNull_(nilai);

    if (angka === null) {
        return "—";
    }

    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0
    }).format(angka);
}

function formatPersenInputFlok_(nilai) {
    const angka = fmcNumberOrNull_(nilai);

    if (angka === null) {
        return "—";
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(angka * 100) + "%";
}

function formatFCRInputFlok_(nilai) {
    const angka = fmcNumberOrNull_(nilai);

    if (angka === null) {
        return "—";
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(angka);
}

function formatIPInputFlok_(nilai) {
    const angka = fmcNumberOrNull_(nilai);

    if (angka === null) {
        return "—";
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(angka);
}

function formatTonaseInputFlok_(nilai) {
    const angka = fmcNumberOrNull_(nilai);

    if (angka === null) {
        return "—";
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(angka);
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
// DIALOG HAPUS INPUT FLOK — FMC PROFESSIONAL
// ==========================================================
// Khusus konfirmasi hapus data Input FLOK.
// Tidak menggunakan confirm() bawaan browser.
// Tidak mengubah alur data, API, GAS, atau perhitungan Input FLOK.
// ==========================================================

function fmcConfirmHapusInputFlok_(
    flok,
    umur,
    onConfirm
) {

    const existing =
        document.getElementById(
            "fmcInputFlokDeleteDialog"
        );

    if (existing) {
        existing.remove();
    }

    const styleId =
        "fmcInputFlokDeleteDialogStyle";

    if (!document.getElementById(styleId)) {

        const style =
            document.createElement("style");

        style.id = styleId;

        style.textContent = `
            #fmcInputFlokDeleteDialog {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                box-sizing: border-box;
                background: rgba(0, 0, 0, .52);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                animation: fmcInputFlokDialogIn .18s ease-out;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-card {
                width: min(100%, 390px);
                box-sizing: border-box;
                background: #ffffff;
                color: #172033;
                border-radius: 26px;
                padding: 24px 22px 18px;
                box-shadow: 0 22px 60px rgba(0, 0, .28);
                transform-origin: center;
                animation: fmcInputFlokDialogCardIn .2s ease-out;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-icon {
                width: 54px;
                height: 54px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 17px;
                margin-bottom: 16px;
                background: #fff1f2;
                color: #dc2626;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-icon .material-symbols-rounded {
                font-size: 29px;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-title {
                margin: 0;
                font-size: 20px;
                line-height: 1.25;
                font-weight: 750;
                letter-spacing: -.2px;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-message {
                margin: 10px 0 0;
                font-size: 14px;
                line-height: 1.55;
                color: #667085;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-highlight {
                display: inline-flex;
                align-items: center;
                margin-top: 14px;
                padding: 8px 11px;
                border-radius: 10px;
                background: #f8fafc;
                color: #344054;
                font-size: 13px;
                font-weight: 700;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-actions {
                display: flex;
                gap: 10px;
                margin-top: 24px;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-btn {
                flex: 1;
                min-height: 48px;
                border: 0;
                border-radius: 14px;
                font: inherit;
                font-size: 14px;
                font-weight: 750;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
                transition: transform .12s ease, opacity .12s ease;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-btn:active {
                transform: scale(.98);
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-cancel {
                background: #f2f4f7;
                color: #344054;
            }

            #fmcInputFlokDeleteDialog .fmc-ifd-delete {
                background: #dc2626;
                color: #ffffff;
                box-shadow: 0 7px 18px rgba(220, 38, 38, .22);
            }

            @keyframes fmcInputFlokDialogIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes fmcInputFlokDialogCardIn {
                from {
                    opacity: 0;
                    transform: translateY(8px) scale(.97);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @media (prefers-color-scheme: dark) {
                #fmcInputFlokDeleteDialog .fmc-ifd-card {
                    background: #202124;
                    color: #f1f3f4;
                }

                #fmcInputFlokDeleteDialog .fmc-ifd-message {
                    color: #bdc1c6;
                }

                #fmcInputFlokDeleteDialog .fmc-ifd-highlight {
                    background: #2b2c2f;
                    color: #e8eaed;
                }

                #fmcInputFlokDeleteDialog .fmc-ifd-cancel {
                    background: #303134;
                    color: #e8eaed;
                }
            }
        `;

        document.head.appendChild(style);
    }

    const dialog =
        document.createElement("div");

    dialog.id =
        "fmcInputFlokDeleteDialog";

    dialog.setAttribute(
        "role",
        "dialog"
    );

    dialog.setAttribute(
        "aria-modal",
        "true"
    );

    dialog.setAttribute(
        "aria-labelledby",
        "fmcInputFlokDeleteTitle"
    );

    dialog.innerHTML = `
        <div class="fmc-ifd-card" role="document">

            <div class="fmc-ifd-icon" aria-hidden="true">
                <span class="material-symbols-rounded">
                    delete_forever
                </span>
            </div>

            <h2
                class="fmc-ifd-title"
                id="fmcInputFlokDeleteTitle"
            >
                Hapus Data FLOK?
            </h2>

            <p class="fmc-ifd-message">
                Data yang dipilih akan dihapus dari daftar Input FLOK.
                Tindakan ini tidak dapat dibatalkan.
            </p>

            <div class="fmc-ifd-highlight">
                <span
    style="
        font-size:32px;
        line-height:1;
        display:block;
    "
>🐓</span>
                FLOK ${String(flok)} &nbsp;•&nbsp; Hari ${String(umur)}
            </div>

            <div class="fmc-ifd-actions">

                <button
                    type="button"
                    class="fmc-ifd-btn fmc-ifd-cancel"
                    id="fmcInputFlokDeleteCancel"
                >
                    Batal
               </button>

                <button
                    type="button"
                    class="fmc-ifd-btn fmc-ifd-delete"
                    id="fmcInputFlokDeleteConfirm"
                >
                    Hapus
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const cancelBtn =
        document.getElementById(
            "fmcInputFlokDeleteCancel"
        );

    const confirmBtn =
        document.getElementById(
            "fmcInputFlokDeleteConfirm"
        );

    const close = function() {

        if (dialog.parentNode) {
            dialog.remove();
        }

        document.removeEventListener(
            "keydown",
            onKeyDown
        );
    };

    const onKeyDown = function(event) {

        if (event.key === "Escape") {
            close();
        }
    };

    if (cancelBtn) {
        cancelBtn.addEventListener(
            "click",
            close
        );
    }

    if (confirmBtn) {
        confirmBtn.addEventListener(
            "click",
            function() {

                close();

                if (typeof onConfirm === "function") {
                    onConfirm();
                }
            }
        );
    }

    dialog.addEventListener(
        "click",
        function(event) {
            if (event.target === dialog) {
                close();
            }
        }
    );

    document.addEventListener(
        "keydown",
        onKeyDown
    );

    if (confirmBtn) {
        confirmBtn.focus();
    }
}


// ==========================================================
// HAPUS DATA REKAP INPUT FLOK
// ==========================================================

function hapusDataInputFlok(
    flok,
    index
) {

    if (
        !["A", "B", "C", "D", "E", "F"].includes(
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


    fmcConfirmHapusInputFlok_(
        flok,
        item.umur,
        function() {

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
                    "btnTambahDataInputFlok"
                );


            if (saveBtn) {
                saveBtn.disabled = false;
            }

            if (typeof simpanInputFlokSessionLocal === "function") {
                simpanInputFlokSessionLocal();
            }


            tampilPesanInputFlok(
                `Data FLOK ${flok} Hari ${item.umur} berhasil dihapus.`,
                "success"
            );
        }
    );
}


// ==========================================================
// LOAD INPUT FLOK DARI GAS
// ==========================================================
//
// GAS mengembalikan data yang benar-benar terbaca dari Spreadsheet.
// PWA tidak menghitung ulang KPI dan tidak menulis field formula.
//

async function muatInputFlokDariGAS(
    flok = getInputFlokAktif()
) {

    if (!getInputFlokDaftarAktif_().includes(flok)) {
        throw new Error("FLOK tidak valid.");
    }

    const periodId =
        await resolveInputFlokActivePeriod_();

    const result =
        await apiPost(
            "getInputFlok",
            {
                period_id: periodId,
                flok: flok
            }
        );

    if (
        !result ||
        result.success !== true ||
        !result.data ||
        !Array.isArray(result.data.items)
    ) {
        throw new Error(
            result?.message ||
            "Data Input FLOK dari server tidak valid."
        );
    }

    assertInputFlokPeriod_(
        result,
        periodId,
        "getInputFlok"
    );

    const serverItems =
        result.data.items;

    window.fmcInputFlokHasilServer[flok] =
        serverItems;

    window.fmcInputFlokServerLoaded[flok] =
        true;

    window.fmcInputFlokDataSesi[flok] =
        serverItems
            .filter(item =>
                Number.isFinite(Number(item.umur))
            )
            .map(item => ({
                flok: flok,
                umur: Number(item.umur),
                tanggal: item.tanggal || "",
                mati: Number(item.mati) || 0,
                afkir: Number(item.afkir) || 0,
                bbAvg: Number(item.bbAvg) || 0,
                konsumsiPakan: Number(item.konsumsiPakan) || 0,
                jenisPakan: item.jenisPakan || ""
            }));

    // Server sukses -> cache aman untuk pembukaan berikutnya.
    fmcInputFlokWriteFastCache_(periodId);

    return result;
}


// ==========================================================
// SIAPKAN DATA INPUT FLOK UNTUK GAS
// ==========================================================
//
// Fungsi ini dipanggil oleh tombol SIMPAN DATA FLOK.
// Alur: PWA -> GAS saveInputFlok -> Spreadsheet -> GAS getInputFlok -> PWA.
//

async function kirimInputFlokKeGAS(
    flok = getInputFlokAktif()
) {

    if (!getInputFlokDaftarAktif_().includes(flok)) {
        throw new Error('FLOK tidak valid.');
    }

    const periodId =
        await resolveInputFlokActivePeriod_();

    const data = window.fmcInputFlokDataSesi[flok] || [];

    // SNAPSHOT PENUH: kondisi tabel PWA saat tombol SIMPAN ditekan.
    // Jika baris dihapus dari PWA, baris tersebut tidak ikut dikirim;
    // server akan mengganti daily dengan snapshot ini.
    const items = data
        .map(item => ({
            flok: flok,
            umur: Number(item.umur),
            tanggal: item.tanggal || '',
            mati: Number(item.mati) || 0,
            afkir: Number(item.afkir) || 0,
            bbAvg: Number(item.bbAvg) || 0,
            konsumsiPakan: Number(item.konsumsiPakan) || 0,
            jenisPakan: String(item.jenisPakan || '').trim().toUpperCase()
        }))
        .filter(item => Number.isInteger(item.umur) && item.umur >= 1 && item.umur <= 45);

    const saveResult = await apiPost(
        'saveInputFlok',
        {
            period_id: periodId,
            flok: flok,
            items: JSON.stringify(items),
            sync_mode: 'REPLACE_SNAPSHOT'
        }
    );

    if (!saveResult || saveResult.success !== true) {
        throw new Error(
            saveResult?.message ||
            'Data Input FLOK gagal disimpan.'
        );
    }

    assertInputFlokPeriod_(
        saveResult,
        periodId,
        "saveInputFlok"
    );

    const getResult = await apiPost(
        'getInputFlok',
        {
            period_id: periodId,
            flok: flok
        }
    );

    if (
        !getResult ||
        getResult.success !== true ||
        !getResult.data ||
        !Array.isArray(getResult.data.raw || getResult.data.items)
    ) {
        throw new Error(
            getResult?.message ||
            'Hasil Input FLOK dari server tidak valid.'
        );
    }

    assertInputFlokPeriod_(
        getResult,
        periodId,
        "getInputFlok setelah save"
    );

    // D2 API dapat mengembalikan dua bentuk data:
    // - raw       = input user / sumber sesi
    // - items     = hasil calculated dari Calculation Engine
    // KPI wajib memakai calculated, sedangkan tabel input memakai raw.
    const rawItems = Array.isArray(getResult.data.raw)
        ? getResult.data.raw
        : (Array.isArray(getResult.data.items) ? getResult.data.items : []);

    const calculatedItems = Array.isArray(getResult.data.items)
        ? getResult.data.items
        : rawItems;

    window.fmcInputFlokHasilServer[flok] = calculatedItems;

    window.fmcInputFlokDataSesi[flok] = rawItems.map(item => ({
        flok: flok,
        umur: Number(item.umur),
        tanggal: item.tanggal || '',
        mati: Number(item.mati) || 0,
        afkir: Number(item.afkir) || 0,
        bbAvg: Number(item.bbAvg) || 0,
        konsumsiPakan: Number(item.konsumsiPakan) || 0,
        jenisPakan: item.jenisPakan || '',
        __server: true
    }));

    fmcInputFlokWriteFastCache_(periodId);

    return getResult;
}


// ==========================================================
// FMC INPUT FLOK — SAVE LOADING UI
// HANYA TAMPILAN — TIDAK MENGUBAH ALUR SAVE
// ==========================================================

function fmcShowInputFlokSaving_() {
    if (document.getElementById("fmcInputFlokSaving")) {
        return;
    }

    if (!document.getElementById("fmcInputFlokSavingStyle")) {
        const style = document.createElement("style");
        style.id = "fmcInputFlokSavingStyle";
        style.textContent = `
            @keyframes fmcInputFlokSavingFadeIn {
                from { opacity: 0; transform: scale(.96); }
                to { opacity: 1; transform: scale(1); }
            }

            @keyframes fmcInputFlokSavingSpinner {
                to { transform: rotate(360deg); }
            }

            #fmcInputFlokSaving {
                position: fixed;
                inset: 0;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                box-sizing: border-box;
                background: rgba(0,0,0,.34);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }

            #fmcInputFlokSaving .fmc-ifsl-card {
                width: min(250px, calc(100vw - 48px));
                box-sizing: border-box;
                padding: 28px 24px 24px;
                border-radius: 28px;
                background: rgba(30,30,32,.96);
                color: #fff;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,.35);
                animation: fmcInputFlokSavingFadeIn .18s ease-out;
            }

            #fmcInputFlokSaving .fmc-ifsl-spinner {
                width: 42px;
                height: 42px;
                margin: 0 auto 18px;
                border: 4px solid rgba(255,255,255,.22);
                border-top-color: #fff;
                border-radius: 50%;
                animation: fmcInputFlokSavingSpinner .78s linear infinite;
            }

            #fmcInputFlokSaving .fmc-ifsl-title {
                font-size: 18px;
                line-height: 1.3;
                font-weight: 750;
                letter-spacing: -.2px;
            }

            #fmcInputFlokSaving .fmc-ifsl-text {
                margin-top: 7px;
                font-size: 13px;
                line-height: 1.45;
                color: rgba(255,255,255,.68);
            }
        `;
        document.head.appendChild(style);
    }

    const overlay = document.createElement("div");
    overlay.id = "fmcInputFlokSaving";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `
        <div class="fmc-ifsl-card">
            <div class="fmc-ifsl-spinner" aria-hidden="true"></div>
            <div class="fmc-ifsl-title">Menyimpan Data</div>
            <div class="fmc-ifsl-text">Mohon tunggu sebentar...</div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function fmcHideInputFlokSaving_() {
    const overlay = document.getElementById("fmcInputFlokSaving");
    if (overlay) {
        overlay.remove();
    }
}


async function simpanInputFlokKeGAS() {

    const flok = getInputFlokAktif();
    const saveBtn = document.getElementById("btnSimpanInputFlok");
    const data = window.fmcInputFlokDataSesi[flok] || [];

    if (!window.fmcInputFlokServerLoaded[flok]) {
        tampilToastServerInputFlok(
            "📢 Data server belum berhasil dimuat. SAVE dibatalkan.",
            "error"
        );
        return;
    }

    fmcShowInputFlokSaving_();

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `
            <span class="material-symbols-rounded">sync</span>
            MENYIMPAN...
        `;
    }

    try {
        const result = await kirimInputFlokKeGAS(flok);

        if (!result || result.success !== true) {
            throw new Error(
                result?.message ||
                "Data Input FLOK gagal disimpan."
            );
        }

        const expected = data
            .map(item => Number(item.umur))
            .filter(Number.isFinite)
            .sort((a, b) => a - b);

        const actual = (window.fmcInputFlokHasilServer[flok] || [])
            .map(item => Number(item.umur))
            .filter(Number.isFinite)
            .sort((a, b) => a - b);

        const verified =
            expected.length === actual.length &&
            expected.every((umur, index) => umur === actual[index]);

        if (!verified) {
            throw new Error(
                "Server belum cocok dengan snapshot Input FLOK yang disimpan."
            );
        }

        const rekap = document.getElementById("inputFlokRekap");
        if (rekap) rekap.innerHTML = renderRekapInputFlok(flok);

        const umurEl = document.getElementById("inputFlokUmur");
        const umurBerikutnya = tentukanUmurBerikutnyaInputFlok(flok);
        if (umurEl) umurEl.value = String(umurBerikutnya);
        tampilkanTanggalInputFlok(flok, umurBerikutnya);

        tampilToastServerInputFlok(
            "📢 Data telah tersimpan di server",
            "success"
        );

        tampilPesanInputFlok(
            result.message ||
            "Data Input FLOK berhasil disimpan.",
            "success"
        );

    } catch (error) {
        console.error("INPUT FLOK SAVE ERROR:", error);

        tampilToastServerInputFlok(
            "📢 Data belum berhasil tersimpan di server",
            "error"
        );

        tampilPesanInputFlok(
            error?.message ||
            "Data Input FLOK gagal disimpan.",
            "error"
        );

    } finally {
        fmcHideInputFlokSaving_();

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `
                <span class="material-symbols-rounded">save</span>
                SIMPAN DATA FLOK
            `;
        }
    }
}


// ==========================================================
// NOTIFICATION BAR SERVER
// ==========================================================
// Notifikasi hasil SAVE berada pada floating notification bar,
// bukan di dalam area TAMBAH DATA/form.

function tampilToastServerInputFlok(
    pesan,
    tipe = "success"
) {

    let toast =
        document.getElementById(
            "inputFlokServerToast"
        );

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "inputFlokServerToast";
        toast.style.position = "fixed";
        toast.style.left = "50%";
        toast.style.top = "72px";
        toast.style.transform = "translateX(-50%) translateY(-8px)";
        toast.style.zIndex = "99999";
        toast.style.maxWidth = "calc(100vw - 32px)";
        toast.style.padding = "11px 16px";
        toast.style.borderRadius = "14px";
        toast.style.background = "#173126";
        toast.style.color = "#ffffff";
        toast.style.fontSize = "14px";
        toast.style.fontWeight = "700";
        toast.style.textAlign = "center";
        toast.style.boxShadow = "0 8px 30px rgba(0,0,0,.22)";
        toast.style.opacity = "0";
        toast.style.transition = "opacity .2s ease, transform .2s ease";
        toast.style.pointerEvents = "none";
        document.body.appendChild(toast);
    }

    toast.className = "inputFlokServerToast " + String(tipe || "success");
    toast.textContent = pesan;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(window.__fmcInputFlokToastTimer);
    window.__fmcInputFlokToastTimer = setTimeout(function() {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-8px)";
    }, 3500);
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
        !["A", "B", "C", "D", "E", "F"].includes(
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