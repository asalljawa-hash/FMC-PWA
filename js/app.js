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

        /* MODE */

        const mode = localStorage.getItem("fmcMode");

        if(mode==="desktop"){

            document.body.classList.add("desktop");

        }else{

            document.body.classList.remove("desktop");

        }

        updateModeIndicator();

        /* THEME */

        loadTheme();

        updateJam();

        /* Tunggu browser selesai menghitung layout */

        await new Promise(resolve=>requestAnimationFrame(resolve));

        /* Baru render dashboard */

        await showPage("dashboard");

        /* Splash */

        setTimeout(()=>{

            const splash=document.getElementById("splash");

            if(splash){

                splash.classList.add("hide");

                setTimeout(()=>{

                    splash.remove();

                },700);

            }

        },500);

    }catch(err){

        console.error(err);

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
// REFRESH DATA V13
// ==========================================

async function refreshData(){

    try{

        await showPage(currentPage);

        updateJam();

        showUpdateToast("Data berhasil diperbarui");

    }catch(err){

        console.error(err);

        showUpdateToast("Gagal memperbarui data");

    }

}

// ==========================================
// CLEAR CACHE V13
// ==========================================

async function clearCache(){

    showDialog(

        "🧹 Bersihkan Cache",

        "Cache aplikasi akan dihapus.<br><br>Apakah Anda yakin ingin melanjutkan?",

        async ()=>{

            try{

                if("caches" in window){

                    const keys = await caches.keys();

                    await Promise.all(
                        keys.map(key=>caches.delete(key))
                    );

                }

                showUpdateToast("🧹 Cache berhasil dibersihkan");

                setTimeout(()=>{

                    location.reload();

                },1000);

            }catch(err){

                console.error(err);

                showUpdateToast("Gagal membersihkan cache");

            }

        }

    );

}

// ==========================================
// ABOUT PANEL V13 FINAL
// ==========================================

function showAbout(){

    const panel = document.getElementById("aboutPanel");

    if(!panel){
        return;
    }

    panel.classList.add("show");

}

function closeAbout(){

    const panel = document.getElementById("aboutPanel");

    if(!panel){
        return;
    }

    panel.classList.remove("show");

}

// ==========================================
// FMC DIALOG V13
// ==========================================

let dialogCallback = null;

function showDialog(title, message, callback){

    document.getElementById("dialogTitle").innerHTML = title;
    document.getElementById("dialogMessage").innerHTML = message;

    dialogCallback = callback;

    document
        .getElementById("fmcDialog")
        .classList.add("show");

}

function closeDialog(){

    document
        .getElementById("fmcDialog")
        .classList.remove("show");

}

window.addEventListener("load", () => {

    const dialogOk = document.getElementById("dialogOk");

    if(!dialogOk) return;

    dialogOk.onclick = function(){

        closeDialog();

        if(dialogCallback){

            dialogCallback();

        }

    };

});

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

// ==========================================
// SETTING PANEL V12
// ==========================================

let settingPanelOpen = false;

function toggleSettingPanel(){

    const panel = document.getElementById("settingPanel");

    if(!panel) return;

    if(settingPanelOpen){

        panel.classList.remove("show");
        settingPanelOpen = false;

    }else{

        panel.classList.add("show");
        settingPanelOpen = true;

    }

}

// Tutup panel jika area luar ditekan

document.addEventListener("click", function(e){

    const panel = document.getElementById("settingPanel");
    const fab = document.getElementById("fabSetting");

    if(!panel || !fab) return;

    if(settingPanelOpen){

        if(
            !panel.contains(e.target) &&
            !fab.contains(e.target)
        ){

            panel.classList.remove("show");
            document.body.classList.remove("setting-open");

            settingPanelOpen = false;

        }

    }

});

// ==========================================
// MODE MOBILE / DESKTOP V12
// ==========================================

function setMobileMode(){

    document.body.classList.remove("desktop");

    localStorage.setItem("fmcMode","mobile");

    updateModeIndicator();

}

function setDesktopMode(){

    document.body.classList.add("desktop");

    localStorage.setItem("fmcMode","desktop");

    updateModeIndicator();

}

// Memuat mode terakhir saat aplikasi dibuka

// ==========================================
// UPDATE MODE INDICATOR
// ==========================================

function updateModeIndicator(){

    const mobile = document.getElementById("mobileCheck");
    const desktop = document.getElementById("desktopCheck");

    if(!mobile || !desktop) return;

    mobile.classList.remove("modeActive");
    desktop.classList.remove("modeActive");

    if(document.body.classList.contains("desktop")){

        desktop.classList.add("modeActive");

    }else{

        mobile.classList.add("modeActive");

    }

}

// ==========================================
// DARK MODE V12
// ==========================================

function toggleDarkMode(){

    document.body.classList.toggle("dark");

    const darkCheck = document.getElementById("darkModeCheck");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("fmcTheme","dark");

        if(darkCheck){
            darkCheck.classList.add("modeActive");
        }

    }else{

        localStorage.setItem("fmcTheme","light");

        if(darkCheck){
            darkCheck.classList.remove("modeActive");
        }

    }

}

// ==========================================
// LOAD THEME
// ==========================================

function loadTheme(){

    const theme = localStorage.getItem("fmcTheme");

    const darkCheck = document.getElementById("darkModeCheck");

    if(theme==="dark"){

        document.body.classList.add("dark");

        if(darkCheck){
            darkCheck.classList.add("modeActive");
        }

    }else{

        document.body.classList.remove("dark");

        if(darkCheck){
            darkCheck.classList.remove("modeActive");
        }

    }

}