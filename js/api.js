// ==========================================
// FMC BROILER MOBILE V8
// API.JS
// BAGIAN 1 / 4
// ==========================================

const API_BASE =
"https://script.google.com/macros/s/AKfycbzQV6bliXd_BlxOJgtXdacoHhtdbgWfHUV-vhW3DZSyaTWBSTdNuum5UG3YyWqGwUJh/exec";

const API_DATA =
API_BASE + "?api=data";

// ==========================================
// CACHE
// ==========================================

let serverData = null;

let lastDataVersion =
localStorage.getItem("FMC_DATA_VERSION") || "";

// ==========================================
// API POST
// ==========================================

async function apiPost(action, data = {}) {

    try {

        const response = await fetch(API_BASE, {

            method: "POST",

            headers: {
                "Content-Type":
                "application/x-www-form-urlencoded"
            },

            body: new URLSearchParams({

                action,

                ...data

            })

        });

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }

        const result =
            await response.json();

        return result;

    }

    catch (error) {

        console.error(
            "API POST ERROR:",
            error
        );

        return {

            success: false,

            message:
            "Tidak dapat terhubung ke server."

        };

    }

}

// ==========================================
// API GET
// ==========================================

async function apiGet(params = {}) {

    try {

        const url =
            new URL(API_DATA);

        Object.keys(params)
            .forEach(key => {

                url.searchParams.set(
                    key,
                    params[key]
                );

            });

        url.searchParams.set(
            "t",
            Date.now()
        );

        const response =
            await fetch(url, {

                cache: "no-store"

            });

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }

        return await response.json();

    }

    catch (error) {

        console.error(
            "API GET ERROR:",
            error
        );

        return null;

    }

}

// ==========================================
// DATA SERVER
// ==========================================

async function ambilDataServer(force = false) {

    if (serverData && !force) {
        return serverData;
    }

    try {

        const data = await apiGet();

        if (!data) {
            return null;
        }

        serverData = data;

        // ==================================
        // CEK VERSI DATA
        // ==================================

        if (
            data.system &&
            data.system.dataVersion
        ) {

            if (lastDataVersion === "") {

                lastDataVersion =
                    data.system.dataVersion;

                localStorage.setItem(
                    "FMC_DATA_VERSION",
                    lastDataVersion
                );

            }

            else if (
                lastDataVersion !==
                data.system.dataVersion
            ) {

                lastDataVersion =
                    data.system.dataVersion;

                localStorage.setItem(
                    "FMC_DATA_VERSION",
                    lastDataVersion
                );

                if (
                    typeof showUpdateToast ===
                    "function"
                ) {

                    showUpdateToast(
                        "Data harian peternakan telah diperbarui."
                    );

                }

            }

        }

        // ==================================
        // STATUS SERVER
        // ==================================

        if (
            typeof statusServer ===
            "function"
        ) {

            statusServer(true);

        }

        // ==================================
        // UPDATE NAMA FARM
        // ==================================

        if (
            data.dashboard &&
            data.dashboard.farm
        ) {

            const farm =
                data.dashboard.farm;

            const el =
                document.getElementById(
                    "farmNama"
                );

            if (el) {

                el.innerHTML =
                    farm.namaFarm;

            }

        }

        return data;

    }

    catch (error) {

        console.error(
            "DATA SERVER ERROR:",
            error
        );

        if (
            typeof statusServer ===
            "function"
        ) {

            statusServer(false);

        }

        return null;

    }

}

// ==========================================
// REFRESH DATA
// ==========================================

async function refreshData() {

    try {

        serverData = null;

        const data = await ambilDataServer(true);

        if (data) {

            await showPage(currentPage);
            updateJam();

            showUpdateToast("Data berhasil diperbarui");

        } else {

            showUpdateToast("Gagal mengambil data");

        }

    } catch (err) {

        console.error(err);
        showUpdateToast("Gagal memperbarui data");

    }

}

// ==========================================
// LOGIN API
// ==========================================

async function loginAPI(email, pin) {

    return await apiPost("login", {

        email: email,

        pin: pin

    });

}

// ==========================================
// REGISTER API
// ==========================================

async function registerAPI(data) {

    return await apiPost(

        "register",

        data

    );

}

// ==========================================
// OTP API
// ==========================================

async function kirimOTP(email) {

    return await apiPost(

        "sendOTP",

        {

            email: email

        }

    );

}

async function verifikasiOTP(

    email,

    otp

) {

    return await apiPost(

        "verifyOTP",

        {

            email: email,

            otp: otp

        }

    );

}
// ==========================================
// RESET PIN API
// ==========================================

async function sendResetOTPAPI(email){

    return await apiPost(

        "sendResetOTP",

        {

            email: email

        }

    );

}

async function verifyResetOTPAPI(email, otp){

    return await apiPost(

        "verifyResetOTP",

        {

            email: email,

            code: otp

        }

    );

}

async function resetPINAPI(email, pin){

    return await apiPost(

        "resetPIN",

        {

            email: email,

            pin: pin

        }

    );

}
// ==========================================
// SESSION
// ==========================================

function simpanSession(user) {

    localStorage.setItem(

        "FMC_LOGIN",

        "1"

    );

    localStorage.setItem(

        "FMC_USER",

        JSON.stringify(user)

    );

}

function ambilSession() {

    try {

        return JSON.parse(

            localStorage.getItem(

                "FMC_USER"

            )

        );

    }

    catch (e) {

        return null;

    }

}

function sudahLogin() {

    return (

        localStorage.getItem(

            "FMC_LOGIN"

        ) === "1"

    );

}

function hapusSession() {

    localStorage.removeItem(

        "FMC_LOGIN"

    );

    localStorage.removeItem(

        "FMC_USER"

    );

}

// ==========================================
// LOGOUT API
// ==========================================

async function logoutAPI() {

    try {

        hapusSession();

        clearApiCache();

        return {

            success: true,

            message: "Logout berhasil."

        };

    }

    catch (error) {

        console.error(

            "LOGOUT ERROR:",

            error

        );

        return {

            success: false,

            message: "Logout gagal."

        };

    }

}

// ==========================================
// CACHE
// ==========================================

function clearApiCache() {

    serverData = null;

}

function getCachedData() {

    return serverData;

}

// ==========================================
// SERVER
// ==========================================

async function cekKoneksiServer() {

    try {

        const data = await apiGet();

        return data !== null;

    }

    catch (error) {

        return false;

    }

}

// ==========================================
// USER
// ==========================================

function getLoginUser() {

    return ambilSession();

}

// ==========================================
// INITIALIZE
// ==========================================

(function () {

    console.log(

        "API.JS Loaded"

    );

})();