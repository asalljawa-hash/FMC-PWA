// ==========================================
// FMC BROILER MOBILE V5 FINAL
// APP.JS
// ==========================================

let currentPage = "dashboard";

// ==========================
// Menampilkan Halaman
// ==========================

async function showPage(page){

    currentPage = page;

    document.getElementById("dashboardPage").style.display="none";
    document.getElementById("flokPage").style.display="none";
    document.getElementById("keuanganPage").style.display="none";
    document.getElementById("harianPage").style.display="none";
    document.getElementById("aiPage").style.display="none";

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
    alert("AI dipanggil");
    if(typeof tampilAI==="function"){
        await tampilAI();
    }else{
        alert("tampilAI tidak ditemukan");
    }
break;
           }

    aktifkanMenu(page);

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

    if(document.getElementById(tombol[page])){

        document
        .getElementById(tombol[page])
        .classList.add("active");

    }

}

// ==========================
// Splash
// ==========================

window.onload=function(){

    setTimeout(async()=>{

        document
        .getElementById("splash")
        .classList.add("hide");

        await showPage("dashboard");

    },1500);

};

// ==========================
// Auto Refresh
// ==========================

setInterval(async()=>{

    await showPage(currentPage);

},30000);