/* ======================================
   FMC BROILER MOBILE
   CONFIGURATION
   Version : 1.0.0
====================================== */


/* ======================================
   APPLICATION
====================================== */

const CONFIG = {

    APP: {

        NAME: "FMC Broiler Mobile",

        VERSION: "1.0.0",

        AUTHOR: "FMC Development Team"

    },


/* ======================================
   API
====================================== */

    API: {

        BASE_URL: "https://api.fmcbroiler.com",

        VERSION: "v1",

        TIMEOUT: 30000

    },


/* ======================================
   STORAGE
====================================== */

    STORAGE: {

        TOKEN: "fmc_token",

        USER: "fmc_user",

        REMEMBER: "fmc_remember",

        SETTING: "fmc_setting"

    },


/* ======================================
   SECURITY
====================================== */

    SECURITY: {

        PIN_LENGTH: 6,

        MAX_LOGIN_ATTEMPT: 5,

        SESSION_TIMEOUT: 3600

    },


/* ======================================
   PAGINATION
====================================== */

    PAGINATION: {

        LIMIT: 20

    },


/* ======================================
   DATE FORMAT
====================================== */

    DATE: {

        LOCALE: "id-ID",

        FORMAT: "dd/MM/yyyy"

    },


/* ======================================
   APPLICATION STATUS
====================================== */

    STATUS: {

        ACTIVE: 1,

        INACTIVE: 0

    },


/* ======================================
   MESSAGE
====================================== */

    MESSAGE: {

        NETWORK_ERROR:
            "Koneksi internet bermasalah.",

        SERVER_ERROR:
            "Server sedang mengalami gangguan.",

        SESSION_EXPIRED:
            "Sesi telah berakhir. Silakan login kembali.",

        UNKNOWN_ERROR:
            "Terjadi kesalahan."

    }

};