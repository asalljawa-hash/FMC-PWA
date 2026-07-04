// ==========================================
// FMC BROILER MOBILE V6
// APP ENGINE
// ==========================================

let currentPage = "dashboard";

// ==========================
// Daftar Halaman
// ==========================

const pages = [
    "dashboard",
    "flok",
    "keuangan",
    "harian",
    "ai"
];

// ==========================
// Loader Halaman
// ==========================

const pageLoader = {

    dashboard: tampilDashboard,
    flok: tampilFlok,
    keuangan: tampilKeuangan,
    harian: tampilHarian,
    ai: tampilAI

};

// ==========================
// Menampilkan Halaman
// ==========================

async function showPage(page){

    currentPage = page;

    pages.forEach(name=>{

        const el=document.getElementById(name+"Page");

        if(el){

            el.hidden=true;

        }

    });

    const active=document.getElementById(page+"Page");

    if(active){

        active.hidden=false;

    }

    aktifkanMenu(page);

    if(typeof pageLoader[page]==="function"){

        await pageLoader[page]();

    }

}

// ==========================
// Bottom Navigation
// ==========================

function aktifkanMenu(page){

    document
    .querySelectorAll(".bottomNav button")
    .forEach(btn=>btn.classList.remove("active"));

    const tombol={

        dashboard:"btnDashboard",
        flok:"btnFlok",
        keuangan:"btnKeuangan",
        harian:"btnHarian",
        ai:"btnAI"

    };

    const btn=document.getElementById(tombol[page]);

    if(btn){

        btn.classList.add("active");

    }

}

// ==========================
// Splash Screen
// ==========================

document.addEventListener("DOMContentLoaded",()=>{

    setTimeout(async()=>{

        document
        .getElementById("splash")
        .classList.add("hide");

        await showPage("dashboard");

    },1500);

});

// ==========================
// Auto Refresh
// ==========================

setInterval(async()=>{

    if(document.hidden){

        return;

    }

    await showPage(currentPage);

},30000);