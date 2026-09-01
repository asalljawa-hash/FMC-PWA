// ==========================================================
// FMC BROILER MOBILE V11
// MASTER KONTRAK.JS — FINAL V2
// UI + SAVE + GET SERVER
// ==========================================================

"use strict";


// ==========================================================
// IDENTITAS V2
// ==========================================================

window.fmcMasterKontrakVersion = "V2";
console.info("FMC MASTER KONTRAK V2 AKTIF");


// ==========================================================
// DATA UI
// Gunakan window agar tidak bentrok apabila file lama
// pernah termuat sebelumnya.
// ==========================================================

window.fmcMasterKontrakDataUI =
    Array.isArray(window.fmcMasterKontrakDataUI)
        ? window.fmcMasterKontrakDataUI
        : [];


// ==========================================================
// KONSTANTA LOCAL SESSION
// ==========================================================

const FMC_MASTER_KONTRAK_STORAGE =
    "FMC_MASTER_KONTRAK_UI_V2";


// ==========================================================
// TAMPILKAN HALAMAN MASTER KONTRAK
// ==========================================================

async function tampilMasterKontrak(){

    const page =
        document.getElementById("masterKontrakPage");

    if(!page){
        console.warn(
            "MASTER KONTRAK: #masterKontrakPage tidak ditemukan."
        );
        return;
    }


    // ------------------------------------------------------
    // RENDER UI
    // ------------------------------------------------------

    page.innerHTML = `

        <div
            class="card masterKontrakCard"
            data-master-kontrak-version="V2">

            <!-- ==========================================
                 HEADER
            ========================================== -->

            <div class="masterKontrakHeader">

                <div>

                    <div class="masterKontrakSmall">
                        FMC BROILER MOBILE V11
                    </div>

                    <h2>
                        <span class="material-symbols-rounded">
                            handshake
                        </span>
                        Master Kontrak
                    </h2>

                    <p>
                        Pengaturan harga kontrak kemitraan
                    </p>

                    <small
                        style="
                            display:inline-block;
                            margin-top:6px;
                            font-weight:800;
                            opacity:.65;
                        ">
                        MASTER KONTRAK V2
                    </small>

                </div>

            </div>


            <!-- ==========================================
                 PETUNJUK
            ========================================== -->

            <div class="masterKontrakInfo">

                <span class="material-symbols-rounded">
                    info
                </span>

                <div>

                    <strong>
                        Data Kontrak
                    </strong>

                    <p>
                        Silakan isi data BB Avg dan harga
                        kontrak sesuai perjanjian kemitraan
                        Anda. Data ini akan dibaca sistem FMC
                        sebagai dasar perhitungan laba dan profit.
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 DATA KONTRAK
            ========================================== -->

            <div class="masterKontrakSection">

                <div class="masterKontrakSectionTitle">

                    <div>

                        <h3>
                            <span class="material-symbols-rounded">
                                receipt_long
                            </span>
                            Data Harga Kontrak
                        </h3>

                    </div>


                    <button
                        type="button"
                        class="masterKontrakAddBtn"
                        onclick="tambahBarisKontrakUI()">

                        <span class="material-symbols-rounded">
                            add
                        </span>

                        Tambah

                    </button>

                </div>


                <!-- HEADER -->

                <div class="masterKontrakTableHeader">

                    <div>
                        BB AVG
                    </div>

                    <div>
                        HARGA KONTRAK
                    </div>

                    <div></div>

                </div>


                <!-- DATA -->

                <div
                    id="masterKontrakRows"
                    class="masterKontrakRows">
                </div>

            </div>


            <!-- ==========================================
                 MESSAGE
            ========================================== -->

            <div
                id="masterKontrakMessage"
                class="masterKontrakMessage"
                style="display:none;">
            </div>


            <!-- ==========================================
                 SAVE
            ========================================== -->

            <button
                type="button"
                id="btnSimpanMasterKontrak"
                class="masterKontrakSaveBtn"
                onclick="simpanMasterKontrakUI()">

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN MASTER KONTRAK

            </button>

        </div>

    `;


    // ------------------------------------------------------
    // Muat cache lokal dulu agar UI tidak kosong sementara
    // ------------------------------------------------------

    muatMasterKontrakSessionLocal();

    renderBarisKontrakUI();


    // ------------------------------------------------------
    // Setelah UI siap, ambil sumber utama dari server.
    // ------------------------------------------------------

    await muatMasterKontrakDariGAS();

}


// ==========================================================
// NORMALISASI ANGKA
// ==========================================================

function angkaMasterKontrak(value){

    const n =
        Number(
            String(value ?? "")
                .replace(/,/g, "")
                .trim()
        );

    return Number.isFinite(n)
        ? n
        : NaN;
}


// ==========================================================
// NORMALISASI ITEM
// Mendukung beberapa nama field agar response GAS
// tidak terlalu sensitif terhadap bentuk object.
// ==========================================================

function normalisasiItemMasterKontrak(item){

    if(!item || typeof item !== "object"){
        return null;
    }


    const bbAvg =
        item.bbAvg ??
        item.BBAvg ??
        item.BB_AVG ??
        item["BB AVG"] ??
        item.bb_avg;


    const harga =
        item.harga ??
        item.Harga ??
        item.hargaKontrak ??
        item.HargaKontrak ??
        item.HARGA_KONTRAK ??
        item["HARGA KONTRAK"];


    const bb =
        angkaMasterKontrak(bbAvg);

    const h =
        angkaMasterKontrak(harga);


    if(
        !Number.isFinite(bb) ||
        !Number.isFinite(h)
    ){
        return null;
    }


    return {
        bbAvg: bb,
        harga: h
    };
}


// ==========================================================
// NORMALISASI RESPONSE GET
//
// Menerima beberapa bentuk response umum:
// - { items: [...] }
// - { data: [...] }
// - { rows: [...] }
// - { masterKontrak: [...] }
// - { kontrak: [...] }
// - array langsung
// ==========================================================

function normalisasiResponseMasterKontrak(response){

    if(!response){
        return [];
    }


    let raw = null;


    if(Array.isArray(response)){
        raw = response;
    }

    else if(
        Array.isArray(response.items)
    ){
        raw = response.items;
    }

    else if(
        Array.isArray(response.data)
    ){
        raw = response.data;
    }

    else if(
        Array.isArray(response.rows)
    ){
        raw = response.rows;
    }

    else if(
        Array.isArray(response.masterKontrak)
    ){
        raw = response.masterKontrak;
    }

    else if(
        Array.isArray(response.kontrak)
    ){
        raw = response.kontrak;
    }

    else if(
        response.data &&
        typeof response.data === "object"
    ){

        if(
            Array.isArray(response.data.items)
        ){
            raw = response.data.items;
        }

        else if(
            Array.isArray(response.data.rows)
        ){
            raw = response.data.rows;
        }

        else if(
            Array.isArray(response.data.masterKontrak)
        ){
            raw = response.data.masterKontrak;
        }

    }


    if(!Array.isArray(raw)){
        return [];
    }


    return raw
        .map(normalisasiItemMasterKontrak)
        .filter(Boolean);

}


// ==========================================================
// RENDER BARIS
// ==========================================================

function renderBarisKontrakUI(){

    const container =
        document.getElementById(
            "masterKontrakRows"
        );

    if(!container){
        return;
    }


    const data =
        window.fmcMasterKontrakDataUI;


    if(
        !Array.isArray(data) ||
        data.length === 0
    ){

        container.innerHTML = `

            <div class="masterKontrakEmpty">

                <span class="material-symbols-rounded">
                    edit_note
                </span>

                <strong>
                    Belum ada data kontrak
                </strong>

                <small>
                    Silakan isi BB Avg dan harga kontrak
                    sesuai perjanjian kemitraan Anda.
                </small>

            </div>

        `;

        return;
    }


    container.innerHTML =
        data.map(
            function(item,index){

                return `

                    <div
                        class="masterKontrakRow"
                        data-index="${index}">

                        <div
                            class="masterKontrakInputGroup">

                            <label>
                                BB Avg
                            </label>

                            <input
                                type="number"
                                class="kontrakBBAvg"
                                min="0"
                                step="0.01"
                                inputmode="decimal"
                                placeholder="Contoh 0.80"
                                value="${item.bbAvg ?? ""}"
                                oninput="
                                    ubahDataKontrakUI(
                                        ${index},
                                        'bbAvg',
                                        this.value
                                    )
                                ">

                        </div>


                        <div
                            class="masterKontrakInputGroup">

                            <label>
                                Harga Kontrak
                            </label>

                            <input
                                type="number"
                                class="kontrakHarga"
                                min="0"
                                step="1"
                                inputmode="numeric"
                                placeholder="Contoh 24200"
                                value="${item.harga ?? ""}"
                                oninput="
                                    ubahDataKontrakUI(
                                        ${index},
                                        'harga',
                                        this.value
                                    )
                                ">

                        </div>


                        <button
                            type="button"
                            class="masterKontrakDeleteBtn"
                            title="Hapus baris"
                            onclick="
                                hapusBarisKontrakUI(${index})
                            ">

                            <span class="material-symbols-rounded">
                                delete
                            </span>

                        </button>

                    </div>

                `;

            }
        ).join("");

}


// ==========================================================
// TAMBAH BARIS
// ==========================================================

function tambahBarisKontrakUI(){

    window.fmcMasterKontrakDataUI.push({

        bbAvg: "",
        harga: ""

    });


    simpanMasterKontrakSessionLocal();

    renderBarisKontrakUI();


    const rows =
        document.querySelectorAll(
            ".masterKontrakRow"
        );


    const last =
        rows[rows.length - 1];


    if(last){

        const input =
            last.querySelector(
                ".kontrakBBAvg"
            );


        if(input){

            input.focus();

        }

    }

}


// ==========================================================
// UBAH DATA
// ==========================================================

function ubahDataKontrakUI(
    index,
    field,
    value
){

    const data =
        window.fmcMasterKontrakDataUI;


    if(
        !Array.isArray(data) ||
        !data[index]
    ){
        return;
    }


    data[index][field] =
        value;


    simpanMasterKontrakSessionLocal();

}


// ==========================================================
// HAPUS BARIS
// ==========================================================

function hapusBarisKontrakUI(index){

    const data =
        window.fmcMasterKontrakDataUI;


    if(
        !Array.isArray(data) ||
        index < 0 ||
        index >= data.length
    ){
        return;
    }


    const yakin =
        confirm(
            `Hapus data kontrak pada baris ${index + 1}?`
        );


    if(!yakin){
        return;
    }


    data.splice(
        index,
        1
    );


    simpanMasterKontrakSessionLocal();

    renderBarisKontrakUI();

}


// ==========================================================
// VALIDASI
// ==========================================================

function validasiMasterKontrakUI(){

    const data =
        window.fmcMasterKontrakDataUI;


    if(
        !Array.isArray(data) ||
        data.length === 0
    ){

        return {

            valid: false,

            message:
                "Silakan tambahkan data kontrak terlebih dahulu."

        };

    }


    const bbAvgSet =
        new Set();


    for(
        let i = 0;
        i < data.length;
        i++
    ){

        const item =
            data[i];


        const bbAvg =
            angkaMasterKontrak(
                item.bbAvg
            );


        const harga =
            angkaMasterKontrak(
                item.harga
            );


        if(
            !Number.isFinite(bbAvg)
        ){

            return {

                valid: false,

                message:
                    `BB Avg pada baris ${i + 1} belum diisi.`

            };

        }


        if(
            bbAvg < 0
        ){

            return {

                valid: false,

                message:
                    `BB Avg pada baris ${i + 1} tidak valid.`

            };

        }


        if(
            !Number.isFinite(harga)
        ){

            return {

                valid: false,

                message:
                    `Harga kontrak pada baris ${i + 1} belum diisi.`

            };

        }


        if(
            harga <= 0
        ){

            return {

                valid: false,

                message:
                    `Harga kontrak pada baris ${i + 1} harus lebih dari 0.`

            };

        }


        const key =
            bbAvg.toFixed(2);


        if(
            bbAvgSet.has(key)
        ){

            return {

                valid: false,

                message:
                    `BB Avg ${key} ditemukan lebih dari satu kali.`

            };

        }


        bbAvgSet.add(key);

    }


    return {

        valid: true,

        message:
            "Data kontrak siap disimpan."

    };

}



// ==========================================================
// D2 ACTIVE PERIOD — MASTER KONTRAK
// UI TIDAK BERUBAH. Helper ini hanya menentukan period_id.
// ==========================================================

function getFmcMasterKontrakActivePeriodId_(){
    return String(
        window.fmcMasterKontrakActivePeriodId ||
        localStorage.getItem("fmcD2ActivePeriodId") ||
        ""
    ).trim();
}

function setFmcMasterKontrakActivePeriodId_(periodId){
    const value = String(periodId ?? "").trim();
    if(!value) return;

    window.fmcMasterKontrakActivePeriodId = value;

    try{
        localStorage.setItem("fmcD2ActivePeriodId", value);
    }catch(error){
        console.warn("MASTER KONTRAK: gagal menyimpan active period.", error);
    }
}

function pilihFmcMasterKontrakPeriod_(result){
    let periods = [];

    if(Array.isArray(result?.periods)){
        periods = result.periods;
    }else if(Array.isArray(result?.data?.periods)){
        periods = result.data.periods;
    }else if(Array.isArray(result?.data)){
        periods = result.data;
    }

    const normalized = periods.map(function(period){
        const id = String(
            period?.period_id || period?.id || ""
        ).trim();
        if(!id) return null;
        return {
            id: id,
            status: String(period?.status || "").trim().toUpperCase(),
            updated_at: String(period?.updated_at || period?.created_at || "").trim()
        };
    }).filter(Boolean);

    if(normalized.length === 1){
        return normalized[0].id;
    }

    const open = normalized.filter(function(period){
        return period.status === "OPEN";
    });

    if(open.length === 1){
        return open[0].id;
    }

    if(open.length > 1){
        open.sort(function(a,b){
            return (Date.parse(b.updated_at) || 0) - (Date.parse(a.updated_at) || 0);
        });
        return open[0].id;
    }

    return "";
}

async function resolveFmcMasterKontrakActivePeriodId_(){
    const existing = getFmcMasterKontrakActivePeriodId_();
    if(existing) return existing;

    try{
        const result = await apiPost("getPeriods", {});
        const selected = pilihFmcMasterKontrakPeriod_(result);
        if(selected){
            setFmcMasterKontrakActivePeriodId_(selected);
        }
        return selected;
    }catch(error){
        console.warn("MASTER KONTRAK: gagal resolve active period.", error);
        return "";
    }
}

// ==========================================================
// SIMPAN KE GAS
// ==========================================================

async function simpanMasterKontrakUI(){

    const hasil =
        validasiMasterKontrakUI();


    if(!hasil.valid){

        tampilPesanMasterKontrak(
            hasil.message,
            "warning"
        );

        return;

    }


    const button =
        document.getElementById(
            "btnSimpanMasterKontrak"
        );


    if(button){

        button.disabled = true;

        button.innerHTML = `
            <span class="material-symbols-rounded">
                sync
            </span>
            MENYIMPAN...
        `;

    }


    try{

        // Pastikan nilai yang dikirim adalah angka.
        const items =
            window.fmcMasterKontrakDataUI.map(
                function(item){

                    return {

                        bbAvg:
                            Number(item.bbAvg),

                        harga:
                            Number(item.harga)

                    };

                }
            );


        const periodId =
            await resolveFmcMasterKontrakActivePeriodId_();

        if(!periodId){
            throw new Error(
                "Periode aktif Master Kontrak belum tersedia."
            );
        }

        const result =
            await apiPost(
                "saveMasterKontrak",
                {
                    period_id: periodId,
                    items:
                        JSON.stringify(items)
                }
            );


        if(
            !result ||
            result.success !== true
        ){

            throw new Error(
                result?.message ||
                "Data Master Kontrak gagal disimpan ke server."
            );

        }


        // --------------------------------------------------
        // SAVE SERVER BERHASIL
        // --------------------------------------------------

        window.fmcMasterKontrakDataUI =
            items.map(
                item => ({
                    bbAvg: item.bbAvg,
                    harga: item.harga
                })
            );


        simpanMasterKontrakSessionLocal();

        renderBarisKontrakUI();


        tampilPesanMasterKontrak(
            result.message ||
            "Data Master Kontrak berhasil disimpan di server.",
            "success"
        );


        tampilToastServerMasterKontrak(
            "📢 Data Master Kontrak berhasil tersimpan di server"
        );


        // --------------------------------------------------
        // VERIFIKASI DENGAN GET SERVER
        // --------------------------------------------------

        try{

            await muatMasterKontrakDariGAS({
                silent: true
            });


            tampilPesanMasterKontrak(
                "Data Master Kontrak tersimpan dan berhasil diverifikasi dari server.",
                "success"
            );

        }
        catch(verifyError){

            console.warn(
                "MASTER KONTRAK: SAVE sukses, GET verifikasi gagal.",
                verifyError
            );


            tampilPesanMasterKontrak(
                "Data sudah tersimpan di server. Verifikasi GET belum tersedia.",
                "warning"
            );

        }

    }
    catch(error){

        console.error(
            "MASTER KONTRAK SAVE ERROR:",
            error
        );


        tampilPesanMasterKontrak(
            error?.message ||
            "Data Master Kontrak gagal dikirim ke server.",
            "error"
        );


        tampilToastServerMasterKontrak(
            "📢❌ Data Master Kontrak belum berhasil tersimpan di server"
        );

    }
    finally{

        if(button){

            button.disabled = false;

            button.innerHTML = `
                <span class="material-symbols-rounded">
                    save
                </span>
                SIMPAN MASTER KONTRAK
            `;

        }

    }

}


// ==========================================================
// GET MASTER KONTRAK DARI GAS
//
// Action yang dipanggil:
// getMasterKontrak
// ==========================================================

async function muatMasterKontrakDariGAS(
    options = {}
){

    const silent =
        options.silent === true;


    try{

        const periodId =
            await resolveFmcMasterKontrakActivePeriodId_();

        if(!periodId){
            throw new Error(
                "Periode aktif Master Kontrak belum tersedia."
            );
        }

        const result =
            await apiPost(
                "getMasterKontrak",
                {
                    period_id: periodId
                }
            );


        if(
            !result ||
            result.success === false
        ){

            throw new Error(
                result?.message ||
                "Data Master Kontrak belum dapat dibaca dari server."
            );

        }


        const items =
            normalisasiResponseMasterKontrak(
                result
            );


        // --------------------------------------------------
        // Jika server benar-benar mengembalikan array kosong,
        // kosongkan UI. Jangan mempertahankan data lama
        // sebagai data server.
        // --------------------------------------------------

        window.fmcMasterKontrakDataUI =
            items;


        simpanMasterKontrakSessionLocal();

        renderBarisKontrakUI();


        if(!silent){

            if(items.length){

                tampilPesanMasterKontrak(
                    `Data Master Kontrak berhasil dimuat dari server (${items.length} baris).`,
                    "success"
                );

            }
            else{

                tampilPesanMasterKontrak(
                    "Server belum memiliki data Master Kontrak.",
                    "info"
                );

            }

        }


        console.info(
            "MASTER KONTRAK GET OK:",
            items
        );


        return items;

    }
    catch(error){

        console.error(
            "MASTER KONTRAK GET ERROR:",
            error
        );


        if(!silent){

            tampilPesanMasterKontrak(
                "📢 Data server Master Kontrak belum dapat dimuat. Data lokal tetap ditampilkan.",
                "warning"
            );

        }


        throw error;

    }

}


// ==========================================================
// DATA UNTUK GAS
// Fungsi terpisah agar mudah dipanggil modul lain.
// ==========================================================

async function kirimMasterKontrakKeGAS(){

    const hasil =
        validasiMasterKontrakUI();


    if(!hasil.valid){

        return {

            success: false,

            message:
                hasil.message

        };

    }


    const items =
        window.fmcMasterKontrakDataUI.map(
            function(item){

                return {

                    bbAvg:
                        Number(item.bbAvg),

                    harga:
                        Number(item.harga)

                };

            }
        );


    return await apiPost(
        "saveMasterKontrak",
        {
            items:
                JSON.stringify(items)
        }
    );

}


// ==========================================================
// LOCAL SESSION
// Hanya cache/fallback UI.
// Server tetap menjadi sumber utama.
// ==========================================================

function simpanMasterKontrakSessionLocal(){

    try{

        localStorage.setItem(
            FMC_MASTER_KONTRAK_STORAGE,
            JSON.stringify(
                window.fmcMasterKontrakDataUI || []
            )
        );

    }
    catch(error){

        console.warn(
            "MASTER KONTRAK LOCAL SAVE ERROR:",
            error
        );

    }

}


function muatMasterKontrakSessionLocal(){

    try{

        const raw =
            localStorage.getItem(
                FMC_MASTER_KONTRAK_STORAGE
            );


        if(!raw){
            return;
        }


        const parsed =
            JSON.parse(raw);


        if(
            Array.isArray(parsed)
        ){

            window.fmcMasterKontrakDataUI =
                parsed
                    .map(normalisasiItemMasterKontrak)
                    .filter(Boolean);

        }

    }
    catch(error){

        console.warn(
            "MASTER KONTRAK LOCAL LOAD ERROR:",
            error
        );

    }

}


// ==========================================================
// PESAN UTAMA
// ==========================================================

function tampilPesanMasterKontrak(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "masterKontrakMessage"
        );


    if(!el){
        return;
    }


    el.style.display =
        "block";


    el.className =
        "masterKontrakMessage " +
        tipe;


    el.textContent =
        pesan;

}


// ==========================================================
// TOAST SERVER
// Tidak bergantung pada fungsi toast modul lain.
// ==========================================================

function tampilToastServerMasterKontrak(
    pesan
){

    let toast =
        document.getElementById(
            "masterKontrakServerToast"
        );


    if(!toast){

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "masterKontrakServerToast";


        toast.style.position =
            "fixed";

        toast.style.left =
            "50%";

        toast.style.bottom =
            "86px";

        toast.style.transform =
            "translateX(-50%) translateY(10px)";

        toast.style.zIndex =
            "99999";

        toast.style.maxWidth =
            "calc(100vw - 32px)";

        toast.style.padding =
            "12px 16px";

        toast.style.borderRadius =
            "14px";

        toast.style.background =
            "#173126";

        toast.style.color =
            "#ffffff";

        toast.style.fontSize =
            "14px";

        toast.style.fontWeight =
            "700";

        toast.style.textAlign =
            "center";

        toast.style.boxShadow =
            "0 8px 30px rgba(0,0,0,.22)";

        toast.style.opacity =
            "0";

        toast.style.transition =
            "opacity .2s ease, transform .2s ease";

        toast.style.pointerEvents =
            "none";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        pesan;


    toast.style.opacity =
        "1";

    toast.style.transform =
        "translateX(-50%) translateY(0)";


    clearTimeout(
        window.__fmcMasterKontrakToastTimer
    );


    window.__fmcMasterKontrakToastTimer =
        setTimeout(
            function(){

                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateX(-50%) translateY(10px)";

            },
            3500
        );

}


// ==========================================================
// DEBUG HELPER
// Bisa dipanggil dari console:
// debugMasterKontrakV2()
// ==========================================================

function debugMasterKontrakV2(){

    const result = {

        version:
            window.fmcMasterKontrakVersion,

        data:
            window.fmcMasterKontrakDataUI,

        page:
            !!document.getElementById(
                "masterKontrakPage"
            ),

        rows:
            !!document.getElementById(
                "masterKontrakRows"
            ),

        apiPost:
            typeof apiPost === "function"

    };


    console.table(result);

    console.log(
        "MASTER KONTRAK V2 DATA:",
        window.fmcMasterKontrakDataUI
    );


    return result;

}


// ==========================================================
// END MASTER KONTRAK V2
// ==========================================================
