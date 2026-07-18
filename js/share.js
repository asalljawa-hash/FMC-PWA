// ==========================================
// FMC BROILER MOBILE
// SHARE & EXPORT PDF ENGINE
// V18 PROFESSIONAL
// BAGIAN 1 / 3
// ==========================================

// ==========================================
// GLOBAL
// ==========================================

let shareTextFunction = null;
let exportPdfFunction = null;

// ==========================================
// SHARE TEXT
// ==========================================

async function shareText(title, text){

    try{

        if(navigator.share){

            await navigator.share({

                title: title,

                text: text

            });

        }else{

            await navigator.clipboard.writeText(text);

            showUpdateToast(

                "📋 Teks berhasil disalin"

            );

        }

    }catch(err){

        console.log(err);

    }

}

// ==========================================
// PDF ENGINE
// ==========================================
// ==========================================
// FMC PDF LOGO ENGINE
// ==========================================

let FMC_LOGO = null;

async function loadPdfLogo(){

    if(FMC_LOGO) return FMC_LOGO;

    return new Promise((resolve,reject)=>{

        const img = new Image();

        img.onload = function(){

            FMC_LOGO = img;

            resolve(img);

        };

        img.onerror = reject;

        img.src = "icons/logo-fmc.png";

    });

}

const { jsPDF } = window.jspdf;

// ==========================================
// PDF ENGINE V19 PROFESSIONAL
// BAGIAN 1A
// ==========================================

const PDF_THEME = {

    primary:[11,143,67],
    secondary:[18,120,56],
    accent:[34,197,94],

    dark:[38,50,56],
    gray:[120,120,120],
    light:[245,247,250],

    white:[255,255,255]

};

// ==========================================
// FORMAT TANGGAL
// ==========================================

function pdfDateTime(){

    return new Date().toLocaleString(
        "id-ID",
        {
            day:"2-digit",
            month:"long",
            year:"numeric",
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}

// ==========================================
// REPORT ID
// ==========================================

function createReportID(){

    const d = new Date();

    return "FMC-"
        + d.getFullYear()
        + String(d.getMonth()+1).padStart(2,"0")
        + String(d.getDate()).padStart(2,"0")
        + "-"
        + d.getHours()
        + d.getMinutes()
        + d.getSeconds();

}

// ==========================================
// FMC LOGO PREMIUM
// ==========================================

function drawPdfLogo(pdf, x, y){

    // Bayangan tipis
    pdf.setFillColor(220,220,220);
    pdf.circle(x+9.4, y+9.4, 9.2, "F");

    // Lingkaran utama
    pdf.setFillColor(11,143,67);
    pdf.circle(x+9, y+9, 9, "F");

    // Ring luar
    pdf.setDrawColor(255,255,255);
    pdf.setLineWidth(0.9);
    pdf.circle(x+9, y+9, 8.2);

    // Ring dalam
    pdf.setLineWidth(0.4);
    pdf.circle(x+9, y+9, 6.8);

    // Tulisan FMC
    pdf.setTextColor(255,255,255);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(11);

    pdf.text(
        "FMC",
        x+9,
        y+10.3,
        {
            align:"center"
        }
    );

}

// ==========================================
// HEADER BACKGROUND
// ==========================================

function drawHeaderBackground(pdf){

    const p = PDF_THEME.primary;
    const s = PDF_THEME.secondary;

    pdf.setFillColor(...p);

    pdf.rect(
        0,
        0,
        210,
        30,
        "F"
    );

    pdf.setFillColor(...s);

    pdf.rect(
        0,
        30,
        210,
        2,
        "F"
    );

}

// ==========================================
// EXPORT DASHBOARD PDF
// ==========================================

async function exportDashboardPDF(){

    try{

        showUpdateToast(

            "📄 Membuat PDF..."

        );

        const data = await ambilDataServer();

        if(!data){

            showUpdateToast(

                "Data tidak tersedia"

            );

            return;

        }

        const kpi = data.dashboard.kpi;

        const pdf = new jsPDF({

            orientation:"portrait",

            unit:"mm",

            format:"a4"

        });

        createPdfHeader(
    pdf,
    "Dashboard Produksi",
    data.dashboard.farm.namaFarm
);

let y = drawDashboardKPI(pdf, kpi);

        createPdfFooter(pdf);

        pdf.save(

            "Dashboard_FMC.pdf"

        );

        showUpdateToast(

            "✅ PDF berhasil dibuat"

        );

    }catch(err){

        console.error(err);

        showUpdateToast(

            "❌ "+err.message

        );

    }

}

// ==========================================
// HEADER PDF V19.1 PROFESSIONAL
// ==========================================

function createPdfHeader(pdf, title, farmName = ""){

    // Background Header
    drawHeaderBackground(pdf);

    // Logo FMC
    drawPdfLogo(pdf,10,4);

    // Nama Aplikasi
    pdf.setTextColor(...PDF_THEME.white);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(18);

    pdf.text(
        "FMC BROILER MOBILE",
        35,
        12
    );

    // Sub Judul
    pdf.setFont("helvetica","normal");
    pdf.setFontSize(8);

    pdf.text(
        "Farm Management Control System",
        35,
        17
    );

    // Nama Farm
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(11);

    pdf.text(
        farmName || "-",
        35,
        24
    );

    // ==========================================
    // REPORT INFO BOX
    // ==========================================

    pdf.setFillColor(250,250,250);
    pdf.setDrawColor(...PDF_THEME.white);
    pdf.setLineWidth(0.3);

    pdf.roundedRect(
        143,
        5,
        53,
        20,
        2,
        2,
        "FD"
    );

    // Judul Box
    pdf.setTextColor(...PDF_THEME.primary);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(7);

    pdf.text(
        "REPORT INFO",
        169.5,
        9,
        {align:"center"}
    );

    // Isi Box
    pdf.setTextColor(...PDF_THEME.dark);
    pdf.setFont("helvetica","normal");
    pdf.setFontSize(6.5);

    pdf.text(
        "Generated : " + pdfDateTime(),
        146,
        13
    );

    pdf.text(
        "Report ID : " + createReportID(),
        146,
        17
    );

    pdf.text(
        "Version : V19.1 Professional",
        146,
        21
    );

    // ==========================================
    // JUDUL HALAMAN
    // ==========================================

    pdf.setTextColor(...PDF_THEME.dark);

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(17);

    pdf.text(
        title.toUpperCase(),
        20,
        42
    );

    // Subtitle
    pdf.setTextColor(...PDF_THEME.gray);

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(8);

    pdf.text(
        "Generated automatically by FMC Analytics Engine",
        20,
        47
    );

    // Garis utama
    pdf.setDrawColor(...PDF_THEME.primary);
    pdf.setLineWidth(0.9);

    pdf.line(
        20,
        50,
        190,
        50
    );

    // Garis tipis
    pdf.setDrawColor(225);
    pdf.setLineWidth(0.25);

    pdf.line(
        20,
        51.5,
        190,
        51.5
    );

}

// ==========================================
// KPI CARD ENGINE V19 PROFESSIONAL
// BAGIAN 2B
// ==========================================

function drawKpiCard(
    pdf,
    x,
    y,
    w,
    h,
    title,
    value,
    color = PDF_THEME.primary
){

    // Shadow
    pdf.setFillColor(235,238,240);
    pdf.roundedRect(
        x + 0.8,
        y + 0.8,
        w,
        h,
        3,
        3,
        "F"
    );

    // Card
    pdf.setFillColor(255,255,255);
    pdf.roundedRect(
        x,
        y,
        w,
        h,
        3,
        3,
        "F"
    );

    // Border kiri
    pdf.setFillColor(...color);
    pdf.roundedRect(
        x,
        y,
        3,
        h,
        2,
        2,
        "F"
    );

    // Judul KPI
    pdf.setTextColor(...PDF_THEME.gray);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(8);

    pdf.text(
        title,
        x + 6,
        y + 7
    );

    // Nilai KPI
    pdf.setTextColor(...PDF_THEME.dark);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(16);

    pdf.text(
        String(value ?? "-"),
        x + 6,
        y + 17
    );

}

// ==========================================
// DRAW KPI GRID
// ==========================================

function drawDashboardKPI(pdf, kpi){

    const cardW = 82;
    const cardH = 22;

    const left = 20;
    const right = 108;

    let y = 58;

    drawKpiCard(
        pdf,
        left,
        y,
        cardW,
        cardH,
        "DOC IN",
        kpi.docIn
    );

    drawKpiCard(
        pdf,
        right,
        y,
        cardW,
        cardH,
        "AYAM HIDUP",
        kpi.ayamHidup
    );

    y += 27;

    drawKpiCard(
        pdf,
        left,
        y,
        cardW,
        cardH,
        "MORTALITAS",
        kpi.mortalitas
    );

    drawKpiCard(
        pdf,
        right,
        y,
        cardW,
        cardH,
        "DEPLESI",
        kpi.deplesi
    );

    y += 27;

    drawKpiCard(
        pdf,
        left,
        y,
        cardW,
        cardH,
        "FCR GLOBAL",
        kpi.fcr
    );

    drawKpiCard(
        pdf,
        right,
        y,
        cardW,
        cardH,
        "IP GLOBAL",
        kpi.ip
    );

    return y + 30;

}

// ==========================================
// FOOTER PDF
// ==========================================

function createPdfFooter(pdf){

    pdf.setDrawColor(220);

    pdf.line(
        20,
        285,
        190,
        285
    );

    pdf.setTextColor(140);

    pdf.setFont(
        "helvetica",
        "italic"
    );

    pdf.setFontSize(7);

    pdf.text(
        "Powered by FMC Broiler Mobile",
        190,
        291,
        {align:"right"}
    );

    pdf.setFontSize(6);

    pdf.text(
        "Farm Management Control System",
        190,
        295,
        {align:"right"}
    );

}

// ==========================================
// BAGIAN 2 / 3
// DIALOG SHARE
// ==========================================

function openShareDialog(textFunc,pdfFunc){

    shareTextFunction = textFunc;
    exportPdfFunction = pdfFunc;

    const dialog = document.getElementById("shareDialog");

    const btnText = document.getElementById("btnShareText");

    const btnPdf = document.getElementById("btnShareImage");

    if(btnText){

        btnText.onclick = async()=>{

            closeShareDialog();

            if(shareTextFunction){

                await shareTextFunction();

            }

        };

    }

    if(btnPdf){

        btnPdf.onclick = async()=>{

            closeShareDialog();

            if(exportPdfFunction){

                await exportPdfFunction();

            }

        };

    }

    if(dialog){

        dialog.classList.add("show");

    }

}

// ==========================================
// TUTUP DIALOG
// ==========================================

function closeShareDialog(){

    const dialog = document.getElementById("shareDialog");

    if(dialog){

        dialog.classList.remove("show");

    }

}

// ==========================================
// UTIL
// ==========================================

function showExportProgress(){

    showUpdateToast(

        "📄 Membuat file PDF..."

    );

}

function exportNotReady(){

    showUpdateToast(

        "Export PDF sedang disiapkan"

    );

}

// ==========================================
// COMPATIBILITY
// ==========================================

// Fungsi lama tetap ada supaya dashboard.js,
// flok.js, harian.js dan keuangan.js
// tidak error sampai kita edit satu per satu.

async function shareDashboardImage(){

    return await exportDashboardPDF();

}

async function shareFlokImage(){

    return await exportFlokPDF();

}

async function shareHarianImage(){

    return await exportHarianPDF();

}

async function shareKeuanganImage(){

    return await exportKeuanganPDF();

}

// ==========================================
// EXPORT PDF FLOK
// ==========================================

async function exportFlokPDF(){

    try{

        showUpdateToast("📄 Membuat PDF Flok...");

        const data = await ambilDataServer();

        if(!data){

            showUpdateToast("Data tidak tersedia");

            return;

        }

        const flok = data.dashboard.flok || [];

        if(flok.length===0){

            showUpdateToast("Data Flok kosong");

            return;

        }

        const pdf = new jsPDF({

            orientation:"portrait",

            unit:"mm",

            format:"a4"

        });

        createPdfHeader(

            pdf,

            "Laporan Flok",

            data.dashboard.farm.namaFarm

        );

        // Card Summary FLOK
        let y = drawFlokSummary(pdf, flok);

        createPdfFooter(pdf);

        pdf.save("Flok_FMC.pdf");

        showUpdateToast("✅ PDF Flok berhasil dibuat");

    }catch(err){

        console.error(err);

        showUpdateToast("❌ " + err.message);

    }

}

// ==========================================
// FLOK CARD V19 PROFESSIONAL
// ==========================================

function drawFlokCard(pdf, x, y, w, h, f){

    let color = PDF_THEME.primary;

    if((f.status || "").toUpperCase() === "PANEN"){
        color = [34,197,94];
    }else if((f.status || "").toUpperCase() === "BERJALAN"){
        color = [245,158,11];
    }else if((f.status || "").toUpperCase() === "BELUM"){
        color = PDF_THEME.primary;
    }else{
        color = [239,68,68];
    }

    // Shadow
    pdf.setFillColor(235,238,240);
    pdf.roundedRect(x+0.8,y+0.8,w,h,3,3,"F");

    // Card
    pdf.setFillColor(255,255,255);
    pdf.roundedRect(x,y,w,h,3,3,"F");

    // Border kiri
    pdf.setFillColor(...color);
    pdf.roundedRect(x,y,3,h,2,2,"F");

    pdf.setTextColor(...PDF_THEME.dark);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(10);
    pdf.text("FLOK " + f.nama, x+6, y+7);

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(8);

    pdf.text("Hidup : " + f.hidup, x+6, y+14);
    pdf.text("Mort : " + f.mortalitas, x+6, y+20);
    pdf.text("FCR : " + f.fcr, x+40, y+14);
    pdf.text("IP : " + f.ip, x+40, y+20);

    pdf.setFont("helvetica","bold");
    pdf.setTextColor(...color);
    pdf.text(f.status || "-", x+6, y+28);

}

// ==========================================
// FLOK SUMMARY GRID
// BAGIAN 3B
// ==========================================

function drawFlokSummary(pdf, flok){

    const cardW = 82;
    const cardH = 34;

    const left = 20;
    const right = 108;

    let y = 58;

    if(flok[0]){
        drawFlokCard(
            pdf,
            left,
            y,
            cardW,
            cardH,
            flok[0]
        );
    }

    if(flok[1]){
        drawFlokCard(
            pdf,
            right,
            y,
            cardW,
            cardH,
            flok[1]
        );
    }

    y += 40;

    if(flok[2]){
        drawFlokCard(
            pdf,
            left,
            y,
            cardW,
            cardH,
            flok[2]
        );
    }

    if(flok[3]){
        drawFlokCard(
            pdf,
            right,
            y,
            cardW,
            cardH,
            flok[3]
        );
    }

    return y + 45;

}


// ==========================================
// HARIAN KPI SUMMARY
// ==========================================

function drawHarianSummary(pdf, harian){

    drawKpiCard(
        pdf,
        20,
        58,
        82,
        26,
        "TANGGAL",
        harian.tanggal || "-"
    );

    drawKpiCard(
        pdf,
        108,
        58,
        82,
        26,
        "TOTAL MATI",
        (harian.totalMati || 0) + " Ekor"
    );

    return 95;

}

// ==========================================
// KEUANGAN KPI SUMMARY
// ==========================================

function drawKeuanganSummary(pdf, k){

    drawKpiCard(
        pdf,
        20,
        58,
        82,
        26,
        "PAKAN",
        (k.totalPakan || 0) + " Kg"
    );

    drawKpiCard(
        pdf,
        108,
        58,
        82,
        26,
        "BIAYA",
        "Rp " + (k.biayaOperasional || 0)
    );

    drawKpiCard(
        pdf,
        20,
        90,
        82,
        26,
        "OMSET",
        "Rp " + (k.estimasiOmset || 0)
    );

    drawKpiCard(
        pdf,
        108,
        90,
        82,
        26,
        "LABA",
        "Rp " + (k.estimasiLaba || 0)
    );

    return 128;

}

// ==========================================
// EXPORT PDF HARIAN
// ==========================================

async function exportHarianPDF(){

    try{

        showUpdateToast("📄 Membuat PDF Harian...");

        const data = await ambilDataServer();

        if(!data){

            showUpdateToast("Data tidak tersedia");

            return;

        }

        const harian = data.harian;

        if(!harian){

            showUpdateToast("Data Harian kosong");

            return;

        }

        const pdf = new jsPDF({

            orientation:"portrait",

            unit:"mm",

            format:"a4"

        });

        createPdfHeader(

            pdf,

            "Laporan Harian",

            data.dashboard.farm.namaFarm

        );

        let y = drawHarianSummary(pdf, harian);

        pdf.setFont("helvetica","bold");
        pdf.setFontSize(12);
        pdf.setTextColor(...PDF_THEME.dark);

        pdf.text(

            "DETAIL HARIAN",

            20,

            y

        );

        y += 8;

        harian.flok.forEach(f=>{

            pdf.setFont("helvetica","bold");

            pdf.text(

                "FLOK " + f.nama,

                20,

                y

            );

            y += 6;

            pdf.setFont("helvetica","normal");

            pdf.text(

                "Umur : " + f.umur + " Hari",

                25,

                y

            );

            y += 5;

            pdf.text(

                "Mati : " + f.mati,

                25,

                y

            );

            y += 5;

            pdf.text(

                "Mortalitas : " + f.mortalitas,

                25,

                y

            );

            y += 8;

            if(y > 260){

                createPdfFooter(pdf);

                pdf.addPage();

                createPdfHeader(

                    pdf,

                    "Laporan Harian",

                    data.dashboard.farm.namaFarm

                );

                y = 55;

            }

        });

        createPdfFooter(pdf);

        pdf.save("Harian_FMC.pdf");

        showUpdateToast("✅ PDF Harian berhasil dibuat");

    }catch(err){

        console.error(err);

        showUpdateToast("❌ " + err.message);

    }

}

// ==========================================
// EXPORT PDF KEUANGAN
// ==========================================

async function exportKeuanganPDF(){

    try{

        showUpdateToast("📄 Membuat PDF Keuangan...");

        const data = await ambilDataServer();

        if(!data){

            showUpdateToast("Data tidak tersedia");

            return;

        }

        const k = data.keuangan;

        if(!k){

            showUpdateToast("Data Keuangan kosong");

            return;

        }

        const pdf = new jsPDF({

            orientation:"portrait",

            unit:"mm",

            format:"a4"

        });

        createPdfHeader(

            pdf,

            "Laporan Keuangan",

            data.dashboard.farm.namaFarm

        );

        let y = drawKeuanganSummary(pdf, k);

        pdf.setFont("helvetica","bold");
        pdf.setFontSize(12);
        pdf.setTextColor(...PDF_THEME.dark);

        pdf.text(

            "RINGKASAN PRODUKSI & KEUANGAN",

            20,

            y

        );

        y += 8;

        pdf.setFont("helvetica","normal");
        pdf.setFontSize(10);

        pdf.text("Total Ekor Panen : " + k.totalEkor,20,y); y+=6;
        pdf.text("Total Tonase : " + k.totalTonase,20,y); y+=6;
        pdf.text("Flok Siap Panen : " + k.flokPanen,20,y); y+=6;
        pdf.text("BB Tertinggi : " + k.bbTertinggi,20,y); y+=6;
        pdf.text("Umur Tertua : " + k.umurTertua,20,y); y+=6;
        pdf.text("Flok Terbaik : " + k.flokTerbaik,20,y); y+=6;
        pdf.text("Konsumsi Pakan : " + k.totalPakan + " Kg",20,y); y+=6;
        pdf.text("Biaya Operasional : Rp " + k.biayaOperasional,20,y); y+=6;
        pdf.text("Estimasi Omset : Rp " + k.estimasiOmset,20,y); y+=6;
        pdf.text("Cost / Ekor : " + (k.costEkor || "-"),20,y); y+=6;
        pdf.text("Cost / Kg : " + (k.costKg || "-"),20,y); y+=6;
        pdf.text("Margin Produksi : " + (k.marginProduksi || "-"),20,y); y+=6;
        pdf.text("Bonus Kematian : Rp " + (k.bonusKematian || "0"),20,y); y+=6;
        pdf.text("Bonus Pasar : Rp " + (k.bonusPasar || "0"),20,y); y+=8;

        pdf.setFont("helvetica","bold");

        pdf.text(

            "Estimasi Laba : Rp " + k.estimasiLaba,

            20,

            y

        );

        y += 7;

        pdf.text(

            "Profit Owner / Ekor : Rp " + (k.profitOwner || "-"),

            20,

            y

        );

        createPdfFooter(pdf);

        pdf.save("Keuangan_FMC.pdf");

        showUpdateToast("✅ PDF Keuangan berhasil dibuat");

    }catch(err){

        console.error(err);

        showUpdateToast("❌ " + err.message);

    }

}