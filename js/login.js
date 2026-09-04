// ==========================================
// FMC BROILER MOBILE
// LOGIN.JS
// ==========================================

/* ======================================
   LOGIN CONFIG
====================================== */

const LOGIN_CONFIG = {

    MIN_PIN_LENGTH: 6,

    MAX_PIN_LENGTH: 6

};
/* ======================================
   FMC DEVELOPMENT MODE
====================================== */

const FMC_DEV_MODE = false;

function isDevelopmentMode(){

    return (
        FMC_DEV_MODE === true &&
        (
            location.hostname === "localhost" ||
            location.hostname === "127.0.0.1"
        )
    );

}


/* ======================================
   LOGIN ELEMENTS
====================================== */

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPin =
    document.getElementById("loginPin");

const btnLogin =
    document.getElementById("btnLogin");

const loginMessage =
    document.getElementById("loginMessage");


/* ======================================
   LOGIN STATE
====================================== */

const loginState = {

    loading: false,

    loggedIn: false

};


/* ======================================
   LOGIN MESSAGE
====================================== */

function showLoginMessage(
    message,
    type = "error"
) {

    loginMessage.style.display = "block";

    loginMessage.innerHTML = message;

    if (type === "success") {

        loginMessage.style.background =
            "#d1fae5";

        loginMessage.style.color =
            "#065f46";

        loginMessage.style.border =
            "1px solid #10b981";

    }

    else if (type === "warning") {

        loginMessage.style.background =
            "#fef3c7";

        loginMessage.style.color =
            "#92400e";

        loginMessage.style.border =
            "1px solid #f59e0b";

    }

    else {

        loginMessage.style.background =
            "#fee2e2";

        loginMessage.style.color =
            "#991b1b";

        loginMessage.style.border =
            "1px solid #ef4444";

    }

}


function clearLoginMessage() {

    loginMessage.style.display = "none";

    loginMessage.innerHTML = "";

}


/* ======================================
   BUTTON STATE
====================================== */

function disableLoginButton() {

    loginState.loading = true;

    btnLogin.disabled = true;

    btnLogin.innerHTML =
        "Memproses...";

}


function enableLoginButton() {

    loginState.loading = false;

    btnLogin.disabled = false;

    btnLogin.innerHTML =
        "MASUK KE FMC";

}

/* ======================================
   VALIDATION
====================================== */

function validateEmail() {

    const value =
        loginEmail.value.trim();

    if (value === "") {

        showLoginMessage(
            "Silakan isi Email."
        );

        return false;

    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {

        showLoginMessage(
            "Format Email tidak valid."
        );

        return false;

    }

    return true;

}


function validatePin() {

    const value =
        loginPin.value.trim();

    if (value === "") {

        showLoginMessage(
            "Silakan isi PIN."
        );

        return false;

    }

    if (!/^[0-9]+$/.test(value)) {

        showLoginMessage(
            "PIN hanya boleh berisi angka."
        );

        return false;

    }

    if (
        value.length <
        LOGIN_CONFIG.MIN_PIN_LENGTH
    ) {

        showLoginMessage(
            "PIN harus terdiri dari 6 digit."
        );

        return false;

    }

    return true;

}


/* ======================================
   LOGIN USER
====================================== */

async function loginUser() {

    clearLoginMessage();

    if (!validateEmail()) return;

    if (!validatePin()) return;

    disableLoginButton();

    try {

        showLoginMessage(
            "Memproses login...",
            "warning"
        );

        const result = await loginAPI(

            loginEmail.value.trim(),

            loginPin.value.trim()

        );

        console.log("LOGIN RESULT :", result);

        if (!result.success) {

            showLoginMessage(

                result.message ||

                "Login gagal."

            );

            return;

        }

        simpanSession(

            result.data || {}

        );

        
        const sessionToken =
            typeof getFmcSessionToken === "function"
                ? getFmcSessionToken()
                : "";

        if(!sessionToken){

            console.error(
                "LOGIN BERHASIL TETAPI SESSION TOKEN GAS 1 TIDAK TERSEDIA."
            );

            localStorage.removeItem("FMC_LOGIN");
            localStorage.removeItem("FMC_USER");

            showLoginMessage(
                "Login berhasil, tetapi session keamanan tidak berhasil dibuat."
            );

            return;
        }

        loginState.loggedIn = true;

        /* ==========================
           TAMPILKAN SPLASH
        ========================== */

        const loginPage =
            document.getElementById("loginPage");

        const splash =
            document.getElementById("splash");

        const app =
            document.getElementById("app");

        if (loginPage) {

            loginPage.style.display = "none";

        }

        if (splash) {

            splash.style.display = "flex";

            splash.classList.remove("hide");

        }

        /* ==========================
           MUAT DASHBOARD
        ========================== */

        setTimeout(async () => {

            if (app) {

                app.style.display = "block";

            }

            if (typeof showPage === "function") {

                await showPage("dashboard");

            } else if (typeof tampilDashboard === "function") {

                await tampilDashboard();

            }

            if (splash) {

                splash.classList.add("hide");

                setTimeout(() => {

                    splash.style.display = "none";

                },700);

            }

        },1200);

    }

    catch (error) {

        console.error(

            "LOGIN ERROR :",

            error

        );

        showLoginMessage(

            "Tidak dapat terhubung ke server."

        );

    }

    finally {

        enableLoginButton();

    }

}


/* ======================================
   SESSION — GAS 1 PERSISTENT SESSION
====================================== */

function isLoggedIn() {

    const token =
        typeof getFmcSessionToken === "function"
            ? getFmcSessionToken()
            : "";

    return (
        !!token ||
        localStorage.getItem("FMC_LOGIN") === "1"
    );
}


function getLoginUser() {

    try {

        return JSON.parse(
            localStorage.getItem("FMC_USER")
        );

    }
    catch (error) {

        return null;
    }
}


async function logoutUser() {

    /*
     * LOGOUT FLOW
     * 1. Tutup session di GAS 1 jika API tersedia.
     * 2. Selalu bersihkan session lokal.
     * 3. Reset state login.
     * 4. Langsung kembali ke halaman login.
     */

    try {

        if (typeof logoutAPI === "function") {
            await logoutAPI();
        }

    } catch (error) {

        console.error("LOGOUT USER ERROR:", error);

    }

    /* Selalu bersihkan session lokal, terlepas API berhasil/gagal. */
    localStorage.removeItem("FMC_LOGIN");
    localStorage.removeItem("FMC_USER");

    if (typeof fmcClearSessionToken === "function") {
        try {
            fmcClearSessionToken();
        } catch (error) {
            console.error("CLEAR SESSION TOKEN ERROR:", error);
        }
    }

    loginState.loggedIn = false;

    /* ======================================
       LOGOUT UI — LANGSUNG KEMBALI KE LOGIN
    ====================================== */

    const loginPage = document.getElementById("loginPage");
    const app = document.getElementById("app");
    const splash = document.getElementById("splash");

    if (splash) {
        splash.classList.remove("hide");
        splash.style.display = "none";
    }

    if (app) {
        app.style.display = "none";
    }

    if (loginPage) {
        loginPage.style.display = "flex";
    }

    /* Bersihkan form login dari session sebelumnya. */
    if (loginEmail) loginEmail.value = "";
    if (loginPin) loginPin.value = "";

    clearLoginMessage();

}


/* ======================================
   AUTO LOGIN — VALIDATE GAS 1 SESSION
====================================== */

async function autoLogin() {

    const token =
        typeof getFmcSessionToken === "function"
            ? getFmcSessionToken()
            : "";

    if (!token) {

        loginState.loggedIn = false;

        return false;

    }

    try {

        if (
            typeof validateSessionAPI !==
            "function"
        ) {

            console.error(
                "VALIDATE SESSION API TIDAK TERSEDIA."
            );

            return false;

        }

        console.log(
            "FMC SESSION: VALIDASI KE GAS 1..."
        );

        const result =
            await validateSessionAPI(
                token
            );

        console.log(
            "FMC SESSION VALIDATION RESULT:",
            result
        );

        const valid =
            result &&
            result.success === true &&
            (
                result.valid === true ||
                result.status === "ACTIVE" ||
                (
                    result.data &&
                    (
                        result.data.valid === true ||
                        result.data.status === "ACTIVE"
                    )
                )
            );

        if (!valid) {

            console.warn(
                "FMC SESSION INVALID. KEMBALI KE LOGIN."
            );

            if (
                typeof fmcClearSessionToken ===
                "function"
            ) {

                fmcClearSessionToken();

            }

            localStorage.removeItem("FMC_LOGIN");
            localStorage.removeItem("FMC_USER");

            loginState.loggedIn = false;

            return false;

        }

        const validUser =
            result.data &&
            typeof result.data === "object"
                ? result.data
                : result;

        const currentUser =
            getLoginUser() || {};

        const mergedUser = {

            ...currentUser,

            user_id:
                validUser.user_id ||
                currentUser.user_id ||
                "",

            tenant_id:
                validUser.tenant_id ||
                currentUser.tenant_id ||
                "",

            status:
                validUser.status ||
                currentUser.status ||
                "ACTIVE"

        };

        localStorage.setItem(
            "FMC_USER",
            JSON.stringify(
                mergedUser
            )
        );

        localStorage.setItem(
            "FMC_LOGIN",
            "1"
        );

        loginState.loggedIn = true;

        const loginPage =
            document.getElementById(
                "loginPage"
            );

        const app =
            document.getElementById(
                "app"
            );

        if (loginPage) {
            loginPage.style.display = "none";
        }

        if (app) {
            app.style.display = "block";
        }

        if (
            typeof showPage ===
            "function"
        ) {

            await showPage(
                "dashboard"
            );

        }
        else if (
            typeof tampilDashboard ===
            "function"
        ) {

            await tampilDashboard();

        }

        return true;

    }
    catch (error) {

        console.error(
            "AUTO LOGIN / SESSION VALIDATION ERROR:",
            error
        );

        /*
         * Gangguan jaringan tidak langsung
         * menghapus token session.
         */
        loginState.loggedIn = false;

        return false;

    }

}


/* ======================================
   EVENTS
====================================== */

loginForm.addEventListener(

    "submit",

    function (event) {

        event.preventDefault();

    }

);


btnLogin.addEventListener(

    "click",

    async function () {

        await loginUser();

    }

);


[
    loginEmail,
    loginPin

].forEach(function (element) {

    element.addEventListener(

        "input",

        clearLoginMessage

    );

});


[
    loginEmail,
    loginPin

].forEach(function (element) {

    element.addEventListener(

        "keypress",

        async function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                await loginUser();

            }

        }

    );

});


function initLogin() {

    clearLoginMessage();

    /* ==================================
       AUTH SESSION
    ================================== */

    /*
     * Localhost tidak lagi bypass authentication.
     * Persistent Session GAS 1 menjadi sumber
     * kebenaran untuk startup.
     */
    autoLogin();

}

/* ======================================
   INIT LOGIN
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("FMC LOGIN INIT");

        initLogin();

    }
);