// ==========================================================
// FMC BROILER MOBILE
// RHPP D2 — PDF V1
// Sumber data: GAS 2 action=getRHPP
// ==========================================================

function fmcRhppPdfNum_(value){
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function fmcRhppPdfAngka_(value, digits = 0){
    return fmcRhppPdfNum_(value).toLocaleString("id-ID", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function fmcRhppPdfRupiah_(value){
    return "Rp " + fmcRhppPdfAngka_(value, 0);
}

function fmcRhppPdfHasContractPrice_(rows){
    return Array.isArray(rows) && rows.some(function(row){
        return fmcRhppPdfNum_(row?.contractPrice) > 0;
    });
}

function fmcRhppPdfEstimateText_(value, hasContractPrice){
    return hasContractPrice
        ? fmcRhppPdfRupiah_(value)
        : "Belum dapat dihitung";
}

function fmcRhppPdfPct_(value){
    return (fmcRhppPdfNum_(value) * 100).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "%";
}

function fmcRhppPdfEnsureSpace_(pdf, y, needed = 15){
    if(y + needed > 278){
        pdf.addPage();
        return 20;
    }
    return y;
}

function fmcRhppPdfTitle_(pdf, title, y){
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(12);
    pdf.setTextColor(0,0,0);
    pdf.text(title,20,y);
    return y + 8;
}

function fmcRhppPdfTableHeader_(pdf, columns, y, x = 15, width = 180){
    pdf.setFillColor(11,143,67);
    pdf.setTextColor(255,255,255);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(7);
    pdf.rect(x,y-5,width,8,"F");

    columns.forEach(col => {
        pdf.text(String(col.label), col.x, y, {maxWidth: col.w || 30});
    });

    pdf.setTextColor(0,0,0);
    return y + 7;
}

async function exportRHPPPDF(){
    let response;

    try{
        // RHPP PDF selalu mengambil sumber yang sama dengan preview.
        response = await fmcGetRHPPD2_();
    }catch(error){
        console.error("RHPP PDF D2 ERROR:", error);
        alert(error?.message || "Data RHPP tidak tersedia.");
        return;
    }

    const rhpp = response.rhpp || {};
    const identitas = rhpp.identitas || {};
    const kpi = rhpp.kpi || {};
    const floks = Array.isArray(rhpp.akumulasiFlok) ? rhpp.akumulasiFlok : [];
    const panen = Array.isArray(rhpp.realisasiPanen) ? rhpp.realisasiPanen : [];
    const keuangan = rhpp.keuangan || {};
    const ovk = rhpp.ovk || {};
    const ovkItems = Array.isArray(ovk.items) ? ovk.items : [];
    const bop = rhpp.bop || {};
    const hasContractPrice = fmcRhppPdfHasContractPrice_(floks);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});

    // HEADER
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(20);
    pdf.text("FMC BROILER MOBILE",105,18,{align:"center"});
    pdf.setFontSize(13);
    pdf.text("RINGKASAN HASIL PRODUKSI PETERNAKAN",105,26,{align:"center"});
    pdf.setFont("helvetica","normal");
    pdf.setFontSize(9);
    pdf.text("LAPORAN PRODUKSI BROILER TERINTEGRASI",105,32,{align:"center"});
    pdf.setDrawColor(11,143,67);
    pdf.setLineWidth(0.8);
    pdf.line(20,36,190,36);

    // IDENTITAS
    let y = 45;
    pdf.setDrawColor(180);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(18,y,174,48,2,2);
    pdf.setFont("helvetica","bold");
    pdf.setFontSize(11);
    pdf.text("INFORMASI FARM",22,y+7);
    pdf.setFont("helvetica","normal");
    pdf.setFontSize(9);

    const identLeft = [
        ["Nama Farm",identitas.namaFarm || "-"],
        ["Perusahaan",identitas.perusahaan || "-"],
        ["Supplier",identitas.supplier || "-"],
        ["Periode",identitas.periode || "-"]
    ];
    const identRight = [
        ["Chick In",identitas.chickIn || "-"],
        ["Tanggal DOC",identitas.tanggalDOC || "-"],
        ["Jumlah FLOK",rhpp.flok_count || floks.length || 0],
        ["Tanggal Cetak",new Date().toLocaleDateString("id-ID")]
    ];

    identLeft.forEach((r,i)=>{
        const yy=y+15+(i*7);
        pdf.text(r[0],22,yy); pdf.text(":",58,yy); pdf.text(String(r[1]),62,yy,{maxWidth:42});
    });
    identRight.forEach((r,i)=>{
        const yy=y+15+(i*7);
        pdf.text(r[0],108,yy); pdf.text(":",145,yy); pdf.text(String(r[1]),149,yy,{maxWidth:38});
    });

    // KPI
    y = 103;
    y = fmcRhppPdfTitle_(pdf,"RINGKASAN KPI PRODUKSI",y);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(9);
    const kpiRows = [
        ["DOC IN",fmcRhppPdfAngka_(kpi.docIn)],
        ["Ayam Hidup",fmcRhppPdfAngka_(kpi.ayamHidup)],
        ["Mati",fmcRhppPdfAngka_(kpi.mati)],
        ["Mortalitas",fmcRhppPdfPct_(kpi.mortalitas)],
        ["Deplesi",fmcRhppPdfPct_(kpi.deplesi)],
        ["FCR",fmcRhppPdfAngka_(kpi.fcr,2)],
        ["IP",fmcRhppPdfAngka_(kpi.ip,0)]
    ];
    kpiRows.forEach(row=>{
        y=fmcRhppPdfEnsureSpace_(pdf,y,8);
        pdf.text(row[0],20,y); pdf.text(":",65,y); pdf.text(row[1],70,y); y+=6;
    });

    // AKUMULASI FLOK
    y+=5;
    y=fmcRhppPdfEnsureSpace_(pdf,y,20);
    y=fmcRhppPdfTitle_(pdf,"AKUMULASI FLOK",y);

    const flokCols = [
        {label:"Flok",x:14,w:9},{label:"Pop",x:24,w:12},{label:"Live",x:37,w:12},
        {label:"Mati",x:50,w:11},{label:"Afkir",x:62,w:11},{label:"Umur",x:74,w:9},
        {label:"BB",x:84,w:9},{label:"Pakan",x:94,w:13},{label:"Jenis",x:108,w:18},
        {label:"Biaya",x:127,w:20},{label:"Live Kg",x:148,w:16},{label:"Harga",x:165,w:19},{label:"Omset",x:185,w:10}
    ];
    y=fmcRhppPdfTableHeader_(pdf,flokCols,y,14,180);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(6.5);

    floks.forEach(f=>{
        y=fmcRhppPdfEnsureSpace_(pdf,y,8);
        const vals=[
            f.flok || "-", fmcRhppPdfAngka_(f.populasi), fmcRhppPdfAngka_(f.live),
            fmcRhppPdfAngka_(f.mati), fmcRhppPdfAngka_(f.afkir), fmcRhppPdfAngka_(f.umur),
            fmcRhppPdfAngka_(f.bbAvg,2), fmcRhppPdfAngka_(f.feedKg), String(f.jenisPakan || "-"), fmcRhppPdfRupiah_(f.feedCost),
            fmcRhppPdfAngka_(f.liveKg,2), fmcRhppPdfRupiah_(f.contractPrice), fmcRhppPdfRupiah_(f.productionValue)
        ];
        flokCols.forEach((col,i)=>pdf.text(String(vals[i]),col.x,y,{maxWidth:col.w}));
        y+=6;
    });

    // REALISASI PANEN
    y+=7; y=fmcRhppPdfEnsureSpace_(pdf,y,20); y=fmcRhppPdfTitle_(pdf,"REALISASI PANEN",y);
    const panenCols=[
        {label:"Flok",x:12,w:12},{label:"Tanggal",x:25,w:22},{label:"Ekor",x:48,w:15},
        {label:"Ton",x:64,w:14},{label:"BB",x:79,w:11},{label:"Harga",x:91,w:22},
        {label:"Omset",x:114,w:25},{label:"Profit/E",x:140,w:23},{label:"Profit",x:164,w:27}
    ];
    y=fmcRhppPdfTableHeader_(pdf,panenCols,y,10,190);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(6.5);

    if(!panen.length){
        pdf.text("Belum ada realisasi panen.",12,y); y+=7;
    }else{
        panen.forEach(r=>{
            y=fmcRhppPdfEnsureSpace_(pdf,y,8);
            const vals=[
                r.flok||"-",r.tanggal||"-",fmcRhppPdfAngka_(r.totalEkor),
                fmcRhppPdfAngka_(r.tonase,2),fmcRhppPdfAngka_(r.bb,2),fmcRhppPdfRupiah_(r.harga),
                fmcRhppPdfRupiah_(r.omset),fmcRhppPdfRupiah_(r.profitEkor),fmcRhppPdfRupiah_(r.profit)
            ];
            panenCols.forEach((col,i)=>pdf.text(String(vals[i]),col.x,y,{maxWidth:col.w}));
            y+=6;
        });
    }

    // KEUANGAN
    y+=7; y=fmcRhppPdfEnsureSpace_(pdf,y,25); y=fmcRhppPdfTitle_(pdf,"RINGKASAN KEUANGAN",y);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(9);
    const financeRows=[
        ["Total Ekor Hidup",fmcRhppPdfAngka_(keuangan.totalEkor)],
        ["Total Tonase",fmcRhppPdfAngka_(keuangan.totalTonase,2)+" Ton"],
        ["Total Pakan",fmcRhppPdfAngka_(keuangan.totalPakan)+" Kg"],
        ["DOC",fmcRhppPdfRupiah_(keuangan.docCost)],
        ["Pakan",fmcRhppPdfRupiah_(keuangan.feedCost)],
        ["Total Biaya Produksi",fmcRhppPdfRupiah_(keuangan.productionCost)],
        ["Estimasi Omset",hasContractPrice ? fmcRhppPdfRupiah_(keuangan.estimasiOmset) : "Belum tersedia"],
        ["Estimasi Laba Produksi",fmcRhppPdfEstimateText_(keuangan.estimasiLaba,hasContractPrice)],
        ["Profit / Ekor",fmcRhppPdfRupiah_(keuangan.profitOwner)],
        ["Total BOP",fmcRhppPdfRupiah_(keuangan.biayaBOP ?? bop.total)],
        ["Total OVK",fmcRhppPdfRupiah_(keuangan.biayaOVK ?? ovk.summary?.total)]
    ];
    financeRows.forEach(row=>{
        y=fmcRhppPdfEnsureSpace_(pdf,y,8);
        pdf.text(row[0],20,y); pdf.text(":",80,y); pdf.text(row[1],85,y,{maxWidth:90}); y+=7;
    });

    // BOP
    y+=5; y=fmcRhppPdfEnsureSpace_(pdf,y,28); y=fmcRhppPdfTitle_(pdf,"BOP",y);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(7);
    const bopItems = Array.isArray(bop.items) ? bop.items : [];
    if(!bopItems.length){
        pdf.text("Belum ada input BOP pada periode ini.",20,y); y+=8;
    }else{
        const bopCols=[
            {label:"No",x:14,w:8},{label:"Tanggal",x:23,w:25},{label:"Kategori",x:49,w:25},
            {label:"Keterangan",x:75,w:42},{label:"Harga",x:118,w:25},{label:"Qty",x:144,w:12},{label:"Total",x:157,w:32}
        ];
        y=fmcRhppPdfTableHeader_(pdf,bopCols,y,12,178);
        pdf.setFont("helvetica","normal"); pdf.setFontSize(6.5);
        bopItems.forEach((item,index)=>{
            y=fmcRhppPdfEnsureSpace_(pdf,y,8);
            const vals=[index+1,item.tanggal||"-",item.kategori||"-",item.keterangan||"-",
                fmcRhppPdfRupiah_(item.harga),fmcRhppPdfAngka_(item.qty),fmcRhppPdfRupiah_(item.total)];
            bopCols.forEach((col,i)=>pdf.text(String(vals[i]),col.x,y,{maxWidth:col.w}));
            y+=6;
        });
        y=fmcRhppPdfEnsureSpace_(pdf,y,8);
        pdf.setFont("helvetica","bold");
        pdf.text("TOTAL BOP",118,y);
        pdf.text(fmcRhppPdfRupiah_(bop.summary?.total ?? bop.total),157,y,{maxWidth:32});
        y+=7;
    }

    // OVK
    y+=5; y=fmcRhppPdfEnsureSpace_(pdf,y,25); y=fmcRhppPdfTitle_(pdf,"OVK",y);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(8);
    if(!ovkItems.length){
        pdf.text("Belum ada input OVK pada periode ini.",20,y); y+=8;
    }else{
        const ovkCols=[
            {label:"Tanggal",x:18,w:28},{label:"Obat / OVK",x:48,w:60},
            {label:"Harga",x:110,w:30},{label:"Qty",x:142,w:15},{label:"Total",x:158,w:32}
        ];
        y=fmcRhppPdfTableHeader_(pdf,ovkCols,y,15,180);
        pdf.setFont("helvetica","normal"); pdf.setFontSize(7);
        ovkItems.forEach(item=>{
            y=fmcRhppPdfEnsureSpace_(pdf,y,8);
            const vals=[
                item.tanggal||"-",item.namaObat||item.nama||item.obat||"-",
                fmcRhppPdfRupiah_(item.harga),fmcRhppPdfAngka_(item.qty),fmcRhppPdfRupiah_(item.total)
            ];
            ovkCols.forEach((col,i)=>pdf.text(String(vals[i]),col.x,y,{maxWidth:col.w}));
            y+=6;
        });
    }

    // KESIMPULAN
    y+=6; y=fmcRhppPdfEnsureSpace_(pdf,y,35); y=fmcRhppPdfTitle_(pdf,"KESIMPULAN DAN EVALUASI PRODUKSI",y);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(9);
    const conclusion=[
        "Laporan ini disusun berdasarkan data produksi dan keuangan yang tercatat pada periode berjalan.",
        "Akumulasi produksi disajikan berdasarkan jumlah FLOK yang terdaftar pada periode pelaporan.",
        "Biaya produksi, BOP, dan OVK disajikan secara terpisah untuk memberikan gambaran yang lebih jelas mengenai kondisi operasional dan keuangan periode berjalan.",
        "Laporan ini dapat digunakan sebagai bahan evaluasi bagi Owner/Pimpinan dalam memantau perkembangan produksi dan menentukan langkah pengelolaan selanjutnya."
    ];
    conclusion.forEach(line=>{y=fmcRhppPdfEnsureSpace_(pdf,y,7); pdf.text(line,20,y,{maxWidth:170}); y+=6;});

    // PENGESAHAN
    y+=8; y=fmcRhppPdfEnsureSpace_(pdf,y,60);
    y=fmcRhppPdfTitle_(pdf,"PENGESAHAN LAPORAN",y);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(9);
    pdf.text("Disusun Oleh",35,y+10);
    pdf.line(20,y+38,80,y+38);
    pdf.text("Operator Farm",30,y+45);
    pdf.text("Mengetahui",135,y+10);
    pdf.line(120,y+38,180,y+38);
    pdf.text("Owner / Pimpinan",125,y+45);

    // FOOTER
    const totalPages=pdf.getNumberOfPages();
    for(let i=1;i<=totalPages;i++){
        pdf.setPage(i);
        pdf.setFont("helvetica","normal");
        pdf.setFontSize(7);
        pdf.setTextColor(80,80,80);
        pdf.text("FMC Broiler Mobile",15,290);
        pdf.text(`Halaman ${i} / ${totalPages}`,105,290,{align:"center"});
        pdf.text(new Date().toLocaleDateString("id-ID"),195,290,{align:"right"});
    }

    pdf.save("RHPP-FMC.pdf");
}
