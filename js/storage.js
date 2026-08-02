/* ======================================
   FMC BROILER MOBILE
   API MODULE
   Version : 1.0.0
====================================== */


/* ======================================
   API CONFIGURATION
====================================== */

const API = {

    BASE_URL: CONFIG.API.BASE_URL,

    VERSION: CONFIG.API.VERSION,

    TIMEOUT: CONFIG.API.TIMEOUT

};


/* ======================================
   API REQUEST
====================================== */

async function apiRequest(
    endpoint,
    method = "GET",
    body = null,
    token = null
) {

    const headers = {

        "Content-Type": "application/json"

    };

    if (token) {

        headers.Authorization = `Bearer ${token}`;

    }

    const options = {

        method,
        headers

    };

    if (body) {

        options.body = JSON.stringify(body);

    }

    const response = await fetch(

        `${API.BASE_URL}/${API.VERSION}/${endpoint}`,

        options

    );

    return await response.json();

}


/* ======================================
   AUTH API
====================================== */

async function register(data) {

    return await apiRequest(
        "register",
        "POST",
        data
    );

}

async function login(data) {

    return await apiRequest(
        "login",
        "POST",
        data
    );

}

async function logout(token) {

    return await apiRequest(
        "logout",
        "POST",
        null,
        token
    );

}


/* ======================================
   MASTER DATA API
====================================== */

// Akan ditambahkan pada sprint berikutnya


/* ======================================
   FARM API
====================================== */

// Akan ditambahkan pada sprint berikutnya


/* ======================================
   HARIAN API
====================================== */

// Akan ditambahkan pada sprint berikutnya


/* ======================================
   RHPP API
====================================== */

// Akan ditambahkan pada sprint berikutnya


/* ======================================
   KEUANGAN API
====================================== */

// Akan ditambahkan pada sprint berikutnya


/* ======================================
   AI API
====================================== */

// Akan ditambahkan pada sprint berikutnya