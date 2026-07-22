// ==========================================
// FMC BROILER MOBILE V12 FINAL
// RHPP PDF
// BAGIAN 1
// ==========================================

async function exportRHPPPDF(){

    const data = serverData || await ambilDataServer();

    if(!data){

        alert("Data RHPP tidak tersedia.");

        return;

    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({

        orientation:"portrait",
        unit:"mm",
        format:"a4"

    });

// ==========================================
// FORMAT ANGKA
// ==========================================

function angka(nilai){

    if(nilai === null || nilai === undefined || nilai === ""){
        return "0";
    }

    const bersih = String(nilai)
        .replace(/Rp/gi,"")
        .replace(/\s/g,"")
        .replace(/\./g,"")
        .replace(/,/g,".");

    const angka = Number(bersih);

    if(isNaN(angka)){
        return String(nilai);
    }

    return angka.toLocaleString("id-ID");

}

function rupiah(nilai){

    if(nilai === null || nilai === undefined || nilai === ""){
        return "Rp 0";
    }

    const bersih = String(nilai)
        .replace(/Rp/gi,"")
        .replace(/\s/g,"")
        .replace(/\./g,"")
        .replace(/,/g,".");

    const angka = Number(bersih);

    if(isNaN(angka)){
        return "Rp " + String(nilai);
    }

    return "Rp " + angka.toLocaleString("id-ID");

}

    // ==========================================
    // DATA
    // ==========================================

    const farm = data.dashboard?.farm || {};

    const kpi = data.dashboard?.kpi || {};

    const ekonomiFlok = data.dashboard?.ekonomiFlok || [];

    // ==========================================
    // HEADER
    // ==========================================

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(20);

    pdf.text(
        "FMC BROILER MOBILE",
        105,
        18,
        {align:"center"}
    );

    pdf.setFontSize(13);

    pdf.text(
        "RINGKASAN HASIL PRODUKSI PETERNAKAN",
        105,
        27,
        {align:"center"}
    );

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(9);

    pdf.text(
        "Laporan Produksi Broiler Terintegrasi",
        105,
        33,
        {align:"center"}
    );

    pdf.setDrawColor(11,143,67);
    pdf.setLineWidth(0.8);

    pdf.line(20,38,190,38);

    // ==========================================
    // INFORMASI FARM
    // ==========================================

    let y = 46;

    pdf.setDrawColor(180);
    pdf.setLineWidth(0.3);

    pdf.roundedRect(
        18,
        y,
        174,
        34,
        2,
        2
    );

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(11);

    pdf.text(
        "INFORMASI FARM",
        22,
        y+7
    );

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(10);

    // kiri

    pdf.text("Nama Farm",22,y+16);
    pdf.text(":",56,y+16);
    pdf.text(String(farm.namaFarm || "-"),60,y+16);

    pdf.text("Periode",22,y+25);
    pdf.text(":",56,y+25);
    pdf.text(String(farm.periode || "-"),60,y+25);

    // kanan

    pdf.text("Chick In",110,y+16);
    pdf.text(":",145,y+16);
    pdf.text(String(farm.chickIn || "-"),149,y+16);

    pdf.text("Tanggal Cetak",110,y+25);
    pdf.text(":",145,y+25);

    pdf.text(

        new Date().toLocaleDateString("id-ID"),

        149,

        y+25

    );

    // ==========================================
    // KPI
    // ==========================================

    y += 46;

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(12);

    pdf.text(
        "RINGKASAN KPI PRODUKSI",
        20,
        y
    );

    y += 10;

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(10);

    function row(label,value){

        pdf.text(label,20,y);

        pdf.text(":",70,y);

        pdf.text(String(value ?? "-"),75,y);

        y += 7;

    }

    row("DOC IN",kpi.docIn);
    row("Ayam Hidup",kpi.ayamHidup);
    row("Mortalitas",kpi.mortalitas);
    row("Deplesi",kpi.deplesi);
    row("FCR",kpi.fcr);
    row("IP",kpi.ip);

    // ==========================================
    // EKONOMI FLOK
    // ==========================================

    y += 8;

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(12);

    pdf.text(
        "EKONOMI FLOK",
        20,
        y
    );

    y += 8;

    pdf.setFillColor(11,143,67);

    pdf.setTextColor(255,255,255);

    pdf.rect(
        20,
        y-5,
        170,
        8,
        "F"
    );

    pdf.setFontSize(9);

    pdf.text("Flok",24,y);
    pdf.text("Rp/Ekor",42,y);
    pdf.text("Pakan/Kg",72,y);
    pdf.text("Biaya",108,y);
    pdf.text("Pendapatan",155,y);

    pdf.setTextColor(0,0,0);

    y += 8;

    pdf.setFont("helvetica","normal");

    ekonomiFlok.forEach(f=>{

        pdf.text(String(f.flok || "-"),24,y);

        pdf.text(String(f.rpEkor || "-"),42,y);

        pdf.text(String(f.pakanKg || "-"),72,y);

        pdf.text(String(f.biayaPakan || "-"),108,y);

        pdf.text(String(f.pendapatan || "-"),155,y);

        y += 7;

    });

    // ===== BAGIAN 2 DIMULAI DARI SINI =====
    
    // ==========================================
// REALISASI PANEN
// ==========================================

const panen = data.dashboard?.realisasiPanen || [];

y += 12;

pdf.setFont("helvetica","bold");
pdf.setFontSize(12);

pdf.text("REALISASI PANEN",20,y);

y += 8;

// ------------------------------------------
// HEADER TABEL REALISASI PANEN
// ------------------------------------------

function headerPanen(){

    pdf.setFillColor(11,143,67);
    pdf.setTextColor(255,255,255);

    pdf.rect(10, y-5, 190, 8, "F");

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(7);

    pdf.text("Ekor",12,y);
    pdf.text("Ton",28,y);
    pdf.text("BB",46,y);
    pdf.text("FCR",58,y);
    pdf.text("IP",70,y);
    pdf.text("Mati",82,y);
    pdf.text("Harga",100,y);
    pdf.text("Omset",122,y);
    pdf.text("P/E",150,y);
    pdf.text("Profit",172,y);

    pdf.setTextColor(0,0,0);

    y += 7;

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(7);

}

headerPanen();

// ------------------------------------------
// ISI DATA PANEN
// ------------------------------------------

panen.forEach(r=>{

    if(y > 275){

        pdf.addPage();

        pdf.setFont("helvetica","bold");
        pdf.setFontSize(12);

        pdf.text(
            "REALISASI PANEN (LANJUTAN)",
            20,
            18
        );

        y = 30;

        headerPanen();

    }

    pdf.text(angka(r.totalEkor),12,y);
    pdf.text(angka(r.tonase),28,y);
    pdf.text(String(r.bb ?? "-"),46,y);
    pdf.text(String(r.fcr ?? "-"),58,y);
    pdf.text(String(r.ip ?? "-"),70,y);
    pdf.text(angka(r.kematian),82,y);
    pdf.text(rupiah(r.harga),100,y);
    pdf.text(rupiah(r.omset),122,y);
    pdf.text(rupiah(r.profitEkor),150,y);
    pdf.text(rupiah(r.profit),172,y);

    y += 6;

});

// ------------------------------------------
// GARIS PEMBATAS
// ------------------------------------------

y += 5;

pdf.setDrawColor(180);
pdf.line(20, y, 190, y);

// ==========================================
// HALAMAN BARU
// ==========================================

pdf.addPage();

y = 30;

// ==========================================
// RINGKASAN KEUANGAN
// ==========================================

const keuangan = data.keuangan || {};

pdf.setFont("helvetica","bold");
pdf.setFontSize(12);

pdf.text("RINGKASAN KEUANGAN",20,y);

y += 10;

pdf.setFont("helvetica","normal");
pdf.setFontSize(10);

function rowKeuangan(label, value){

    pdf.text(label,20,y);
    pdf.text(":",80,y);
    pdf.text(String(value),85,y);

    y += 8;

}

rowKeuangan(
    "Total Ekor Panen",
    angka(keuangan.totalEkor || 0)
);

rowKeuangan(
    "Total Tonase",
    angka(keuangan.totalTonase || 0)
);

rowKeuangan(
    "Total Pakan",
    angka(keuangan.totalPakan || 0) + " Kg"
);

rowKeuangan(
    "Biaya Operasional",
    rupiah(keuangan.biayaOperasional || 0)
);

rowKeuangan(
    "Estimasi Omset",
    rupiah(keuangan.estimasiOmset || 0)
);

rowKeuangan(
    "Estimasi Laba",
    rupiah(keuangan.estimasiLaba || 0)
);

rowKeuangan(
    "Profit / Ekor",
    rupiah(keuangan.profitOwner || 0)
);

// ==========================================
// KESIMPULAN
// ==========================================

if(y > 220){

    pdf.addPage();

    y = 20;

}

y += 8;

pdf.setFont("helvetica","bold");
pdf.setFontSize(12);

pdf.text("KESIMPULAN PRODUKSI",20,y);

y += 10;

pdf.setFont("helvetica","normal");
pdf.setFontSize(9);

pdf.text(
"Laporan RHPP ini dibuat berdasarkan data produksi yang tercatat pada FMC Broiler Mobile.",
20,
y
);

y += 6;

pdf.text(
"Dokumen ini digunakan sebagai bahan evaluasi produksi, performa flok,",
20,
y
);

y += 6;

pdf.text(
"serta dasar pengambilan keputusan manajemen peternakan.",
20,
y
);

// ==========================================
// PENGESAHAN
// ==========================================

if(y > 220){

    pdf.addPage();

    y = 20;

}

y += 15;

pdf.setFont("helvetica","bold");
pdf.setFontSize(12);

pdf.text("PENGESAHAN LAPORAN",20,y);

y += 15;

// ------------------------------------------
// JUDUL KOLOM
// ------------------------------------------

pdf.setFont("helvetica","normal");
pdf.setFontSize(10);

pdf.text("Disusun Oleh",50,y,{align:"center"});
pdf.text("Mengetahui",150,y,{align:"center"});

// ------------------------------------------
// RUANG TANDA TANGAN
// ------------------------------------------

y += 30;

// Garis tanda tangan kiri
pdf.line(20,y,80,y);

// Garis tanda tangan kanan
pdf.line(120,y,180,y);

// ------------------------------------------
// NAMA PENANGGUNG JAWAB
// ------------------------------------------

pdf.text("Admin Farm",50,y+8,{align:"center"});
pdf.text("Owner / Pimpinan",150,y+8,{align:"center"});

y += 22;

// ------------------------------------------
// FOOTER HALAMAN TERAKHIR
// ------------------------------------------

pdf.setFontSize(9);

pdf.text(
    "Dicetak : " +
    new Date().toLocaleDateString("id-ID"),
    20,
    y
);

pdf.text(
    "Generated by FMC Broiler Mobile",
    120,
    y
);

// ==========================================
// FOOTER HALAMAN
// ==========================================

const totalPages = pdf.getNumberOfPages();

for(let i=1;i<=totalPages;i++){

    pdf.setPage(i);

    pdf.setDrawColor(180);

    pdf.line(
        15,
        284,
        195,
        284
    );

    pdf.setFont("helvetica","normal");

    pdf.setFontSize(8);

    pdf.text(
        "FMC Broiler Mobile",
        15,
        289
    );

    pdf.text(
        "Dicetak : "+new Date().toLocaleDateString("id-ID"),
        105,
        289,
        {align:"center"}
    );

    pdf.text(
        `Halaman ${i} / ${totalPages}`,
        195,
        289,
        {align:"right"}
    );

}

// ==========================================
// SIMPAN PDF
// ==========================================

pdf.save("RHPP-FMC.pdf");

}