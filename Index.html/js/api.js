// ======================================
// FMC BROILER MOBILE V5
// api.js
// ======================================

// true  = memakai data lokal (Acode)
// false = memakai Google Apps Script
const DEVELOPMENT = true;

const API_URL = "https://script.google.com/macros/s/AKfycbz-aTY1geCXwtz0MibQKVP5k0bUsLHRIlHVKItkcuqb0i_-ByZZ24n6fGGVXPsHYSff/exec?api=data";

// ======================================
// DATA DEVELOPMENT
// ======================================

const DEV_DATA = {

    dashboard: {

        farm: {
            namaFarm: "Pradani Farm",
            chickIn: "30/06/2026",
            periode: "8"
        },

        kpi: {
            docIn: "39.000,00",
            ayamHidup: "38.813",
            mati: "187",
            afkir: "0",
            mortalitas: "0,48%",
            deplesi: "0,48%",
            fcr: "0,68",
            ip: "416,72"
        },

        flok: [

            {
                nama: "A",
                hidup: "12937",
                mortalitas: "0,48%",
                bb: "0,085",
                fcr: "0,68",
                ip: "413,41",
                status: "BELUM"
            },

            {
                nama: "B",
                hidup: "12933",
                mortalitas: "0,52%",
                bb: "0,085",
                fcr: "0,68",
                ip: "413,15",
                status: "BELUM"
            },

            {
                nama: "C",
                hidup: "12933",
                mortalitas: "0,44%",
                bb: "0,086",
                fcr: "0,67",
                ip: "423,59",
                status: "BELUM"
            },

            {
                nama: "D",
                hidup: "0",
                mortalitas: "-",
                bb: "-",
                fcr: "-",
                ip: "-",
                status: "BELUM"
            }

        ]

    },

    harian: {

        tanggal: "03/07/2026",

        totalMati: "59",

        flok: [

            {
                nama: "A",
                umur: "3",
                mati: "21",
                mortalitas: "0,48%"
            },

            {
                nama: "B",
                umur: "3",
                mati: "23",
                mortalitas: "0,52%"
            },

            {
                nama: "C",
                umur: "3",
                mati: "15",
                mortalitas: "0,44%"
            },

            {
                nama: "D",
                umur: "0",
                mati: "0",
                mortalitas: "-"
            }

        ]

    },

    waktu: "03/07/2026 12:00"

};

// ======================================
// AMBIL DATA
// ======================================

async function ambilDataServer() {

    if (DEVELOPMENT) {

        console.log("MODE DEVELOPMENT");

        return DEV_DATA;

    }

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {

            throw new Error("HTTP " + response.status);

        }

        const data = await response.json();

        console.log("MODE ONLINE");

        return data;

    } catch (e) {

        console.error(e);

        return DEV_DATA;

    }

}