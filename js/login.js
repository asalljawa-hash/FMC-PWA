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
   SESSION
====================================== */

function isLoggedIn() {

    return localStorage.getItem("FMC_LOGIN") === "1";

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


function logoutUser() {

    localStorage.removeItem("FMC_LOGIN");

    localStorage.removeItem("FMC_USER");

    loginState.loggedIn = false;

}


/* ======================================
   AUTO LOGIN
====================================== */

async function autoLogin() {

    if (!isLoggedIn()) {

        return;

    }

    const user = getLoginUser();

    console.log("AUTO LOGIN :", user);

    loginState.loggedIn = true;

    const loginPage =
        document.getElementById("loginPage");

    const app =
        document.getElementById("app");

    if (loginPage) {

        loginPage.style.display = "none";

    }

    if (app) {

        app.style.display = "block";

    }

    if (typeof showPage === "function") {

        await showPage("dashboard");

    }
    else if (typeof tampilDashboard === "function") {

        await tampilDashboard();

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


/* ======================================
   INITIALIZATION
====================================== */

function initLogin() {

    clearLoginMessage();

    autoLogin();

}

document.addEventListener(

    "DOMContentLoaded",

    initLogin

);
