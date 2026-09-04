// ==========================================================
// FMC BROILER MOBILE
// API.JS
// D2 BRIDGE V1
// ==========================================================
//
// ARSITEKTUR:
//
// AUTH
//   login
//   register
//   sendOTP
//   verifyOTP
//   sendResetOTP
//   verifyResetOTP
//   resetPIN
//        ↓
//      GAS 1
//
// DATA / OPERATIONAL
//   dashboard
//   harian
//   flok
//   keuangan
//   RHPP
//   DOC IN
//   Pakan
//   Operasional
//   Master Kontrak
//   OVK
//   Plan Panen
//   Timbang Panen
//   Realisasi Panen
//        ↓
//      GAS 2
//
// ==========================================================


// ==========================================================
// GAS 1
// AUTHENTICATION
// ==========================================================

const API_BASE =
"https://script.google.com/macros/s/AKfycbzQV6bliXd_BlxOJgtXdacoHhtdbgWfHUV-vhW3DZSyaTWBSTdNuum5UG3YyWqGwUJh/exec";


// ==========================================================
// GAS 2
// D2 OPERATIONAL API
// ==========================================================

const D2_API_BASE =
"https://script.google.com/macros/s/AKfycbzoFAnJLwmB5_WumaaEakY1Ti9Dmu5q8q3y4yZZcwClNA-AP2YyyZqXSHVZUr_Vkthg/exec";


// ==========================================================
// LEGACY CONSTANT
//
// Dipertahankan supaya kode lama yang membaca
// API_DATA / API_TENANT tidak langsung error.
//
// Tetapi DATA runtime D2 tidak lagi memakai endpoint ini.
// ==========================================================

const API_DATA =
API_BASE + "?api=data";

const API_TENANT =
API_BASE + "?action=tenantData";


// ==========================================================
// AUTH ACTION
// ==========================================================

const FMC_AUTH_ACTIONS =
[
    "login",
    "register",
    "sendOTP",
    "verifyOTP",
    "sendResetOTP",
    "verifyResetOTP",
    "resetPIN",
    "validateSession",
    "logout"
];


// ==========================================================
// CACHE
// ==========================================================

let serverData = null;

let lastDataVersion =
localStorage.getItem(
    "FMC_DATA_VERSION"
) || "";


// ==========================================================
// AMBIL USER LOGIN
// ==========================================================

function fmcGetCurrentUser_(){

    try{

        const raw =
            localStorage.getItem(
                "FMC_USER"
            );

        if(!raw){

            return null;

        }

        const user =
            JSON.parse(raw);

        if(
            !user ||
            typeof user !== "object"
        ){

            return null;

        }

        return user;

    }
    catch(error){

        console.error(
            "FMC GET CURRENT USER ERROR:",
            error
        );

        return null;

    }

}


// ==========================================================
// NORMALISASI USER CONTEXT
// ==========================================================

function fmcGetUserContext_(){

    const user =
        fmcGetCurrentUser_();

    if(!user){

        return {

            user_id: "",
            tenant_id: "",
            email: ""

        };

    }


    return {

        user_id:
            String(
                user.user_id ||
                user.userid ||
                user.id ||
                ""
            ).trim(),

        tenant_id:
            String(
                user.tenant_id ||
                user.tenantId ||
                ""
            ).trim(),

        email:
            String(
                user.email ||
                ""
            )
            .trim()
            .toLowerCase()

    };

}


// ==========================================================
// CEK AUTH ACTION
// ==========================================================

function fmcIsAuthAction_(
    action
){

    return FMC_AUTH_ACTIONS
        .includes(
            String(
                action || ""
            ).trim()
        );

}


// ==========================================================
// BANGUN PAYLOAD D2
// ==========================================================
//
// Data user ditambahkan otomatis.
//
// Caller PWA tetap boleh mengirim field sendiri.
// Field caller tidak boleh menimpa identity utama.
// ==========================================================

function fmcBuildD2Payload_(
    action,
    data
){

    const context =
        fmcGetUserContext_();

    const payload = {

        action:
            String(
                action || ""
            ).trim(),

        user_id:
            context.user_id,

        tenant_id:
            context.tenant_id,

        email:
            context.email

    };


    Object.keys(
        data || {}
    ).forEach(
        function(key){

            if(
                key === "user_id" ||
                key === "tenant_id" ||
                key === "email"
            ){

                return;

            }

            payload[key] =
                data[key];

        }
    );


    return payload;

}


// ==========================================================
// GENERIC API POST
// ==========================================================
//
// AUTH:
// GAS 1
//
// D2:
// GAS 2
// ==========================================================

async function apiPost(
    action,
    data = {}
){

    const normalizedAction =
        String(
            action || ""
        ).trim();


    const isAuth =
        fmcIsAuthAction_(
            normalizedAction
        );


    const targetUrl =
        isAuth
            ? API_BASE
            : D2_API_BASE;


    try{

        const payload =
            isAuth

                ? {
                    action:
                        normalizedAction,
                    ...data
                }

                : fmcBuildD2Payload_(
                    normalizedAction,
                    data
                );


        console.log(
            "FMC API POST:",
            {
                action:
                    normalizedAction,

                target:
                    isAuth
                        ? "GAS 1"
                        : "GAS 2",

                user_id:
                    payload.user_id ||
                    "",

                tenant_id:
                    payload.tenant_id ||
                    "",

                email:
                    payload.email ||
                    ""
            }
        );


        const response =
            await fetch(
                targetUrl,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    },

                    body:
                        new URLSearchParams(
                            payload
                        )

                }
            );


        if(
            !response.ok
        ){

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "FMC API POST RESULT:",
            result
        );


        return result;

    }
    catch(error){

        console.error(
            "API POST ERROR:",
            error
        );


        return {

            success:
                false,

            message:
                "Tidak dapat terhubung ke server.",

            error:
                error &&
                error.message
                    ? error.message
                    : String(
                        error
                    )

        };

    }

}

// ==========================================================
// RESET APPLICATION DATA API
// ==========================================================
// Reset seluruh data periode melalui Unified API GAS 2.
// Menggunakan apiPost() agar identity user/tenant tetap
// mengikuti session PWA.
// ==========================================================

window.FMC_RESET_APPLICATION_DATA_API =
    async function(data = {}){

        return await apiPost(
            "resetApplicationData",
            data
        );

    };

// ==========================================================
// GENERIC API GET
// ==========================================================
//
// DEFAULT GET
// diarahkan ke GAS 2.
//
// AUTH tidak menggunakan apiGet().
// ==========================================================

async function apiGet(
    params = {}
){

    try{

        const context =
            fmcGetUserContext_();


        const query =
            {

                ...params,

                user_id:
                    params.user_id ||
                    context.user_id,

                tenant_id:
                    params.tenant_id ||
                    context.tenant_id,

                email:
                    params.email ||
                    context.email,

                t:
                    Date.now()

            };


        const url =
            new URL(
                D2_API_BASE
            );


        Object.keys(
            query
        ).forEach(
            function(key){

                const value =
                    query[key];

                if(
                    value === undefined ||
                    value === null
                ){

                    return;

                }

                url.searchParams.set(
                    key,
                    value
                );

            }
        );


        const response =
            await fetch(
                url,
                {

                    method:
                        "GET",

                    cache:
                        "no-store"

                }
            );


        if(
            !response.ok
        ){

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        return await response.json();

    }
    catch(error){

        console.error(
            "API GET ERROR:",
            error
        );


        return null;

    }

}


// ==========================================================
// NORMALISASI D2 DASHBOARD BOUNDARY
// ==========================================================
//
// Untuk sementara D2 API baru memberikan:
//
// context
// status = BOUNDARY_READY
//
// Belum ada KPI/derived dashboard.
//
// Kita tidak menghitung KPI di PWA.
// ==========================================================

function fmcNormalizeD2Dashboard_(result){

    result = result && typeof result === "object" ? result : {};

    const sourceDashboard =
        result.dashboard && typeof result.dashboard === "object"
            ? result.dashboard
            : {};

    const context =
        result.context && typeof result.context === "object"
            ? result.context
            : {};

    const farmRaw = sourceDashboard.farm;
    const farmSource = farmRaw && typeof farmRaw === "object" ? farmRaw : {};

    const namaFarm =
        farmSource.namaFarm ||
        farmSource.farm ||
        (typeof farmRaw === "string" ? farmRaw : "") ||
        context.company ||
        context.nama ||
        "";

    const periode =
        sourceDashboard.periode ||
        result.period_id ||
        result.period_no ||
        context.period_id ||
        context.period_no ||
        "";

    const tanggalDOC =
        sourceDashboard.tanggalDOC ||
        sourceDashboard.tanggalDoc ||
        sourceDashboard.docDate ||
        "";

    const docPopulation = sourceDashboard.docPopulation != null
        ? sourceDashboard.docPopulation
        : (sourceDashboard.docIn != null ? sourceDashboard.docIn : 0);

    const livePopulation = sourceDashboard.livePopulation != null
        ? sourceDashboard.livePopulation
        : (sourceDashboard.ayamHidup != null ? sourceDashboard.ayamHidup : 0);

    const totalMati = sourceDashboard.totalMati != null
        ? sourceDashboard.totalMati
        : (sourceDashboard.mati != null ? sourceDashboard.mati : 0);

    const totalAfkir = sourceDashboard.totalAfkir != null
        ? sourceDashboard.totalAfkir
        : (sourceDashboard.afkir != null ? sourceDashboard.afkir : 0);

    const mortalitas = sourceDashboard.mortalitas != null ? sourceDashboard.mortalitas : 0;
    const totalDepletion = sourceDashboard.totalDepletion != null
        ? sourceDashboard.totalDepletion
        : (sourceDashboard.deplesi != null ? sourceDashboard.deplesi : 0);
    const totalFeed = sourceDashboard.totalFeed != null ? sourceDashboard.totalFeed : 0;
    const totalTonase = sourceDashboard.totalTonase != null ? sourceDashboard.totalTonase : 0;
    const totalBiayaPakan = sourceDashboard.totalBiayaPakan != null ? sourceDashboard.totalBiayaPakan : 0;
    const fcr = sourceDashboard.fcr != null ? sourceDashboard.fcr : 0;
    const ip = sourceDashboard.ip != null ? sourceDashboard.ip : 0;

    const sourceFloks = Array.isArray(sourceDashboard.floks)
        ? sourceDashboard.floks
        : (Array.isArray(sourceDashboard.flok)
            ? sourceDashboard.flok
            : (Array.isArray(context.floks) ? context.floks : []));

    const flok = sourceFloks.map(function(item){
        item = item && typeof item === "object" ? item : {};

        return {
            id: item.id || item.flok || item.name || "",
            nama: item.nama || item.name || item.flok || item.id || "",
            active: item.active !== false,
            hidup: item.hidup != null
                ? item.hidup
                : (item.live != null ? item.live : (item.ayamHidup != null ? item.ayamHidup : 0)),
            mati: item.mati != null ? item.mati : (item.kematian != null ? item.kematian : 0),
            afkir: item.afkir != null ? item.afkir : 0,
            mortalitas: item.mortalitas != null ? item.mortalitas : 0,
            bb: item.bb != null ? item.bb : (item.bbAvg != null ? item.bbAvg : 0),
            bbAvg: item.bbAvg != null ? item.bbAvg : (item.bb != null ? item.bb : 0),
            fcr: item.fcr != null ? item.fcr : 0,
            ip: item.ip != null ? item.ip : 0,
            status: item.status || item.statusPanen || "BELUM"
        };
    });

    const ekonomiFlok = Array.isArray(sourceDashboard.ekonomiFlok)
        ? sourceDashboard.ekonomiFlok
        : (Array.isArray(sourceDashboard.ekonomi_flok) ? sourceDashboard.ekonomi_flok : []);

    const realisasiPanen = Array.isArray(sourceDashboard.realisasiPanen)
        ? sourceDashboard.realisasiPanen
        : (Array.isArray(sourceDashboard.realisasi_panen) ? sourceDashboard.realisasi_panen : []);

    return {
        dashboard: {
            farm: {
                namaFarm: namaFarm,
                periode: periode,
                chickIn: docPopulation,
                tanggalDOC: tanggalDOC
            },
            kpi: {
                docIn: docPopulation,
                ayamHidup: livePopulation,
                mati: totalMati,
                afkir: totalAfkir,
                mortalitas: mortalitas,
                deplesi: totalDepletion,
                fcr: fcr,
                ip: ip
            },
            flok: flok,
            ekonomiFlok: ekonomiFlok,
            realisasiPanen: realisasiPanen,
            harian: result.harian != null ? result.harian : (sourceDashboard.harian != null ? sourceDashboard.harian : null),
            keuangan: result.keuangan != null ? result.keuangan : (sourceDashboard.keuangan != null ? sourceDashboard.keuangan : null),
            rhpp: result.rhpp != null ? result.rhpp : (sourceDashboard.rhpp != null ? sourceDashboard.rhpp : null),
            tanggalDOC: tanggalDOC,
            docPopulation: docPopulation,
            livePopulation: livePopulation,
            totalMati: totalMati,
            totalAfkir: totalAfkir,
            mortalitas: mortalitas,
            totalDepletion: totalDepletion,
            totalFeed: totalFeed,
            totalTonase: totalTonase,
            totalBiayaPakan: totalBiayaPakan
        },
        ai: Array.isArray(result.ai) ? result.ai : [],
        profile: {
            user_id: result.user_id || context.user_id || "",
            tenant_id: result.tenant_id || context.tenant_id || "",
            email: result.email || context.email || "",
            nama: context.nama || "",
            company: namaFarm || context.company || "",
            business: context.business || "broiler"
        },
        config: {
            flok_count: Number(context.flok_count || sourceFloks.length || flok.length || 0),
            floks: flok
        },
        periods: Array.isArray(result.periods) ? result.periods : [],
        d2: {
            success: result.success === true,
            engine_version: result.engine_version || "",
            api_version: result.api_version || "",
            action: result.action || "",
            status: result.status || "",
            tenant_id: result.tenant_id || context.tenant_id || "",
            period_id: result.period_id || result.period_no || ""
        }
    };
}

// ==========================================================
// FMC D2 — EXTRACT HARIAN / KEUANGAN
// ==========================================================
//
// Patch minimal:
// - Dashboard tetap melalui getDashboard.
// - Harian melalui action=getHarian.
// - Keuangan melalui action=getKeuangan.
// - Jika salah satu modul belum tersedia, Dashboard TETAP
//   berhasil dan modul yang gagal hanya menjadi data kosong.
// - Tidak menghitung ulang data di PWA.
// ==========================================================

function fmcExtractD2ModuleData_(result, moduleName){

    if(
        !result ||
        result.success !== true
    ){
        return null;
    }

    if(
        result[moduleName] !== undefined &&
        result[moduleName] !== null
    ){
        return result[moduleName];
    }

    if(
        result.data &&
        typeof result.data === "object" &&
        result.data[moduleName] !== undefined &&
        result.data[moduleName] !== null
    ){
        return result.data[moduleName];
    }

    if(
        result.payload &&
        typeof result.payload === "object" &&
        result.payload[moduleName] !== undefined &&
        result.payload[moduleName] !== null
    ){
        return result.payload[moduleName];
    }

    return null;
}


// ==========================================================
// DATA SERVER
// ==========================================================
//
// Dashboard:
// GAS 2 → action=getDashboard
//
// Tambahan:
// GAS 2 → action=getHarian
// GAS 2 → action=getKeuangan
//
// Semua request menggunakan identity yang sama dari session.
// Tidak ada fallback ke GAS 1 / Spreadsheet legacy.
// ==========================================================

async function ambilDataServer(
    force = false
){

    if(
        serverData &&
        !force
    ){

        return serverData;

    }


    try{

        const context =
            fmcGetUserContext_();


        if(
            !context.email &&
            !context.user_id
        ){

            console.error(
                "D2 API: USER BELUM LOGIN"
            );


            if(
                typeof statusServer ===
                "function"
            ){

                statusServer(
                    false
                );

            }


            return null;

        }


        const result =
            await apiPost(
                "getDashboard",
                {}
            );


        if(
            !result ||
            result.success !== true
        ){

            console.error(
                "D2 DASHBOARD API ERROR:",
                result
            );


            if(
                typeof statusServer ===
                "function"
            ){

                statusServer(
                    false
                );

            }


            return null;

        }


        const data =
            fmcNormalizeD2Dashboard_(
                result
            );


        /*
         * ======================================================
         * HARIAN + KEUANGAN
         * ======================================================
         *
         * Paralel supaya tidak menambah waktu tunggu secara
         * berurutan. Kegagalan salah satu modul tidak boleh
         * menjatuhkan Dashboard yang sudah stabil.
         */

        const moduleResults =
            await Promise.all([
                apiPost(
                    "getHarian",
                    {}
                ),
                apiPost(
                    "getKeuangan",
                    {}
                )
            ]);


        const harianData =
            fmcExtractD2ModuleData_(
                moduleResults[0],
                "harian"
            );


        const keuanganData =
            fmcExtractD2ModuleData_(
                moduleResults[1],
                "keuangan"
            );


        /*
         * Tambahkan modul ke struktur runtime PWA.
         * Dashboard/KPI/Flok yang sudah berhasil tidak diganti.
         */

        data.harian =
            harianData !== null
                ? harianData
                : (
                    data.dashboard &&
                    data.dashboard.harian !== null &&
                    data.dashboard.harian !== undefined
                        ? data.dashboard.harian
                        : {
                            tanggal: "",
                            totalMati: 0,
                            flok: []
                        }
                );


        data.keuangan =
            keuanganData !== null
                ? keuanganData
                : (
                    data.dashboard &&
                    data.dashboard.keuangan !== null &&
                    data.dashboard.keuangan !== undefined
                        ? data.dashboard.keuangan
                        : {
                            totalEkor: 0,
                            totalTonase: 0,
                            flokPanen: 0,
                            bbTertinggi: 0,
                            umurTertua: 0,
                            flokTerbaik: "-",
                            totalPakan: 0,
                            biayaOperasional: 0,
                            estimasiOmset: 0,
                            costEkor: 0,
                            costKg: 0,
                            marginProduksi: 0,
                            bonusKematian: 0,
                            bonusPasar: 0,
                            estimasiLaba: 0,
                            profitOwner: 0
                        }
                );


        serverData =
            data;


        // ======================================================
        // STATUS SERVER
        // ======================================================

        if(
            typeof statusServer ===
            "function"
        ){

            statusServer(
                true
            );

        }


        // ======================================================
        // UPDATE NAMA FARM
        // ======================================================

        const farm =
            data &&
            data.dashboard &&
            data.dashboard.farm
                ? data.dashboard.farm
                : null;


        if(
            farm &&
            farm.namaFarm
        ){

            const el =
                document.getElementById(
                    "farmNama"
                );


            if(el){

                el.innerHTML =
                    farm.namaFarm;

            }

        }


        return data;

    }
    catch(error){

        console.error(
            "D2 TENANT DATA ERROR:",
            error
        );


        if(
            typeof statusServer ===
            "function"
        ){

            statusServer(
                false
            );

        }


        return null;

    }

}


// ==========================================================
// REFRESH DATA
// ==========================================================

async function refreshData(){

    try{

        serverData =
            null;


        const data =
            await ambilDataServer(
                true
            );


        if(data){

            if(
                typeof showPage ===
                "function"
            ){

                await showPage(
                    currentPage
                );

            }


            if(
                typeof updateJam ===
                "function"
            ){

                updateJam();

            }


            if(
                typeof showUpdateToast ===
                "function"
            ){

                showUpdateToast(
                    "Data berhasil diperbarui"
                );

            }

        }
        else{

            if(
                typeof showUpdateToast ===
                "function"
            ){

                showUpdateToast(
                    "Gagal mengambil data"
                );

            }

        }

    }
    catch(error){

        console.error(
            "REFRESH DATA ERROR:",
            error
        );


        if(
            typeof showUpdateToast ===
            "function"
        ){

            showUpdateToast(
                "Gagal memperbarui data"
            );

        }

    }

}


// ==========================================================
// D2 PERIOD HELPERS
// ==========================================================
// Period tetap melalui Unified Router GAS 2.
// Tidak membuat endpoint baru.
// ==========================================================

async function d2GetPeriods(
    data = {}
){
    return await apiPost(
        "getPeriods",
        data
    );
}


async function d2GetPeriod(
    data = {}
){
    return await apiPost(
        "getPeriod",
        data
    );
}



// ==========================================================
// LOGIN API
// ==========================================================
//
// Tetap GAS 1.
// ==========================================================

async function loginAPI(
    email,
    pin
){

    return await apiPost(
        "login",
        {

            email:
                email,

            pin:
                pin

        }
    );

}


// ==========================================================
// REGISTER API
// ==========================================================
//
// Tetap GAS 1.
//
// Setelah OTP verified,
// GAS 1 yang melakukan provisioning
// ke GAS 2.
// ==========================================================

async function registerAPI(
    data
){

    return await apiPost(
        "register",
        data
    );

}


// ==========================================================
// OTP API
// ==========================================================

async function kirimOTP(
    email
){

    return await apiPost(
        "sendOTP",
        {

            email:
                email

        }
    );

}


async function verifikasiOTP(
    email,
    otp
){

    return await apiPost(
        "verifyOTP",
        {

            email:
                email,

            otp:
                otp

        }
    );

}


// ==========================================================
// RESET PIN API
// ==========================================================

async function sendResetOTPAPI(
    email
){

    return await apiPost(
        "sendResetOTP",
        {

            email:
                email

        }
    );

}


async function verifyResetOTPAPI(
    email,
    otp
){

    return await apiPost(
        "verifyResetOTP",
        {

            email:
                email,

            code:
                otp

        }
    );

}


async function resetPINAPI(
    email,
    pin
){

    return await apiPost(
        "resetPIN",
        {

            email:
                email,

            pin:
                pin

        }
    );

}


// ==========================================================
// PERSISTENT AUTH SESSION — GAS 1
// ==========================================================
//
// Token session berasal dari GAS 1.
// D2/GAS 2 tetap menggunakan identity user_id / tenant_id.
// ==========================================================

function fmcGetSessionToken(){

    try{

        return String(
            localStorage.getItem(
                "FMC_SESSION_TOKEN"
            ) || ""
        ).trim();

    }
    catch(error){

        console.error(
            "FMC GET SESSION TOKEN ERROR:",
            error
        );

        return "";
    }
}


function fmcSetSessionToken(
    token
){

    try{

        const value =
            String(
                token || ""
            ).trim();

        if(!value){

            localStorage.removeItem(
                "FMC_SESSION_TOKEN"
            );

            return false;
        }

        localStorage.setItem(
            "FMC_SESSION_TOKEN",
            value
        );

        return true;

    }
    catch(error){

        console.error(
            "FMC SET SESSION TOKEN ERROR:",
            error
        );

        return false;
    }
}


function fmcClearSessionToken(){

    try{

        localStorage.removeItem(
            "FMC_SESSION_TOKEN"
        );

    }
    catch(error){

        console.error(
            "FMC CLEAR SESSION TOKEN ERROR:",
            error
        );
    }
}


async function validateSessionAPI(
    token
){

    const sessionToken =
        String(
            token ||
            fmcGetSessionToken() ||
            ""
        ).trim();

    if(!sessionToken){

        return {
            success: false,
            valid: false,
            message:
                "Session token tidak tersedia."
        };
    }

    return await apiPost(
        "validateSession",
        {
            session_token:
                sessionToken
        }
    );
}


// ==========================================================
// SESSION
// ==========================================================

function simpanSession(
    user
){

    localStorage.setItem(
        "FMC_LOGIN",
        "1"
    );


    localStorage.setItem(
        "FMC_USER",
        JSON.stringify(
            user || {}
        )
    );

    const sessionToken =
        user &&
        typeof user === "object"
            ? (
                user.session_token ||
                user.sessionToken ||
                user.token ||
                ""
            )
            : "";

    if(sessionToken){

        fmcSetSessionToken(
            sessionToken
        );
    }

}


function ambilSession(){

    try{

        return JSON.parse(
            localStorage.getItem(
                "FMC_USER"
            )
        );

    }
    catch(error){

        return null;

    }

}


function sudahLogin(){

    return (
        localStorage.getItem(
            "FMC_LOGIN"
        ) === "1"
    );

}


function hapusSession(){

    localStorage.removeItem(
        "FMC_LOGIN"
    );


    localStorage.removeItem(
        "FMC_USER"
    );


    fmcClearSessionToken();

    clearApiCache();

}


// ==========================================================
// LOGOUT API
// ==========================================================

async function logoutAPI(){

    try{

        const token =
            fmcGetSessionToken();

        let serverLogout =
            null;

        if(token){

            serverLogout =
                await apiPost(
                    "logout",
                    {
                        session_token:
                            token
                    }
                );
        }

        hapusSession();

        return {
            success:
                !serverLogout ||
                serverLogout.success !== false,

            message:
                serverLogout &&
                serverLogout.message
                    ? serverLogout.message
                    : "Logout berhasil.",

            session_revoked:
                !!(
                    serverLogout &&
                    serverLogout.success === true
                )
        };

    }
    catch(error){

        console.error(
            "LOGOUT ERROR:",
            error
        );

        hapusSession();

        return {
            success:
                false,

            message:
                "Logout gagal di server, tetapi sesi lokal sudah dibersihkan."
        };
    }
}


// ==========================================================
// CACHE
// ==========================================================

function clearApiCache(){

    serverData =
        null;

}


function getCachedData(){

    return serverData;

}


// ==========================================================
// SERVER CONNECTION
// ==========================================================

async function cekKoneksiServer(){

    try{

        const context =
            fmcGetUserContext_();


        if(
            !context.email &&
            !context.user_id
        ){

            return false;

        }


        const result =
            await apiPost(
                "getDashboard",
                {}
            );


        return (
            result &&
            result.success === true
        );

    }
    catch(error){

        return false;

    }

}


// ==========================================================
// USER
// ==========================================================

function getLoginUser(){

    return ambilSession();

}


function getFmcSessionToken(){

    return fmcGetSessionToken();

}


// ==========================================================
// INITIALIZE
// ==========================================================

(function(){

    console.log(
        "===================================="
    );

    console.log(
        "FMC API.JS D2 BRIDGE V1 LOADED"
    );

    console.log(
        "AUTH  : GAS 1"
    );

    console.log(
        "DATA  : GAS 2"
    );

    console.log(
        "===================================="
    );

})();