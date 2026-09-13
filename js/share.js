// ==========================================
// FMC BROILER MOBILE
// SHARE & EXPORT PDF ENGINE
// V19.2 PROFESSIONAL
// PWA + ANDROID SHARE READY
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

        // ==========================================
        // APK ANDROID — CAPACITOR NATIVE SHARE
        // ==========================================
        const capacitor = window.Capacitor;
        const nativeShare = capacitor?.Plugins?.Share;

        if(
            capacitor?.isNativePlatform?.() &&
            nativeShare?.share
        ){
            await nativeShare.share({
                title: title,
                text: text,
                dialogTitle: "Bagikan laporan FMC"
            });
            return;
        }

        // ==========================================
        // PWA / BROWSER — WEB SHARE API
        // ==========================================
        if(
            typeof navigator !== "undefined" &&
            typeof navigator.share === "function"
        ){
            await navigator.share({
                title: title,
                text: text
            });
            return;
        }

        // ==========================================
        // FALLBACK — CLIPBOARD
        // ==========================================
        if(
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ){
            await navigator.clipboard.writeText(text);
            showUpdateToast(
                "📋 Teks berhasil disalin"
            );
            return;
        }

        showUpdateToast(
            "⚠️ Fitur share tidak tersedia"
        );

    }catch(err){

        // Cancel dari dialog share bukan error aplikasi.
        if(err?.name === "AbortError") return;

        console.error("FMC SHARE ERROR:", err);

        // Jika native share gagal, coba Web Share sebagai fallback.
        try{
            if(
                typeof navigator !== "undefined" &&
                typeof navigator.share === "function"
            ){
                await navigator.share({
                    title: title,
                    text: text
                });
                return;
            }
        }catch(fallbackErr){
            if(fallbackErr?.name === "AbortError") return;
            console.error("FMC WEB SHARE FALLBACK ERROR:", fallbackErr);
        }

        try{
            if(
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ){
                await navigator.clipboard.writeText(text);
                showUpdateToast(
                    "📋 Share gagal — teks disalin"
                );
                return;
            }
        }catch(copyErr){
            console.error("FMC CLIPBOARD ERROR:", copyErr);
        }

        showUpdateToast(
            "❌ Share gagal. Coba lagi."
        );

    }

}

// ==========================================
// PDF ENGINE
// ==========================================

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
// FORMAT ANGKA PDF — V19.2
// Tampilan Indonesia: 1.234,56 / Rp 1.234.567
// Tidak mengubah nilai/perhitungan engine.
// ==========================================

const PDF_NUM_LOCALE = "id-ID";

function pdfNumber(value, decimals = 0){
    if(value === null || value === undefined || value === "" || value === "-"){
        return "-";
    }
    const n = Number(value);
    if(!Number.isFinite(n)) return String(value);
    return n.toLocaleString(PDF_NUM_LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function pdfCurrency(value){
    if(value === null || value === undefined || value === "" || value === "-"){
        return "-";
    }
    const n = Number(value);
    if(!Number.isFinite(n)) return "Rp " + String(value);
    return "Rp " + n.toLocaleString(PDF_NUM_LOCALE, {
        maximumFractionDigits: 0
    });
}

function pdfPercent(value, decimals = 2){
    if(value === null || value === undefined || value === "" || value === "-"){
        return "-";
    }
    const n = Number(value);
    if(!Number.isFinite(n)) return String(value);
    // Engine menyimpan mortalitas/deplesi sebagai rasio 0..1.
    return (n * 100).toLocaleString(PDF_NUM_LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }) + "%";
}

function pdfMargin(value){
    if(value === null || value === undefined || value === "" || value === "-"){
        return "-";
    }
    const n = Number(value);
    if(!Number.isFinite(n)) return String(value);
    return pdfPercent(n, 2);
}

function pdfFcr(value){
    return pdfNumber(value, 2);
}

function pdfIp(value){
    return pdfNumber(value, 2);
}

function pdfKg(value, decimals = 2){
    const n = pdfNumber(value, decimals);
    return n === "-" ? "-" : n + " Kg";
}

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
// LOGO ENGINE FMC
// ==========================================

function drawPdfLogo(pdf,x,y){

    const p = PDF_THEME.primary;
    const s = PDF_THEME.secondary;
    const w = PDF_THEME.white;

    // Badge

    pdf.setFillColor(...p);

    pdf.roundedRect(
        x,
        y,
        18,
        18,
        3,
        3,
        "F"
    );

    // Kepala Ayam

    pdf.setFillColor(...w);

    pdf.circle(
        x+9,
        y+9,
        4,
        "F"
    );

    // Paruh

    pdf.setFillColor(255,193,7);

    pdf.triangle(
        x+12,
        y+9,
        x+15,
        y+8,
        x+15,
        y+10,
        "F"
    );

    // Mata

    pdf.setFillColor(0);

    pdf.circle(
        x+10,
        y+8,
        0.35,
        "F"
    );

    // Jengger

    pdf.setFillColor(...s);

    pdf.circle(
        x+7.2,
        y+4.5,
        1,
        "F"
    );

    pdf.circle(
        x+9,
        y+3.6,
        1,
        "F"
    );

    pdf.circle(
        x+10.8,
        y+4.5,
        1,
        "F"
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
// HEADER PDF V19 PROFESSIONAL
// ==========================================

function createPdfHeader(pdf, title, farmName = ""){

    // Background Header
    drawHeaderBackground(pdf);

    // Logo FMC
    drawPdfLogo(pdf,12,6);

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

    // Informasi Report
    pdf.setFont("helvetica","normal");
    pdf.setFontSize(7);

    pdf.text(
        "Generated : " + pdfDateTime(),
        198,
        10,
        {align:"right"}
    );

    pdf.text(
        "Report ID : " + createReportID(),
        198,
        15,
        {align:"right"}
    );

    pdf.text(
        "Version : V19.2 Professional",
        198,
        20,
        {align:"right"}
    );

    // Judul Halaman
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

    // Garis Utama
    pdf.setDrawColor(...PDF_THEME.primary);

    pdf.setLineWidth(0.9);

    pdf.line(
        20,
        50,
        190,
        50
    );

    // Garis Tipis
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
        formatDashboardKpiValue(title, value),
        x + 6,
        y + 17
    );

}

// ==========================================
// FORMAT NILAI KPI DASHBOARD
// ==========================================

function formatDashboardKpiValue(title, value){
    if(value === null || value === undefined || value === "") return "-";

    switch(String(title).toUpperCase()){
        case "DOC IN":
        case "AYAM HIDUP":
            return pdfNumber(value, 0);

        case "MORTALITAS":
        case "DEPLESI":
            return pdfPercent(value, 2);

        case "FCR GLOBAL":
            return pdfFcr(value);

        case "IP GLOBAL":
            return pdfIp(value);

        default:
            return pdfNumber(value, 2);
    }
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

        let y = 55;

        pdf.setFontSize(12);

        pdf.setFont(

            "helvetica",

            "bold"

        );

        pdf.text(

            "DATA FLOK",

            20,

            y

        );

        y += 10;

        flok.forEach(f=>{

            pdf.setFont(

                "helvetica",

                "bold"

            );

            pdf.text(

                "FLOK "+f.nama,

                20,

                y

            );

            y += 7;

            pdf.setFont(

                "helvetica",

                "normal"

            );

            pdf.text(

                "Ayam Hidup : "+pdfNumber(f.hidup,0),

                25,

                y

            );

            y += 6;

            pdf.text(

                "Mati : "+pdfNumber(f.mati,0),

                25,

                y

            );

            y += 6;

            pdf.text(

                "Mortalitas : "+pdfPercent(f.mortalitas,2),

                25,

                y

            );

            y += 6;

            pdf.text(

                "FCR : "+pdfFcr(f.fcr),

                25,

                y

            );

            y += 6;

            pdf.text(

                "IP : "+pdfIp(f.ip),

                25,

                y

            );

            y += 6;

            pdf.text(

                "Status : "+f.status,

                25,

                y

            );

            y += 10;

            if(y>260){

                createPdfFooter(pdf);

                pdf.addPage();

                createPdfHeader(

                    pdf,

                    "Laporan Flok"

                );

                y=55;

            }

        });

        createPdfFooter(pdf);

        pdf.save("Flok_FMC.pdf");

        showUpdateToast("✅ PDF Flok berhasil dibuat");

    }catch(err){

        console.error(err);

        showUpdateToast("❌ "+err.message);

    }

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

        let y = 55;

        pdf.setFont("helvetica","bold");
        pdf.setFontSize(13);

        pdf.text(

            "Tanggal : " + harian.tanggal,

            20,

            y

        );

        y += 10;

        pdf.text(

            "Total Kematian : " + pdfNumber(harian.totalMati,0) + " Ekor",

            20,

            y

        );

        y += 12;

        harian.flok.forEach(f=>{

            pdf.setFont("helvetica","bold");

            pdf.text(

                "FLOK " + f.nama,

                20,

                y

            );

            y += 7;

            pdf.setFont("helvetica","normal");

            pdf.text(

                "Umur : " + pdfNumber(f.umur,0) + " Hari",

                25,

                y

            );

            y += 6;

            pdf.text(

                "Mati : " + pdfNumber(f.mati,0),

                25,

                y

            );

            y += 6;

            pdf.text(

                "Mortalitas : " + pdfPercent(f.mortalitas,2),

                25,

                y

            );

            y += 10;

            if(y > 260){

                createPdfFooter(pdf);

                pdf.addPage();

                createPdfHeader(

                    pdf,

                    "Laporan Harian"

                );

                y = 55;

            }

        });

        createPdfFooter(pdf);

        pdf.save(

            "Harian_FMC.pdf"

        );

        showUpdateToast(

            "✅ PDF Harian berhasil dibuat"

        );

    }

    catch(err){

        console.error(err);

        showUpdateToast(

            "❌ " + err.message

        );

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

        let y = 55;

        pdf.setFont("helvetica","bold");

        pdf.setFontSize(13);

        pdf.text(

            "RINGKASAN PRODUKSI & KEUANGAN",

            20,

            y

        );

        y += 12;

        pdf.setFont("helvetica","normal");

        pdf.text("Total Ekor Panen : "+pdfNumber(k.totalEkor,0),20,y);
        y+=7;

        pdf.text("Total Tonase : "+pdfNumber(k.totalTonase,2)+" Ton",20,y);
        y+=7;

        pdf.text("Flok Siap Panen : "+pdfNumber(k.flokPanen,0),20,y);
        y+=7;

        pdf.text("BB Tertinggi : "+pdfNumber(k.bbTertinggi,2)+" Kg",20,y);
        y+=7;

        pdf.text("Umur Tertua : "+pdfNumber(k.umurTertua,0)+" Hari",20,y);
        y+=7;

        pdf.text("Flok Terbaik : "+k.flokTerbaik,20,y);
        y+=7;

        pdf.text("Konsumsi Pakan : "+pdfNumber(k.totalPakan,0)+" Kg",20,y);
        y+=7;

        pdf.text("Biaya Operasional : "+pdfCurrency(k.biayaOperasional),20,y);
        y+=7;

        pdf.text("Estimasi Omset : "+pdfCurrency(k.estimasiOmset),20,y);
        y+=7;

        pdf.text("Cost / Ekor : "+pdfCurrency(k.costEkor),20,y);
        y+=7;

        pdf.text("Cost / Kg : "+pdfCurrency(k.costKg),20,y);
        y+=7;

        pdf.text("Margin Produksi : "+pdfMargin(k.marginProduksi),20,y);
        y+=7;

        pdf.text("Bonus Kematian : "+pdfCurrency(k.bonusKematian || 0),20,y);
        y+=7;

        pdf.text("Bonus Pasar : "+pdfCurrency(k.bonusPasar || 0),20,y);
        y+=10;

        pdf.setFont("helvetica","bold");

        pdf.text(

            "Estimasi Laba : "+pdfCurrency(k.estimasiLaba),

            20,

            y

        );

        y+=8;

        pdf.text(

            "Profit Owner / Ekor : "+pdfCurrency(k.profitOwner),

            20,

            y

        );

        createPdfFooter(pdf);

        pdf.save("Keuangan_FMC.pdf");

        showUpdateToast("✅ PDF Keuangan berhasil dibuat");

    }

    catch(err){

        console.error(err);

        showUpdateToast("❌ "+err.message);

    }

}