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
    "resetPIN"
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

function fmcNormalizeD2Dashboard_(
    result
){

    const context =
        result &&
        result.context
            ? result.context
            : {};


    const floks =
        Array.isArray(
            context.floks
        )
            ? context.floks
            : [];


    const flok =
        floks.map(
            function(item){

                return {

                    id:
                        item.id ||
                        "",

                    nama:
                        item.name ||
                        item.nama ||
                        item.id ||
                        "",

                    active:
                        item.active !== false

                };

            }
        );


    return {

        dashboard: {

            farm: {

                namaFarm:
                    context.company ||
                    context.nama ||
                    "",

                periode:
                    "",

                chickIn:
                    0

            },

            kpi: {

                docIn:
                    0,

                ayamHidup:
                    0,

                mati:
                    0,

                afkir:
                    0,

                mortalitas:
                    0,

                deplesi:
                    0,

                fcr:
                    0,

                ip:
                    0

            },

            flok:
                flok,

            ekonomiFlok:
                [],

            realisasiPanen:
                []

        },


        ai:
            [],


        profile: {

            user_id:
                context.user_id ||
                "",

            tenant_id:
                context.tenant_id ||
                "",

            email:
                context.email ||
                "",

            nama:
                context.nama ||
                "",

            company:
                context.company ||
                "",

            business:
                context.business ||
                "broiler"

        },


        config: {

            flok_count:
                Number(
                    context.flok_count ||
                    floks.length ||
                    0
                ),

            floks:
                floks

        },


        periods:
            [],


        d2: {

            success:
                result &&
                result.success === true,

            api_version:
                result &&
                result.api_version
                    ? result.api_version
                    : "",

            action:
                result &&
                result.action
                    ? result.action
                    : "",

            status:
                result &&
                result.status
                    ? result.status
                    : ""

        }

    };

}


// ==========================================================
// DATA SERVER
// ==========================================================
//
// Dashboard sekarang mengambil:
// GAS 2 → action=getDashboard
//
// Jika boundary berhasil:
// serverData tetap berupa object kompatibel PWA.
//
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


    clearApiCache();

}


// ==========================================================
// LOGOUT API
// ==========================================================

async function logoutAPI(){

    try{

        hapusSession();


        return {

            success:
                true,

            message:
                "Logout berhasil."

        };

    }
    catch(error){

        console.error(
            "LOGOUT ERROR:",
            error
        );


        return {

            success:
                false,

            message:
                "Logout gagal."

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