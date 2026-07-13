// ==========================================
// FMC BROILER MOBILE V8
// APP.JS
// ==========================================

let currentPage = "dashboard";

// ==========================================
// MENAMPILKAN HALAMAN
// ==========================================

async function showPage(page){

    currentPage = page;

    const pages = [
        "dashboard",
        "flok",
        "keuangan",
        "harian",
        "ai"
    ];

    pages.forEach(p=>{

        document.getElementById(p+"Page").style.display="none";

    });

    document.getElementById(page+"Page").style.display="block";

    switch(page){

        case "dashboard":
            if(typeof tampilDashboard==="function"){
                await tampilDashboard();
            }
        break;

        case "flok":
            if(typeof tampilFlok==="function"){
                await tampilFlok();
            }
        break;

        case "keuangan":
            if(typeof tampilKeuangan==="function"){
                await tampilKeuangan();
            }
        break;

        case "harian":
            if(typeof tampilHarian==="function"){
                await tampilHarian();
            }
        break;

        case "ai":
            if(typeof tampilAI==="function"){
                await tampilAI();
            }
        break;

    }

    aktifkanMenu(page);

    updateJam();

}

// ==========================================
// MENU ACTIVE
// ==========================================

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

    document
    .getElementById(tombol[page])
    .classList.add("active");

}

// ==========================================
// STATUS SERVER
// ==========================================

function statusServer(online){

    const el=document.getElementById("statusServer");

    if(!el) return;

    if(online){

        el.innerHTML="🟢 Online";

    }else{

        el.innerHTML="🔴 Offline";

    }

}

// ==========================================
// UPDATE JAM
// ==========================================

function updateJam(){

    const el=document.getElementById("updateTime");

    if(!el) return;

    const now=new Date();

    const jam=String(now.getHours()).padStart(2,"0");
    const menit=String(now.getMinutes()).padStart(2,"0");

    el.innerHTML="Update "+jam+":"+menit;

}

// ==========================================
// SPLASH
// ==========================================

window.onload = async function(){

    try{

        updateJam();

        await showPage("dashboard");

        setTimeout(()=>{

            const splash=document.getElementById("splash");

            if(splash){

                splash.classList.add("hide");

                setTimeout(()=>{

                    splash.remove();

                },700);

            }

        },800);

    }catch(err){

        console.error(err);

        alert(err.message);

    }

}

// ==========================================
// AUTO REFRESH
// ==========================================

setInterval(async()=>{

    await showPage(currentPage);

},30000);

// ==========================================
// CEK INTERNET
// ==========================================

window.addEventListener("online",()=>{

    statusServer(true);

});

window.addEventListener("offline",()=>{

    statusServer(false);

});

statusServer(navigator.onLine);
showUpdateToast("Tes Notifikasi FMC");
// ==========================================
// UPDATE TOAST
// ==========================================

function showUpdateToast(text){

    const toast = document.getElementById("updateToast");

    if(!toast) return;

    toast.innerHTML = "📢 " + text;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },4000);

}

// ==========================================
// INSTALL PWA
// ==========================================

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    const btn = document.getElementById("installBtn");

    if(btn){
        btn.style.display = "block";
    }

});

async function installApp(){

    if(!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

    const btn = document.getElementById("installBtn");

    if(btn){
        btn.style.display = "none";
    }

}