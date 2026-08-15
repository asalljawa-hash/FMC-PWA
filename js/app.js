// ==========================================
// MENAMPILKAN HALAMAN
// ==========================================

let currentPage = "dashboard";


async function showPage(page){

    currentPage = page;


// ==========================================
// DAFTAR HALAMAN
// ==========================================

const pages = [
    "dashboard",
    "flok",
    "keuangan",
    "harian",
    "rhpp",
    "ai",
    "docin",
    "pakan",
    "operasional",
    "masterKontrak",
    "ovk",
    "planpanen",
    "inputflok",
    "realisasipanen"
];


// ==========================================
// SEMBUNYIKAN SEMUA HALAMAN
// ==========================================

pages.forEach(p => {

    /*
     * Semua halaman menggunakan:
     *
     * namaPage
     *
     * KECUALI:
     *
     * inputflok
     *      ↓
     * inputFlokPage
     *
     * realisasipanen
     *      ↓
     * realisasiPanenPage
     */

    const pageId =
        p === "inputflok"
            ? "inputFlokPage"
            : p === "realisasipanen"
                ? "realisasiPanenPage"
                : p + "Page";


    const el =
        document.getElementById(
            pageId
        );


    if(el){

        el.style.display =
            "none";

    }

});


// ==========================================
// TENTUKAN HALAMAN AKTIF
// ==========================================

const pageId =
    page === "inputflok"
        ? "inputFlokPage"
        : page === "realisasipanen"
            ? "realisasiPanenPage"
            : page + "Page";


const activePage =
    document.getElementById(
        pageId
    );


if(activePage){

    activePage.style.display =
        "block";

}else{

    console.warn(
        "FMC: Halaman tidak ditemukan:",
        pageId
    );

}


    // ==========================================
    // LOAD HALAMAN
    // ==========================================

    switch(page){


        // ==========================================
        // DASHBOARD
        // ==========================================

        case "dashboard":

            if(
                typeof tampilDashboard ===
                "function"
            ){

                await tampilDashboard();

            }

        break;


        // ==========================================
        // FLOK
        // ==========================================

        case "flok":

            if(
                typeof tampilFlok ===
                "function"
            ){

                await tampilFlok();

            }

        break;


        // ==========================================
        // KEUANGAN
        // ==========================================

        case "keuangan":

            if(
                typeof tampilKeuangan ===
                "function"
            ){

                await tampilKeuangan();

            }

        break;


        // ==========================================
        // HARIAN
        // ==========================================

        case "harian":

            if(
                typeof tampilHarian ===
                "function"
            ){

                await tampilHarian();

            }

        break;


        // ==========================================
        // RHPP
        // ==========================================

        case "rhpp":

            if(
                typeof renderRHPP ===
                "function"
            ){

                await renderRHPP();

            }

        break;


        // ==========================================
        // AI
        // ==========================================

        case "ai":

            if(
                typeof tampilAI ===
                "function"
            ){

                await tampilAI();

            }

        break;


        // ==========================================
        // DOC IN
        // ==========================================

        case "docin":

            if(
                typeof tampilDocIn ===
                "function"
            ){

                await tampilDocIn();

            }

        break;


        // ==========================================
        // PAKAN
        // ==========================================

        case "pakan":

            if(
                typeof tampilPakan ===
                "function"
            ){

                await tampilPakan();

            }

        break;


        // ==========================================
        // OPERASIONAL
        // ==========================================

        case "operasional":

            if(
                typeof tampilOperasional ===
                "function"
            ){

                await tampilOperasional();

            }

        break;


        // ==========================================
        // MASTER KONTRAK
        // ==========================================

        case "masterKontrak":

            if(
                typeof tampilMasterKontrak ===
                "function"
            ){

                await tampilMasterKontrak();

            }

        break;


        // ==========================================
        // OVK
        // ==========================================

        case "ovk":

            if(
                typeof tampilOVK ===
                "function"
            ){

                await tampilOVK();

            }

        break;


        // ==========================================
        // PLAN PANEN
        // ==========================================

        case "planpanen":

            if(
                typeof tampilPlanPanen ===
                "function"
            ){

                await tampilPlanPanen();

            }

        break;
        
// ==========================================
// REALISASI PANEN
// ==========================================

case "realisasipanen":

    if(typeof tampilRealisasiPanen === "function"){
        await tampilRealisasiPanen();
    }

break;

        // ==========================================
        // INPUT FLOK
        // ==========================================

        case "inputflok":

            if(
                typeof tampilInputFlok ===
                "function"
            ){

                await tampilInputFlok();

            }

        break;

    }


    // ==========================================
    // MENU ACTIVE
    // ==========================================

    aktifkanMenu(page);


    // ==========================================
    // UPDATE JAM
    // ==========================================

    updateJam();

}


// ==========================================
// MENU ACTIVE
// ==========================================

function aktifkanMenu(page){

    document
        .querySelectorAll(".bottomNav button")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    const tombol = {

        dashboard:
            "btnDashboard",

        flok:
            "btnFlok",

        keuangan:
            "btnKeuangan",

        harian:
            "btnHarian",

        ai:
            "btnAI"

    };


    const idTombol =
        tombol[page];


    if(!idTombol){

        return;

    }


    const tombolAktif =
        document.getElementById(
            idTombol
        );


    if(tombolAktif){

        tombolAktif.classList.add(
            "active"
        );

    }

}


// ==========================================
// STATUS SERVER
// ==========================================

function statusServer(online){

    const el =
        document.getElementById(
            "statusServer"
        );

    if(!el) return;


    if(online){

        el.innerHTML =
            "🟢 Online";

    }else{

        el.innerHTML =
            "🔴 Offline";

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
// STARTUP FMC
// ==========================================

window.onload = async function () {

    try {

        /* MODE */

        const mode = localStorage.getItem("fmcMode");

        if (mode === "desktop") {

            document.body.classList.add("desktop");

        } else {

            document.body.classList.remove("desktop");

        }

        updateModeIndicator();

        /* THEME */

        loadTheme();

        updateJam();

        await new Promise(resolve =>
            requestAnimationFrame(resolve)
        );

        /* SEMBUNYIKAN SPLASH */

        const splash =
            document.getElementById("splash");

        if (splash) {

            splash.style.display = "none";
            splash.classList.remove("hide");

        }

        /* CEK SESSION */

        if (isLoggedIn()) {

            await autoLogin();

        } else {

            document.getElementById("app").style.display = "none";

            document.getElementById("loginPage").style.display = "flex";

        }

    }

    catch (err) {

        console.error(err);

    }

}
// ==========================================
// AUTO REFRESH
// ==========================================

setInterval(async()=>{

    /*
     * Jangan refresh otomatis saat user
     * sedang berada di halaman input.
     *
     * Tujuannya agar form dan data sesi
     * tidak kembali ke kondisi awal.
     */

    const halamanInput = [

        "docin",
        "pakan",
        "operasional",
        "masterKontrak",
        "ovk",
        "planpanen",
        "inputflok",
        "realisasipanen"

    ];


    if(
        currentPage === "rhpp" ||
        halamanInput.includes(currentPage)
    ){

        return;

    }


    serverData = null;

    await ambilDataServer(true);

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

        serverData = null;

        await ambilDataServer(true);

        await showPage(currentPage);

        updateJam();

        showUpdateToast("Data berhasil diperbarui");

    }catch(err){

        console.error(err);

        showUpdateToast("Gagal memperbarui data");

    }

}

// ==========================================
// SHARE FMC V13
// ==========================================

async function shareText(title, text){

    if(navigator.share){

        try{

            await navigator.share({
                title: title,
                text: text
            });

        }catch(e){
            console.log(e);
        }

    }else{

        await navigator.clipboard.writeText(text);

        showUpdateToast("📋 Teks disalin ke clipboard");

    }

}

async function shareDashboard(){

    const data = await ambilDataServer();

    if(!data) return;

    const farm = data.dashboard.farm;
    const kpi = data.dashboard.kpi;

    const text =

`🐔 *FMC BROILER MOBILE*

📍 *${farm.namaFarm.toUpperCase()}*
📅 Periode : ${farm.periode}
🐣 Chick In : ${farm.chickIn}

━━━━━━━━━━━━━━━━

📦 DOC IN        : ${kpi.docIn} ekor
🐔 Ayam Hidup    : ${kpi.ayamHidup} ekor
💀 Mati          : ${kpi.mati} ekor
🚫 Afkir         : ${kpi.afkir} ekor

📉 Mortalitas    : ${kpi.mortalitas}
📊 Deplesi       : ${kpi.deplesi}
🍗 FCR           : ${kpi.fcr}
🏆 IP            : ${kpi.ip}

━━━━━━━━━━━━━━━━

🤖 Powered by *FMC Broiler Mobile*`;

    shareText("Dashboard FMC", text);

}

async function shareFlok(){

    const data = await ambilDataServer();

    if(!data) return;

    const farm = data.dashboard.farm;
    const flok = data.dashboard.flok || [];

    let text =

`🐔 *DATA FLOK*

📍 *${farm.namaFarm.toUpperCase()}*
📅 Periode : ${farm.periode}

━━━━━━━━━━━━━━━━

`;

    flok.forEach(f=>{

        text +=

`🐓 Flok ${f.nama}

🐔 Hidup        : ${f.hidup} ekor
💀 Mati         : ${f.mati} ekor
📉 Mortalitas   : ${f.mortalitas}
🍗 FCR          : ${f.fcr}
🏆 IP           : ${f.ip}
✅ Status       : ${f.status}

━━━━━━━━━━━━━━━━

`;

    });

    text += "🤖 Powered by *FMC Broiler Mobile*";

    shareText("Data Flok FMC", text);

}

async function shareHarian(){

    const data = await ambilDataServer();

    if(!data) return;

    const farm = data.dashboard.farm;
    const harian = data.harian;

    let text =

`🐔 *LAPORAN HARIAN*

📍 *${farm.namaFarm.toUpperCase()}*
📅 ${harian.tanggal}

━━━━━━━━━━━━━━━━

`;

    harian.flok.forEach(f=>{

        text +=

`🐓 Flok ${f.nama}

💀 Mati Hari Ini: ${f.mati} ekor
📅 Umur         : ${f.umur} Hari
📉 Mortalitas   : ${f.mortalitas}

━━━━━━━━━━━━━━━━

`;

    });

    text +=

`💀 *TOTAL KEMATIAN HARI INI*
${harian.totalMati} Ekor

━━━━━━━━━━━━━━━━

🤖 Powered by *FMC Broiler Mobile*`;

    shareText("Laporan Harian FMC", text);

}

async function shareKeuangan(){

    const data = await ambilDataServer();

    if(!data) return;

    const farm = data.dashboard.farm;
    const k = data.keuangan;

    const text =

`💰 *RINGKASAN KEUANGAN*

📍 *${farm.namaFarm.toUpperCase()}*
📅 Periode : ${farm.periode}

━━━━━━━━━━━━━━━━

📦 Total Ekor Panen : ${k.totalEkor}
⚖️ Total Tonase     : ${k.totalTonase}
🐓 Flok Siap Panen  : ${k.flokPanen}

🍗 Konsumsi Pakan   : ${k.totalPakan} Kg

💵 Biaya Operasional
Rp ${k.biayaOperasional}

📈 Estimasi Omset
Rp ${k.estimasiOmset}

💹 Estimasi Laba
Rp ${k.estimasiLaba}

💰 Profit Owner / Ekor
Rp ${k.profitOwner}

━━━━━━━━━━━━━━━━

🤖 Powered by *FMC Broiler Mobile*`;

    shareText("Keuangan FMC", text);

}

// ==========================================
// CLEAR CACHE V14
// ==========================================

async function clearCache(){

    showDialog(

        `<span class="material-symbols-rounded"
        style="
        font-size:34px;
        color:#0B8F43;
        vertical-align:middle;
        margin-right:8px;
        ">
        cleaning_services
        </span>

        Bersihkan Cache`,

        "Cache aplikasi akan dihapus.<br><br>Apakah Anda yakin ingin melanjutkan?",

        async ()=>{

            try{

                if("caches" in window){

                    const keys = await caches.keys();

                    await Promise.all(
                        keys.map(key=>caches.delete(key))
                    );

                }

                showUpdateToast("✅ Cache berhasil dibersihkan");

                setTimeout(()=>{

                    location.reload();

                },1000);

            }catch(err){

                console.error(err);

                showUpdateToast("❌ Gagal membersihkan cache");

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

        document.body.classList.remove("setting-open");

        settingPanelOpen = false;

    }else{

        panel.classList.add("show");

        document.body.classList.add("setting-open");

        settingPanelOpen = true;

        // Agar tombol Back Android
        // menutup panel terlebih dahulu
        history.pushState(
            {settingPanel:true},
            "",
            location.href
        );

    }

}

// ==========================================
// BACK BUTTON ANDROID
// ==========================================

window.addEventListener("popstate", function(){

    if(settingPanelOpen){

        const panel = document.getElementById("settingPanel");

        if(panel){

            panel.classList.remove("show");

        }

        document.body.classList.remove("setting-open");

        settingPanelOpen = false;

    }

});

// ==========================================
// TUTUP PANEL JIKA AREA LUAR DITEKAN
// ==========================================

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

// ==========================================
// EXIT FMC
// ==========================================

function exitFMC() {

    showDialog(

        "Keluar FMC",

        "Apakah Anda yakin ingin keluar dari FMC Broiler Mobile?",

        function () {

            // Hapus session login
            logoutUser();

            // Tutup panel setting
            const panel =
                document.getElementById("settingPanel");

            if (panel) {

                panel.classList.remove("show");

            }

            document.body.classList.remove(
                "setting-open"
            );

            settingPanelOpen = false;

            // Kembali ke halaman Login
            location.reload();

        }

    );

}
