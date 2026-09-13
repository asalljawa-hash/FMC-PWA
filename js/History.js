/* FMC BROILER MOBILE — HISTORY ENGINE V7
 * Read-only period history + REAL XLSX download — ZIP STORE FIX.
 * Source: GAS 2 getPeriods / getPeriod.
 *
 * IMPORTANT:
 * - Tidak membuat database History baru.
 * - Tidak mengubah data period.
 * - Download dibuat sebagai Office Open XML .xlsx yang valid.
 */
(function(){
"use strict";

const PAGE_ID = "historyPage";

function s(v, fb=""){
    const x = String(v ?? "").trim();
    return x || fb;
}
function e(v){
    return s(v).replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
function escXml(v){
    return e(v);
}
function periodNo(p){
    return s(p?.period_no ?? p?.periode ?? p?.doc_in?.periode);
}
function periodId(p){ return s(p?.period_id); }
function doc(p){ return p?.doc_in || {}; }

function formatDate(v){
    const x=s(v,"-");
    if(x==="-" ) return x;
    const m=x.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(m) return `${m[3]}-${m[2]}-${m[1]}`;
    return x;
}
function docDate(p){
    return formatDate(doc(p).tanggal ?? doc(p).doc_date ?? p?.tanggalDOC ?? p?.created_at);
}
function farm(p){
    return s(
        doc(p).perusahaan ??
        doc(p).farm_name ??
        p?.farm_name ??
        p?.farm ??
        p?.derived?.dashboard?.farm?.namaFarm ??
        p?.derived?.dashboard?.farm?.farm,
        "-"
    );
}
function asFlokCollection(v){
    if(Array.isArray(v)) return v;
    if(typeof v==="string"){
        try{
            const x=JSON.parse(v);
            return Array.isArray(x) ? x :
                (x && typeof x==="object" ? Object.keys(x).map(k=>x[k]) : []);
        }catch(_){ return []; }
    }
    if(v && typeof v==="object") return Object.keys(v).map(k=>v[k]);
    return [];
}
function flokCount(p){
    const fromDoc=asFlokCollection(doc(p).floks);
    if(fromDoc.length) return fromDoc.length;

    const fromPeriod=asFlokCollection(p?.floks);
    if(fromPeriod.length) return fromPeriod.length;

    const configured=Number(doc(p).flok_count ?? p?.flok_count);
    if(Number.isFinite(configured) && configured>0) return configured;

    const derived=asFlokCollection(
        p?.derived?.dashboard?.floks ??
        p?.derived?.dashboard?.flok ??
        p?.derived?.floks
    );
    return derived.length;
}
function active(p,id,no){
    return (!!id && periodId(p)===id) || (!!no && periodNo(p)===no);
}

function loading(){
    const el=document.getElementById(PAGE_ID); if(!el)return;
    el.innerHTML=`<section class="fmcHistoryPage">
      <div class="fmcHistoryHeader"><div>
        <div class="fmcHistoryEyebrow">ARSIP PEMELIHARAAN</div>
        <h2><span class="material-symbols-rounded">history</span>History</h2>
        <p>Riwayat seluruh periode yang tersimpan di server.</p>
      </div></div>
      <div class="fmcHistoryLoading"><span class="material-symbols-rounded">sync</span>
        Memuat history periode...</div>
    </section>`;
}
function errorView(msg){
    const el=document.getElementById(PAGE_ID); if(!el)return;
    el.innerHTML=`<section class="fmcHistoryPage">
      <div class="fmcHistoryHeader"><div>
        <div class="fmcHistoryEyebrow">ARSIP PEMELIHARAAN</div>
        <h2><span class="material-symbols-rounded">history</span>History</h2>
      </div></div>
      <div class="fmcHistoryError"><span class="material-symbols-rounded">error</span>
        <strong>History tidak dapat dimuat</strong><p>${e(msg)}</p>
        <button class="fmcHistoryRetry" onclick="tampilHistory()">
          <span class="material-symbols-rounded">refresh</span>Coba Lagi
        </button></div>
    </section>`;
}
function render(data,id,no){
    const el=document.getElementById(PAGE_ID); if(!el)return;
    const rows=(data||[]).slice().sort((a,b)=>{
        const na=Number(periodNo(a)), nb=Number(periodNo(b));
        if(Number.isFinite(na)&&Number.isFinite(nb)&&na!==nb)return nb-na;
        return s(b?.created_at).localeCompare(s(a?.created_at));
    });
    if(!rows.length){
        el.innerHTML=`<section class="fmcHistoryPage">
          <div class="fmcHistoryHeader"><div>
            <div class="fmcHistoryEyebrow">ARSIP PEMELIHARAAN</div>
            <h2><span class="material-symbols-rounded">history</span>History</h2>
            <p>Belum ada periode yang tersimpan.</p>
          </div></div>
          <div class="fmcHistoryEmpty"><span class="material-symbols-rounded">inventory_2</span>
            <strong>Belum ada History</strong>
            <small>Periode akan muncul setelah DOC IN berhasil disimpan.</small>
          </div></section>`;
        return;
    }
    el.innerHTML=`<section class="fmcHistoryPage">
      <div class="fmcHistoryHeader"><div>
        <div class="fmcHistoryEyebrow">ARSIP PEMELIHARAAN</div>
        <h2><span class="material-symbols-rounded">history</span>History</h2>
        <p>${rows.length} periode tersimpan.</p>
      </div><button class="fmcHistoryRefresh" onclick="tampilHistory()">
        <span class="material-symbols-rounded">refresh</span>Refresh</button></div>
      <div class="fmcHistoryList">${rows.map(p=>{
        const a=active(p,id,no), pn=periodNo(p)||periodId(p)||"-";
        return `<article class="fmcHistoryCard ${a?"isActive":""}">
          <div class="fmcHistoryCardTop"><div>
            <div class="fmcHistoryPeriodLabel">PERIODE</div>
            <div class="fmcHistoryPeriodNo">${e(pn)}</div>
          </div><span class="fmcHistoryStatus ${a?"fmcHistoryStatusActive":"fmcHistoryStatusClosed"}">
            ${a?"● AKTIF":"✓ SELESAI"}</span></div>
          <div class="fmcHistoryMetaGrid">
            <div><small>DOC IN</small><strong>${e(docDate(p))}</strong></div>
            <div><small>FARM</small><strong>${e(farm(p))}</strong></div>
            <div><small>FLOK</small><strong>${e(flokCount(p))}</strong></div>
            <div><small>PERIOD ID</small><strong>${e(periodId(p)||"-")}</strong></div>
          </div>
          <div class="fmcHistoryCardFooter">
            <span class="fmcHistoryReadonly"><span class="material-symbols-rounded">lock</span>Read only</span>
            <button class="fmcHistoryDownload" onclick="downloadHistoryPeriod('${e(periodId(p))}','${e(pn)}')">
              <span class="material-symbols-rounded">download</span>Download XLSX</button>
          </div></article>`;
      }).join("")}</div></section>`;
    }


/* ---------- Formal report export helpers ---------- */

function rowsOf(v){
    if(Array.isArray(v)) return v;
    if(v && typeof v==="object") return Object.keys(v).map(k=>{
        const x=v[k];
        return x && typeof x==="object" && !Array.isArray(x) ? {_key:k,...x} : {_key:k,value:x};
    });
    return [];
}
function cell(v){
    if(v===null||v===undefined)return "";
    return typeof v==="object" ? JSON.stringify(v,null,2) : String(v);
}
function num(v){
    const n=Number(v);
    return Number.isFinite(n) ? n : 0;
}
function hasNum(v){
    return v!==null && v!==undefined && v!=="" && Number.isFinite(Number(v));
}
function rupiah(v){ return num(v); }
function persen(v){ return num(v); }

function sheetRows(v){
    const rows=rowsOf(v);
    if(!rows.length)return [["DATA"],[cell(v)]];
    const cols=[];
    rows.forEach(r=>Object.keys(r||{}).forEach(k=>{if(!cols.includes(k))cols.push(k);}));
    if(!cols.length)return [["DATA"],...rows.map(r=>[cell(r)])];
    return [cols,...rows.map(r=>cols.map(k=>cell(r?.[k])))];
}

function formalDashboardRows(d){
    d=d||{};
    const k=d.kpi||{};
    const rows=[
        ["LAPORAN DASHBOARD","NILAI"],
        ["Farm", d.farm?.namaFarm ?? d.farm?.farm ?? ""],
        ["Tanggal DOC", d.tanggalDOC ?? d.farm?.chickIn ?? ""],
        ["Periode", d.periode ?? d.farm?.periode ?? ""],
        ["Populasi DOC", num(d.docPopulation ?? k.docIn)],
        ["Ayam Hidup", num(d.livePopulation ?? k.ayamHidup)],
        ["Total Mati", num(d.totalMati ?? k.mati)],
        ["Total Afkir", num(d.totalAfkir ?? k.afkir)],
        ["Mortalitas", persen(d.mortalitas ?? k.mortalitas)],
        ["Deplesi", persen(d.totalDepletion ?? d.totalDeplesi ?? k.deplesi)],
        ["FCR", num(d.fcrGlobal ?? d.fcr ?? k.fcr)],
        ["IP", num(d.ipGlobal ?? d.ip ?? k.ip)],
        ["Total Pakan", num(d.totalFeed ?? d.totalPakan)],
        ["Total Tonase (kg)", num(d.totalTonase)],
        ["Total Biaya Pakan", rupiah(d.totalBiayaPakan)],
        ["Jumlah FLOK", Array.isArray(d.floks) ? d.floks.length : 0]
    ];
    if(Array.isArray(d.floks) && d.floks.length){
        rows.push([]);
        rows.push(["FLOK","LIVE","MATI","AFKIR","MORTALITAS","BB AVG","FCR","IP","STATUS PANEN"]);
        d.floks.forEach(x=>rows.push([
            x.flok ?? x.flok_id ?? x.id ?? "",
            num(x.live), num(x.mati), num(x.afkir), persen(x.mortalitas),
            num(x.bbAvg), num(x.fcr), num(x.ip), x.statusPanen ?? x.status ?? ""
        ]));
    }
    return rows;
}

function formalHarianRows(h){
    h=h||{};
    const rows=[
        ["LAPORAN HARIAN","NILAI"],
        ["Tanggal", h.tanggal ?? ""],
        ["Total Mati", num(h.totalMati)]
    ];
    if(Array.isArray(h.flok) && h.flok.length){
        rows.push([]);
        rows.push(["FLOK","UMUR","MATI","MORTALITAS"]);
        h.flok.forEach(x=>rows.push([
            x.nama ?? x.flok ?? x.flok_id ?? "",
            num(x.umur), num(x.mati), persen(x.mortalitas)
        ]));
    }
    return rows;
}

function formalKeuanganRows(k){
    k=k||{};
    return [
        ["LAPORAN KEUANGAN","NILAI"],
        ["Total Ekor Hidup", num(k.totalEkor)],
        ["Total Tonase (kg)", num(k.totalTonase)],
        ["FLOK Panen", k.flokPanen ?? 0],
        ["BB Tertinggi (kg)", num(k.bbTertinggi)],
        ["Umur Tertua (hari)", num(k.umurTertua)],
        ["FLOK Terbaik", k.flokTerbaik ?? ""],
        ["Total Pakan (kg)", num(k.totalPakan ?? k.totalFeed)],
        ["Biaya Pakan", rupiah(k.feedCost)],
        ["BOP", rupiah(k.bopCost ?? k.biayaBOP)],
        ["OVK", rupiah(k.ovkCost ?? k.biayaOVK)],
        ["Biaya DOC", rupiah(k.docCost)],
        ["Production Cost", rupiah(k.productionCost)],
        ["Total Owner Cost", rupiah(k.ownerCost)],
        ["Production Value / Omset", rupiah(k.productionValue ?? k.estimasiOmset)],
        ["Cost / Ekor", rupiah(k.costEkor)],
        ["Cost / Kg", rupiah(k.costKg)],
        ["Margin Produksi", persen(k.marginProduksi)],
        ["Bonus Kematian", rupiah(k.bonusKematian)],
        ["Bonus Pasar", rupiah(k.bonusPasar)],
        ["Estimasi Laba Produksi", rupiah(k.estimasiLaba ?? k.profitLoss)],
        ["Profit / Ekor", rupiah(k.profitOwner)]
    ];
}

function formalRhppRows(r){
    r=r||{};
    const rows=[
        ["LAPORAN RHPP","NILAI"],
        ["Farm", r.identitas?.namaFarm ?? ""],
        ["Periode", r.identitas?.periode ?? ""],
        ["Tanggal DOC", r.identitas?.tanggalDOC ?? r.identitas?.chickIn ?? ""],
        ["Perusahaan", r.identitas?.perusahaan ?? ""],
        ["Supplier", r.identitas?.supplier ?? ""],
        ["Jumlah FLOK", num(r.flok_count)]
    ];
    const k=r.kpi||{};
    rows.push([]);
    rows.push(["KPI RHPP","NILAI"]);
    rows.push(["DOC IN", num(k.docIn)]);
    rows.push(["Ayam Hidup", num(k.ayamHidup)]);
    rows.push(["Mati", num(k.mati)]);
    rows.push(["Mortalitas", persen(k.mortalitas)]);
    rows.push(["Deplesi", persen(k.deplesi)]);
    rows.push(["FCR", num(k.fcr)]);
    rows.push(["IP", num(k.ip)]);

    if(r.keuangan && typeof r.keuangan==="object"){
        rows.push([]);
        rows.push(["KEUANGAN RHPP","NILAI"]);
        const kk=r.keuangan;
        rows.push(["Production Value / Omset", rupiah(kk.productionValue ?? kk.estimasiOmset)]);
        rows.push(["Feed Cost", rupiah(kk.feedCost)]);
        rows.push(["BOP", rupiah(kk.bopCost ?? kk.biayaBOP)]);
        rows.push(["OVK", rupiah(kk.ovkCost ?? kk.biayaOVK)]);
        rows.push(["Total Owner Cost", rupiah(kk.ownerCost)]);
        rows.push(["Profit / Loss", rupiah(kk.profitLoss ?? kk.estimasiLaba)]);
        rows.push(["Profit / Ekor", rupiah(kk.profitOwner)]);
        rows.push(["Margin Produksi", persen(kk.marginProduksi ?? kk.margin)]);
    }

    if(Array.isArray(r.akumulasiFlok) && r.akumulasiFlok.length){
        rows.push([]);
        rows.push(["AKUMULASI FLOK","LIVE","MATI","AFKIR","BB AVG","FCR","IP","FEED KG","FEED COST","PRODUCTION VALUE"]);
        r.akumulasiFlok.forEach(x=>rows.push([
            x.flok ?? x.flok_id ?? x.id ?? "",
            num(x.live ?? x.ayamHidup), num(x.mati), num(x.afkir),
            num(x.bbAvg), num(x.fcr), num(x.ip),
            num(x.feedKg ?? x.pakanKg), rupiah(x.feedCost ?? x.biayaPakan),
            rupiah(x.productionValue ?? x.pendapatan)
        ]));
    }

    if(r.ovk && Array.isArray(r.ovk.items) && r.ovk.items.length){
        rows.push([]);
        rows.push(["OVK","QTY","HARGA SATUAN","TOTAL"]);
        r.ovk.items.forEach(x=>rows.push([
            x.nama ?? x.namaObat ?? x.obat ?? "",
            num(x.qty), rupiah(x.hargaSatuan ?? x.harga),
            rupiah(x.total ?? (num(x.qty)*num(x.hargaSatuan ?? x.harga)))
        ]));
    }

    if(r.bop && typeof r.bop==="object"){
        rows.push([]);
        rows.push(["BOP","NILAI"]);
        rows.push(["Total BOP", rupiah(r.bop.total ?? r.bop.summary?.total ?? r.keuangan?.bopCost)]);
    }
    return rows;
}

function formalDocRows(v){
    const d=v||{};
    return [
        ["DOC IN","NILAI"],
        ["Tanggal", d.tanggal ?? d.doc_date ?? ""],
        ["Perusahaan", d.perusahaan ?? ""],
        ["Periode", d.periode ?? ""],
        ["Supplier", d.supplier ?? ""],
        ["Harga", hasNum(d.harga) ? num(d.harga) : ""],
        ["Jumlah FLOK", hasNum(d.flok_count) ? num(d.flok_count) : 0]
    ];
}

function formalOvkRows(v){
    const src = v && typeof v === "object" ? v : {};
    let items = [];
    if(Array.isArray(src)) items = src;
    else if(Array.isArray(src.items)) items = src.items;
    else if(Array.isArray(src.data?.items)) items = src.data.items;
    else if(Array.isArray(src.rows)) items = src.rows;
    else if(Array.isArray(src.data)) items = src.data;

    const rows = [[
        "NO","TANGGAL","NAMA OBAT / VITAMIN","HARGA SATUAN","QTY","TOTAL"
    ]];

    items.forEach((x,i)=>{
        x = x || {};
        const harga = Number(x.harga ?? x.hargaSatuan ?? x.price ?? 0);
        const qty = Number(x.qty ?? x.quantity ?? 0);
        const totalRaw = x.total ?? x.jumlah ?? x.amount;
        const total = Number.isFinite(Number(totalRaw))
            ? Number(totalRaw)
            : (Number.isFinite(harga) && Number.isFinite(qty) ? harga * qty : 0);
        rows.push([
            num(x.no ?? x.nomor ?? (i+1)),
            x.tanggal ?? x.date ?? "",
            x.namaObat ?? x.nama ?? x.obat ?? x.item ?? "",
            rupiah(harga),
            num(qty),
            rupiah(total)
        ]);
    });

    if(items.length){
        const totalSummary = Number(src.total ?? src.totalOVK ?? src.grandTotal);
        rows.push([]);
        rows.push(["TOTAL OVK","","","", "", rupiah(
            Number.isFinite(totalSummary) ? totalSummary : items.reduce((a,x)=>a + num(x.total ?? (num(x.harga ?? x.hargaSatuan)*num(x.qty))),0)
        )]);
    } else {
        rows.push(["BELUM ADA DATA OVK","","","","",""]);
    }
    return rows;
}

function operationalRows(v){ return sheetRows(v); }

/* ---------- Formal FLOK export ---------- */
function formalFlokRows(p){
    const source =
        (p && p.doc_in && p.doc_in.floks) ??
        (p && p.floks) ??
        [];

    let items=[];
    if(Array.isArray(source)){
        items=source;
    }else if(source && typeof source==="object"){
        items=Object.keys(source).map(function(key){
            const x=source[key];
            if(x && typeof x==="object" && !Array.isArray(x)){
                return {
                    id:x.id ?? x.flok_id ?? key,
                    name:x.name ?? ("FLOK "+key),
                    populasi:x.populasi ?? x.population ?? x.qty ?? x.jumlah,
                    tanggal:x.tanggal ?? x.tanggal_doc ?? x.doc_date,
                    ...x
                };
            }
            return {id:key,name:"FLOK "+key,populasi:x};
        });
    }

    const rows=[["FLOK","NAMA","POPULASI","TANGGAL DOC"]];
    items.forEach(function(x){
        if(!x || typeof x!=="object") return;
        const id=x.id ?? x.flok_id ?? x.flok ?? "";
        const name=x.name ?? x.nama ?? (id ? "FLOK "+id : "");
        const populasi=x.populasi ?? x.population ?? x.qty ?? x.jumlah;
        const tanggal=x.tanggal ?? x.tanggal_doc ?? x.doc_date;
        rows.push([
            id,
            name,
            hasNum(populasi) ? num(populasi) : "",
            formatDate(tanggal)
        ]);
    });

    if(rows.length===1) rows.push(["-","-","",""]);
    return rows;
}

/* ---------- Formal DAILY / INPUT FLOK export ---------- */
function formalDailyFlokRows(p){
    const rows=[[
        "FLOK","TANGGAL","UMUR","MATI","AFKIR","BB AVG (kg)",
        "KONSUMSI PAKAN (kg)","JENIS PAKAN","HARGA PAKAN",
        "TONASE (kg)","MORTALITAS","FCR","IP","BIAYA PAKAN",
        "AKUMULASI BIAYA PAKAN","POPULASI DOC","MATI KUMULATIF",
        "POPULASI HIDUP","UPDATED AT"
    ]];

    const inputSource=(p && p.doc_in && p.doc_in.floks) ?? [];
    const inputMap={};
    if(Array.isArray(inputSource)){
        inputSource.forEach(function(x){
            if(!x || typeof x!=="object") return;
            const id=String(x.id ?? x.flok_id ?? x.flok ?? "").trim().toUpperCase();
            if(id) inputMap[id]=x;
        });
    }else if(inputSource && typeof inputSource==="object"){
        Object.keys(inputSource).forEach(function(key){
            const x=inputSource[key];
            if(x && typeof x==="object" && !Array.isArray(x)) inputMap[String(key).toUpperCase()]=x;
        });
    }

    const source=(p && p.floks) ?? {};
    const flokIds=Array.isArray(source)
        ? source.map(function(x){ return String(x?.id ?? x?.flok_id ?? x?.flok ?? "").trim().toUpperCase(); }).filter(Boolean)
        : (source && typeof source==="object" ? Object.keys(source) : []);

    flokIds.forEach(function(key){
        const f=Array.isArray(source)
            ? source.find(function(x){ return String(x?.id ?? x?.flok_id ?? x?.flok ?? "").trim().toUpperCase()===key; })
            : source[key];
        if(!f || typeof f!=="object") return;

        const input=inputMap[key] || {};

        /*
         * PRIORITAS DATA EXPORT:
         * 1. period.floks[].calculated  -> hasil Calculation Engine lengkap
         * 2. period.floks[].daily        -> raw input jika calculated belum ada
         *
         * calculated adalah sumber yang memuat tonase, mortalitas,
         * FCR, IP, biaya pakan, akumulasi, populasi hidup, dll.
         */
        let records=Array.isArray(f.calculated) ? f.calculated : [];
        let usingCalculated=records.length > 0;
        if(!usingCalculated && Array.isArray(f.daily)) records=f.daily;

        records.forEach(function(d){
            if(!d || typeof d!=="object") return;

            const der=(d.derived && typeof d.derived==="object") ? d.derived : {};
            const tanggal=d.tanggal ?? der.tanggal ?? input.tanggal ?? input.tanggal_doc ?? input.doc_date ?? "";

            rows.push([
                key,
                formatDate(tanggal),
                hasNum(d.umur) ? num(d.umur) : "",
                hasNum(d.mati) ? num(d.mati) : 0,
                hasNum(d.afkir) ? num(d.afkir) : 0,
                hasNum(d.bbAvg) ? num(d.bbAvg) : "",
                hasNum(d.konsumsiPakan) ? num(d.konsumsiPakan) : 0,
                d.jenisPakan ?? "",
                hasNum(d.hargaPakan ?? der.hargaPakan) ? num(d.hargaPakan ?? der.hargaPakan) : "",
                hasNum(d.tonase ?? der.tonase) ? num(d.tonase ?? der.tonase) : "",
                hasNum(d.mortalitas ?? der.mortalitas) ? persen(d.mortalitas ?? der.mortalitas) : "",
                hasNum(d.fcr ?? der.fcr) ? num(d.fcr ?? der.fcr) : "",
                hasNum(d.ip ?? der.ip) ? num(d.ip ?? der.ip) : "",
                hasNum(d.biayaPakan ?? der.biayaPakan) ? rupiah(d.biayaPakan ?? der.biayaPakan) : "",
                hasNum(d.akumulasiBiayaPakan ?? der.akumulasiBiayaPakan) ? rupiah(d.akumulasiBiayaPakan ?? der.akumulasiBiayaPakan) : "",
                hasNum(d.populasiDOC ?? der.populasiDOC) ? num(d.populasiDOC ?? der.populasiDOC) : "",
                hasNum(d.matiKumulatif ?? der.matiKumulatif) ? num(d.matiKumulatif ?? der.matiKumulatif) : "",
                hasNum(d.populasiHidup ?? der.populasiHidup) ? num(d.populasiHidup ?? der.populasiHidup) : "",
                formatDate(d.updated_at ?? der.updated_at ?? "")
            ]);
        });
    });

    if(rows.length===1) rows.push(["-","-","","","","","","","","","","","","","","","","",""]);
    return rows;
}

/* ---------- Read-only engine fetch ---------- */

async function fmcHistoryEngineData_(periodId, period){
    const pid=String(periodId||period?.period_id||"").trim();
    if(!pid) throw new Error("Period ID tidak tersedia untuk export engine.");

    const req={period_id:pid};
    const safeCall=async(action)=>{
        try{
            const r=await apiPost(action,req);
            return (r && r.success===true) ? r : null;
        }catch(err){
            console.warn("HISTORY ENGINE "+action+" gagal:",err);
            return null;
        }
    };

    const results=await Promise.all([
        safeCall("getDashboard"),
        safeCall("getHarian"),
        safeCall("getKeuangan"),
        safeCall("getRHPP")
    ]);

    return {
        dashboard: results[0]?.dashboard ?? period?.derived?.dashboard ?? null,
        harian: results[1]?.harian ?? period?.derived?.harian ?? null,
        keuangan: results[2]?.keuangan ?? period?.derived?.keuangan ?? null,
        rhpp: results[3]?.rhpp ?? period?.derived?.rhpp ?? null
    };
}

function sheetsForPeriod(p,engine){
    return [
        ["RINGKASAN",[
            ["FIELD","NILAI"],
            ["Periode",periodNo(p)||periodId(p)],
            ["Period ID",periodId(p)],
            ["Status",s(p.status,"-")],
            ["DOC IN",docDate(p)],
            ["Farm",farm(p)],
            ["Jumlah FLOK",flokCount(p)],
            ["Created At",s(p.created_at)],
            ["Updated At",s(p.updated_at)]
        ]],
        ["DOC IN",formalDocRows(doc(p))],
        ["FLOK",formalFlokRows(p)],
        ["DAILY INPUT FLOK",formalDailyFlokRows(p)],
        ["MASTER PAKAN",operationalRows(p.master_pakan)],
        ["MASTER KONTRAK",operationalRows(p.master_kontrak)],
        ["BOP",operationalRows(p.bop)],
        ["OVK",formalOvkRows(p.ovk)],
        ["PLAN PANEN",operationalRows(p.plan_panen)],
        ["REALISASI PANEN",operationalRows(p.realisasi_panen)],
        ["TIMBANG",operationalRows(p.timbang)],
        ["DASHBOARD ENGINE",formalDashboardRows(engine.dashboard)],
        ["HARIAN ENGINE",formalHarianRows(engine.harian)],
        ["KEUANGAN ENGINE",formalKeuanganRows(engine.keuangan)],
        ["RHPP ENGINE",formalRhppRows(engine.rhpp)]
    ];
}

/* ---------- XLSX OOXML ---------- */

function colName(n){
    let x="", k=n+1;
    while(k){let r=(k-1)%26;x=String.fromCharCode(65+r)+x;k=Math.floor((k-1)/26);}
    return x;
}
function safeSheetName(name,i){
    let x=String(name||("Sheet"+i)).replace(/[\\\/\?\*\[\]:]/g," ").trim().slice(0,31);
    return x || ("Sheet"+i);
}
function cellStyleFor(label,value,rowIndex,colIndex){
    if(rowIndex===0) return 1;
    const l=String(label||"").toLowerCase();
    if(typeof value==="number"){
        if(l.includes("mortalitas")||l.includes("deplesi")||l.includes("margin")) return 3;
        if(l.includes("biaya")||l.includes("cost")||l.includes("omset")||l.includes("production value")||l.includes("profit")||l.includes("bonus")||l.includes("harga")) return 2;
        return 4;
    }
    return 0;
}
function sheetXml(rows){
    const out=[];
    rows.forEach((row,ri)=>{
        out.push(`<row r="${ri+1}">`);
        (row||[]).forEach((v,ci)=>{
            const ref=colName(ci)+(ri+1);
            let value=v, style=0;
            if(v && typeof v==="object" && !Array.isArray(v) && Object.prototype.hasOwnProperty.call(v,"value")){
                value=v.value; style=v.style||0;
            }else{
                style=cellStyleFor(row&&row[0],value,ri,ci);
            }
            const numeric=(typeof value==="number" && Number.isFinite(value));
            if(numeric){
                out.push(`<c r="${ref}" s="${style}" t="n"><v>${value}</v></c>`);
            }else{
                out.push(`<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escXml(value)}</t></is></c>`);
            }
        });
        out.push(`</row>`);
    });
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"/></sheetViews>
<sheetData>${out.join("")}</sheetData>
</worksheet>`;
}
/* ---------------------------------------------------------
   ZIP STORE WRITER — XLSX DOWNLOAD
   Tidak memakai library eksternal.
   Struktur ZIP lengkap: Local Header + Central Directory + EOCD.
   --------------------------------------------------------- */
function crc32(bytes){
    let table=crc32._table;
    if(!table){
        table=[];
        for(let n=0;n<256;n++){
            let c=n;
            for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
            table[n]=c>>>0;
        }
        crc32._table=table;
    }
    let c=0xFFFFFFFF;
    for(let i=0;i<bytes.length;i++) c=table[(c^bytes[i])&255]^(c>>>8);
    return (c^0xFFFFFFFF)>>>0;
}
function u16(n){return [n&255,(n>>>8)&255];}
function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];}
function concatBytes(parts){
    let total=0;
    parts.forEach(function(x){total+=x.length;});
    const out=new Uint8Array(total);
    let p=0;
    parts.forEach(function(x){out.set(x,p);p+=x.length;});
    return out;
}
const TE = new TextEncoder();
function utf8(v){return TE.encode(String(v));}
function zipStore(files){
    const local=[];
    const central=[];
    let offset=0;

    files.forEach(function(f){
        const name=utf8(f.name);
        const data=(f.data instanceof Uint8Array)?f.data:utf8(f.data);
        const crc=crc32(data);
        const size=data.length;

        const localHeader=concatBytes([
            new Uint8Array([0x50,0x4b,0x03,0x04]),
            new Uint8Array(u16(20)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u32(crc)),
            new Uint8Array(u32(size)),
            new Uint8Array(u32(size)),
            new Uint8Array(u16(name.length)),
            new Uint8Array(u16(0)),
            name,
            data
        ]);
        local.push(localHeader);

        const centralHeader=concatBytes([
            new Uint8Array([0x50,0x4b,0x01,0x02]),
            new Uint8Array(u16(20)),
            new Uint8Array(u16(20)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u32(crc)),
            new Uint8Array(u32(size)),
            new Uint8Array(u32(size)),
            new Uint8Array(u16(name.length)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u16(0)),
            new Uint8Array(u32(0)),
            new Uint8Array(u32(offset)),
            name
        ]);
        central.push(centralHeader);
        offset+=localHeader.length;
    });

    const localBytes=concatBytes(local);
    const centralBytes=concatBytes(central);
    const centralOffset=localBytes.length;
    const centralSize=centralBytes.length;

    const eocd=concatBytes([
        new Uint8Array([0x50,0x4b,0x05,0x06]),
        new Uint8Array(u16(0)),
        new Uint8Array(u16(0)),
        new Uint8Array(u16(files.length)),
        new Uint8Array(u16(files.length)),
        new Uint8Array(u32(centralSize)),
        new Uint8Array(u32(centralOffset)),
        new Uint8Array(u16(0))
    ]);

    return concatBytes([localBytes,centralBytes,eocd]);
}

function buildXlsx(p,engine){
    const sheets=sheetsForPeriod(p,engine).map((x,i)=>({name:safeSheetName(x[0],i+1),rows:x[1]}));
    const files=[];
    files.push({name:"[Content_Types].xml",data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`});
    files.push({name:"_rels/.rels",data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`});
    files.push({name:"xl/_rels/workbook.xml.rels",data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join("")}
<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`});
    files.push({name:"xl/workbook.xml",data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="18000" windowHeight="12000"/></bookViews>
<sheets>${sheets.map((x,i)=>`<sheet name="${escXml(x.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join("")}</sheets>
</workbook>`});
    files.push({name:"xl/styles.xml",data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="3">
<numFmt numFmtId="164" formatCode="#,##0"/>
<numFmt numFmtId="165" formatCode="&quot;Rp&quot; #,##0"/>
<numFmt numFmtId="166" formatCode="0.00%"/>
</numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="D9EAD3"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
<xf numFmtId="0" fontId="1" fillId="1" borderId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="0"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`});
    sheets.forEach((x,i)=>files.push({name:`xl/worksheets/sheet${i+1}.xml`,data:sheetXml(x.rows)}));
    return zipStore(files);
}

window.tampilHistory=async function(){
    loading();
    try{
        if(typeof d2GetPeriods!=="function")throw new Error("d2GetPeriods() belum tersedia.");
        const r=await d2GetPeriods({});
        if(!r||r.success===false)throw new Error(r?.message||"Gagal membaca daftar periode.");

        const summaries=Array.isArray(r.periods)
            ? r.periods
            : (Array.isArray(r.data)?r.data:[]);

        /*
         * getPeriods() hanya mengembalikan ringkasan.
         * Untuk kartu History, ambil period lengkap agar:
         * - DOC IN memakai tanggal DOC IN yang sebenarnya
         * - FARM memakai nama yang tersimpan di DOC IN
         * - FLOK dihitung dari FLOK milik period/user
         *
         * Semua panggilan ini READ ONLY.
         */
        const detailed=await Promise.all(summaries.map(async item=>{
            const pid=periodId(item);
            if(!pid || typeof d2GetPeriod!=="function") return item;
            try{
                const full=await d2GetPeriod({period_id:pid});
                if(full && full.success!==false && (full.period||full.data)){
                    return full.period||full.data;
                }
            }catch(err){
                console.warn("HISTORY DETAIL "+pid+" gagal:",err);
            }
            return item;
        }));

        render(detailed,s(r.active_period_id),s(r.active_period_no));
    }catch(err){
        console.error("FMC HISTORY LOAD ERROR:",err);
        errorView(err?.message||"Terjadi kesalahan saat membaca history.");
    }
};


/* =========================================================
   HISTORY DOWNLOAD LOADING UI
   ========================================================= */
function fmcHistoryDownloadLoading_(show, message){
    let el=document.getElementById("fmcHistoryDownloadLoading");
    if(show){
        if(!el){
            el=document.createElement("div");
            el.id="fmcHistoryDownloadLoading";
            el.innerHTML=
                '<div class="fmcHistoryLoadingBox" role="status" aria-live="polite">'+
                  '<div class="fmcHistorySpinner"></div>'+
                  '<div class="fmcHistoryLoadingTitle">Menyiapkan Download</div>'+
                  '<div class="fmcHistoryLoadingMessage"></div>'+
                  '<div class="fmcHistoryLoadingHint">Mohon tunggu, jangan tutup halaman.</div>'+
                '</div>';
            const css=document.createElement("style");
            css.id="fmcHistoryDownloadLoadingCss";
            css.textContent=
                '#fmcHistoryDownloadLoading{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.42);backdrop-filter:blur(2px)}'+
                '#fmcHistoryDownloadLoading .fmcHistoryLoadingBox{width:min(88vw,360px);box-sizing:border-box;padding:24px 20px;border-radius:16px;background:#fff;box-shadow:0 12px 40px rgba(0,0,0,.28);text-align:center;font-family:inherit}'+
                '#fmcHistoryDownloadLoading .fmcHistorySpinner{width:38px;height:38px;margin:0 auto 14px;border:4px solid #d9ead3;border-top-color:#198754;border-radius:50%;animation:fmcHistorySpin .8s linear infinite}'+
                '#fmcHistoryDownloadLoading .fmcHistoryLoadingTitle{font-size:17px;font-weight:700;color:#17351f;margin-bottom:7px}'+
                '#fmcHistoryDownloadLoading .fmcHistoryLoadingMessage{font-size:14px;font-weight:600;color:#198754;min-height:20px}'+
                '#fmcHistoryDownloadLoading .fmcHistoryLoadingHint{font-size:11px;color:#777;margin-top:10px}'+
                '@keyframes fmcHistorySpin{to{transform:rotate(360deg)}}';
            document.head.appendChild(css);
            document.body.appendChild(el);
        }
        const msg=el.querySelector(".fmcHistoryLoadingMessage");
        if(msg)msg.textContent=message||"Memproses...";
        el.style.display="flex";
        return;
    }
    if(el)el.style.display="none";
}

function fmcHistoryDownloadButton_(id, disabled){
    const buttons=document.querySelectorAll(".fmcHistoryDownload");
    buttons.forEach(btn=>{
        try{
            const onclick=String(btn.getAttribute("onclick")||"");
            if(onclick.includes(String(id))) {
                btn.disabled=!!disabled;
                btn.style.pointerEvents=disabled?"none":"";
                btn.style.opacity=disabled?".65":"";
            }
        }catch(_){}
    });
}

window.downloadHistoryPeriod=async function(id,no){
    let finished=false;
    try{
        if(typeof d2GetPeriod!=="function")throw new Error("d2GetPeriod() belum tersedia.");
        if(!id)throw new Error("Period ID tidak tersedia.");

        fmcHistoryDownloadButton_(id,true);
        fmcHistoryDownloadLoading_(true,"Membaca data periode "+(no||id)+"...");
        if(typeof showUpdateToast==="function")showUpdateToast("⏳ Menyiapkan laporan XLSX periode "+no+"...");

        const r=await d2GetPeriod({period_id:id});
        if(!r||r.success===false)throw new Error(r?.message||"Data periode gagal dibaca.");
        const p=r.period||r.data;
        if(!p||typeof p!=="object")throw new Error("Data periode tidak valid.");

        fmcHistoryDownloadLoading_(true,"Mengambil hasil Dashboard, Harian, Keuangan & RHPP...");
        const engine=await fmcHistoryEngineData_(id,p);

        fmcHistoryDownloadLoading_(true,"Membuat file Excel...");
        const bytes=buildXlsx(p,engine);

        fmcHistoryDownloadLoading_(true,"Memulai download file...");
        const blob=new Blob([bytes],{
            type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const safe=String(no||id||"periode").replace(/[^a-zA-Z0-9_-]+/g,"_");
        const filename="FMC_Period_"+safe+".xlsx";
        const a=document.createElement("a");
        const url=URL.createObjectURL(blob);
        a.href=url;a.download=filename;a.style.display="none";
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),3000);

        finished=true;
        fmcHistoryDownloadLoading_(true,"Download selesai ✓");
        if(typeof showUpdateToast==="function")showUpdateToast("✅ Laporan XLSX periode "+no+" selesai didownload");
        setTimeout(()=>fmcHistoryDownloadLoading_(false),900);
    }catch(err){
        console.error("FMC HISTORY XLSX ERROR:",err);
        fmcHistoryDownloadLoading_(false);
        if(typeof showUpdateToast==="function")showUpdateToast("❌ Gagal download XLSX: "+(err?.message||"error"));
    }finally{
        if(!finished)fmcHistoryDownloadButton_(id,false);
        else setTimeout(()=>fmcHistoryDownloadButton_(id,false),950);
    }
};
})();
