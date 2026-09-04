// ==========================================
// FMC BROILER MOBILE
// DOC IN.JS
// ==========================================

"use strict";


// ==========================================
// DATA SEMENTARA DOC IN
// ==========================================

window.fmcDocInDataSesi =
    window.fmcDocInDataSesi || [];


/*
 * ==========================================
 * D2 ACTIVE PERIOD
 * ==========================================
 *
 * GET DOC IN membutuhkan period_id jika tenant
 * mempunyai lebih dari satu periode.
 */
window.fmcD2ActivePeriodId =
    window.fmcD2ActivePeriodId ||
    localStorage.getItem("fmcD2ActivePeriodId") ||
    "";

function getFmcD2ActivePeriodId(){
    return String(
        window.fmcD2ActivePeriodId ||
        localStorage.getItem("fmcD2ActivePeriodId") ||
        ""
    ).trim();
}

function setFmcD2ActivePeriodId(periodId){
    const value =
        String(periodId ?? "").trim();

    if(!value){
        return;
    }

    window.fmcD2ActivePeriodId = value;

    try{
        localStorage.setItem(
            "fmcD2ActivePeriodId",
            value
        );
    }
    catch(error){
        console.warn(
            "DOC IN: gagal menyimpan active period.",
            error
        );
    }
}


/*
 * ==========================================
 * RESOLVE ACTIVE PERIOD DARI DAFTAR SERVER
 * ==========================================
 *
 * Aturan aman:
 * 1. Jika pointer lokal masih ada, gunakan pointer itu.
 * 2. Jika server hanya memiliki satu period, gunakan period tersebut.
 * 3. Jika server memiliki beberapa period tetapi hanya
 *    satu yang OPEN, gunakan satu-satunya OPEN.
 * 4. Jika beberapa period OPEN, jangan menebak.
 */
function resolveFmcD2PeriodFromList_(
    source
){
    const periods =
        Array.isArray(source)
            ? source
            : (
                source &&
                Array.isArray(source.periods)
                    ? source.periods
                    : (
                        source &&
                        Array.isArray(source.data)
                            ? source.data
                            : (
                                source &&
                                source.data &&
                                Array.isArray(
                                    source.data.periods
                                )
                                    ? source.data.periods
                                    : []
                            )
                    )
            );

    const normalized =
        periods
            .map(function(period){
                const id =
                    String(
                        period?.period_id ||
                        period?.id ||
                        ""
                    ).trim();

                if(!id){
                    return null;
                }

                return {
                    id: id,
                    status:
                        String(
                            period?.status ||
                            ""
                        ).trim().toUpperCase(),
                    created_at:
                        String(
                            period?.created_at ||
                            ""
                        ).trim()
                };
            })
            .filter(Boolean);

    if(normalized.length === 1){
        return normalized[0].id;
    }

    const open =
        normalized.filter(function(period){
            return period.status === "OPEN";
        });

    if(open.length === 1){
        return open[0].id;
    }

    return "";
}


/*
 * Ambil period dari GAS 2 hanya ketika
 * pointer aktif belum tersedia.
 */
async function resolveFmcD2ActivePeriod_(){
    /*
     * FMC D2 ACTIVE PERIOD — SERVER IS SOURCE OF TRUTH.
     *
     * LocalStorage hanya cache.
     * JANGAN pernah memakai pointer lokal sebelum server
     * memberikan active_period_id terbaru. Ini mencegah
     * PWA tertahan di periode lama (mis. 8) ketika server
     * sudah berpindah ke periode baru (mis. 9).
     */

    if(typeof d2GetPeriods !== "function"){
        console.warn(
            "DOC IN: d2GetPeriods() belum tersedia."
        );

        /* Cache hanya fallback terakhir ketika API bridge
         * memang belum tersedia. */
        return String(
            window.fmcD2ActivePeriodId ||
            localStorage.getItem("fmcD2ActivePeriodId") ||
            ""
        ).trim();
    }

    try{
        const result = await d2GetPeriods({});

        if(!result || result.success !== true){
            console.warn(
                "DOC IN PERIOD GET:",
                result?.message ||
                "getPeriods gagal."
            );
            return "";
        }

        /*
         * PRIORITAS MUTLAK:
         * active_period_id dari server.
         */
        const serverActiveId = String(
            result.active_period_id ||
            result.activePeriodId ||
            result.data?.active_period_id ||
            result.data?.activePeriodId ||
            ""
        ).trim();

        const serverActiveNo = String(
            result.active_period_no ||
            result.activePeriodNo ||
            result.data?.active_period_no ||
            result.data?.activePeriodNo ||
            ""
        ).trim();

        if(serverActiveId){
            setFmcD2ActivePeriodId(serverActiveId);
            window.fmcD2ActivePeriodNo = serverActiveNo;
            return serverActiveId;
        }

        /*
         * Kompatibilitas dengan bridge lama: jika server belum
         * mengirim pointer aktif, coba daftar period.
         */
        const periodId =
            resolveFmcD2PeriodFromList_(result);

        if(periodId){
            setFmcD2ActivePeriodId(periodId);
            return periodId;
        }

        /*
         * Jangan memakai cache lama jika server gagal menentukan
         * active period. Dengan dua periode, memakai cache lama
         * justru dapat mengembalikan PWA ke periode 8.
         */
        console.warn(
            "DOC IN: active period server belum tersedia."
        );
        return "";
    }
    catch(error){
        console.error(
            "DOC IN PERIOD RESOLVE ERROR:",
            error
        );

        return "";
    }
}

function resolveFmcD2PeriodId(source){
    if(!source || typeof source !== "object"){
        return "";
    }

    return String(
        source.period_id ||
        source.periodId ||
        source.active_period_id ||
        source.activePeriodId ||
        source.period?.period_id ||
        source.period?.periodId ||
        source.data?.period_id ||
        source.data?.periodId ||
        source.doc_in?.period_id ||
        source.docIn?.period_id ||
        ""
    ).trim();
}


// ==========================================
// D2 DYNAMIC FLOK CONFIG
// ==========================================

const FMC_DOCIN_MAX_FLOK = 6;

const FMC_DOCIN_FLOK_LETTERS = [
    "A", "B", "C", "D", "E", "F"
];

function getDocInFlokConfig(){
    let user = {};

    try{
        if(typeof getLoginUser === "function"){
            user = getLoginUser() || {};
        }
    }
    catch(error){
        console.warn("DOC IN: gagal membaca session user.", error);
    }

    let floks = [];

    if(Array.isArray(user.floks)){
        floks = user.floks;
    }
    else if(Array.isArray(user?.config?.floks)){
        floks = user.config.floks;
    }

    const normalized = [];

    floks.forEach(function(item){
        const id = String(
            item?.id ||
            item?.name ||
            ""
        )
        .trim()
        .toUpperCase()
        .replace(/^FLOK\s+/, "");

        if(
            FMC_DOCIN_FLOK_LETTERS.includes(id) &&
            !normalized.includes(id)
        ){
            normalized.push(id);
        }
    });

    /*
     * Jika session belum membawa daftar FLOK,
     * gunakan flok_count sebagai fallback.
     */
    if(!normalized.length){
        const count = Number(
            user.flok_count ??
            user.cage ??
            user.config?.flok_count ??
            user.config?.cage ??
            0
        );

        if(Number.isInteger(count) && count > 0){
            return FMC_DOCIN_FLOK_LETTERS.slice(
                0,
                Math.min(count, FMC_DOCIN_MAX_FLOK)
            );
        }
    }

    return normalized.slice(0, FMC_DOCIN_MAX_FLOK);
}


function renderDocInFlokInputs(){
    const wrap =
        document.getElementById(
            "docinFlokInputs"
        );

    if(!wrap) return;

    const floks =
        getDocInFlokConfig();

    wrap.innerHTML =
        floks.map(function(letter){

            return `
                <div
                    class="docinFlok"
                    data-flok="${letter}">

                    <div class="docinFlokTitle">
                        FLOK ${letter}
                    </div>

                    <label for="docinPop${letter}">
                        Populasi
                    </label>

                    <input
                        type="number"
                        id="docinPop${letter}"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        placeholder="Jumlah ekor">

                    <label for="docinTgl${letter}">
                        Tanggal DOC
                    </label>

                    <input
                        type="date"
                        id="docinTgl${letter}">
                </div>
            `;

        }).join("");
}


function getDocInFlokLetters(){
    const floks =
        getDocInFlokConfig();

    return floks.length
        ? floks
        : ["A"];
}


// ==========================================
// TAMPILKAN HALAMAN DOC IN
// ==========================================

// FMC FAST OPEN — DOC IN CACHE (DISPLAY ONLY)
function fmcDocInCacheKey_(){ const p=String(window.fmcD2ActivePeriodId||localStorage.getItem("fmcD2ActivePeriodId")||"default").trim()||"default"; return "fmc_docin_fast_cache_v3_"+p; }
function fmcDocInSaveCache_(data,periodId){ try{ localStorage.setItem("fmc_docin_fast_cache_v3_"+String(periodId||"default").trim(),JSON.stringify({saved_at:Date.now(),data:data||null})); }catch(e){ console.warn("DOC IN CACHE SAVE:",e); } }
function fmcDocInApplyCache_(){ try{ const raw=localStorage.getItem(fmcDocInCacheKey_()); if(!raw)return false; const parsed=JSON.parse(raw),data=parsed?.data; if(!data)return false; isiFormDocIn(data); restoreDocInServerToPWA(data,window.fmcD2ActivePeriodId||localStorage.getItem("fmcD2ActivePeriodId")||""); return true; }catch(e){ console.warn("DOC IN CACHE APPLY:",e); return false; } }

async function tampilDocIn(){

    const page =
        document.getElementById(
            "docinPage"
        );

    if(!page) return;


    page.innerHTML = `

        <div class="card docinCard">


            <!-- ==================================
                 HEADER
            ================================== -->

            <div class="docinHeader">

                <div>

                    <h2>

                        <span class="material-symbols-rounded">
                            description
                        </span>

                        DOC In

                    </h2>


                    <p>
                        Input data awal periode dan populasi flok.
                    </p>

                </div>

            </div>


            <!-- ==================================
                 DATA UTAMA DOC IN
            ================================== -->

            <div class="docinSection">

                <h3>

                    <span class="material-symbols-rounded">
                        calendar_month
                    </span>

                    Data DOC In

                </h3>


                <label for="docinTanggal">
                    Tanggal DOC In
                </label>

                <input
                    type="date"
                    id="docinTanggal"
                    autocomplete="off">


                <label for="docinPerusahaan">
                    Nama PT / CV
                </label>

                <input
                    type="text"
                    id="docinPerusahaan"
                    placeholder="Nama perusahaan / farm"
                    autocomplete="off">


                <label for="docinPeriode">
                    Periode Ke
                </label>

                <input
                    type="number"
                    id="docinPeriode"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    placeholder="Contoh: 8"
                    autocomplete="off">


                <label for="docinSupplier">
                    Supplier DOC In
                </label>

                <input
                    type="text"
                    id="docinSupplier"
                    placeholder="Nama supplier DOC"
                    autocomplete="off">


                <label for="docinHarga">
                    Harga DOC / Ekor
                </label>

                <input
                    type="number"
                    id="docinHarga"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Contoh: 8500"
                    autocomplete="off">

            </div>


            <!-- ==================================
                 DATA FLOK
            ================================== -->

            <div class="docinSection">

                <h3>

                    <span class="material-symbols-rounded">
                        warehouse
                    </span>

                    Populasi Flok

                </h3>


                <div
                    id="docinFlokInputs"
                    class="docinFlokInputs">
                    <!-- FLOK dinamis A-F dibuat oleh renderDocInFlokInputs() -->
                </div>

            </div>


            <!-- ==================================
                 TAMBAH DATA
            ================================== -->

            <button
                type="button"
                id="btnTambahDocIn"
                class="docinAddBtn"
                onclick="tambahDataDocIn()">

                <span class="material-symbols-rounded">
                    add
                </span>

                TAMBAH DATA

            </button>


            <!-- ==================================
                 DATA YANG DISIAPKAN
            ================================== -->

            <div class="docinSection">

                <h3>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    Data Yang Disiapkan

                </h3>


                <div
                    id="docinTableWrap"
                    class="docinTableWrap">

                    ${renderDocInTable()}

                </div>

            </div>


            <!-- ==================================
                 HASIL DARI SPREADSHEET
            ================================== -->

            <div class="docinResult">

                <div class="docinResultIcon">

                    <span class="material-symbols-rounded">
                        calculate
                    </span>

                </div>


                <div>

                    <small>
                        TOTAL DOC IN
                    </small>

                    <strong id="docinTotal">
                        —
                    </strong>

                </div>

            </div>


            <!-- ==================================
                 MESSAGE
            ================================== -->

            <div
                id="docinMessage"
                class="docinMessage"
                style="display:none;">
            </div>


            <!-- ==================================
                 BUTTON
            ================================== -->

            <button
                type="button"
                id="btnSimpanDocIn"
                class="docinSaveBtn"
                onclick="simpanDocIn()">

                <span class="material-symbols-rounded">
                    cloud_upload
                </span>

                SIMPAN DATA DOC IN

            </button>


        </div>

    `;


    renderDocInFlokInputs();

    fmcDocInApplyCache_();
    Promise.resolve().then(function(){ muatDocIn(); });

}



// ==========================================
// AMBIL DATA FORM
// ==========================================

function ambilFormDocIn(){

    const result = {
        tanggal:
            document.getElementById(
                "docinTanggal"
            )?.value || "",

        perusahaan:
            document.getElementById(
                "docinPerusahaan"
            )?.value.trim() || "",

        periode:
            document.getElementById(
                "docinPeriode"
            )?.value || "",

        supplier:
            document.getElementById(
                "docinSupplier"
            )?.value.trim() || "",

        harga:
            document.getElementById(
                "docinHarga"
            )?.value || "",

        floks: {}
    };

    getDocInFlokLetters().forEach(
        function(letter){

            result.floks[letter] = {
                populasi:
                    document.getElementById(
                        "docinPop" + letter
                    )?.value || "",

                tanggal:
                    document.getElementById(
                        "docinTgl" + letter
                    )?.value || ""
            };

            /*
             * Field lama tetap tersedia untuk
             * kompatibilitas internal.
             */
            result[
                "flok" + letter
            ] = result.floks[letter];

        }
    );

    return result;
}


// ==========================================
// VALIDASI
// ==========================================

function validasiDocIn(data){

    if(!data.tanggal){

        tampilPesanDocIn(
            "Tanggal DOC In belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.perusahaan){

        tampilPesanDocIn(
            "Nama PT / CV belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.periode){

        tampilPesanDocIn(
            "Periode belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.supplier){

        tampilPesanDocIn(
            "Supplier DOC belum diisi.",
            "error"
        );

        return false;

    }


    if(data.harga === ""){

        tampilPesanDocIn(
            "Harga DOC belum diisi.",
            "error"
        );

        return false;

    }


    return true;

}



// ==========================================
// TAMBAH DATA DOC IN
// ==========================================

function tambahDataDocIn(){

    const data =
        ambilFormDocIn();


    if(!validasiDocIn(data)){
        return;
    }


    /*
     * Masukkan data lengkap
     * ke sesi PWA.
     */

    data.__fmcLocalDraft = true;

    window.fmcDocInDataSesi.push(
        data
    );


    /*
     * Tampilkan rekapan terbaru.
     */

    renderDocInTableInPage();


    /*
     * Bersihkan form supaya
     * user bisa memasukkan data berikutnya.
     */

    kosongkanFormDocIn();


    tampilPesanDocIn(
        "Data DOC In berhasil ditambahkan.",
        "success"
    );

}



// ==========================================
// RENDER REKAPAN DOC IN
// ==========================================

function renderDocInTable(){

    const data =
        window.fmcDocInDataSesi || [];

    if(!data.length){

        return `

            <div class="docinEmpty">

                <span class="material-symbols-rounded">
                    inventory_2
                </span>

                <strong>
                    Belum ada data
                </strong>

                <small>
                    Data DOC In yang ditambahkan
                    akan muncul di sini.
                </small>

            </div>

        `;

    }

    return `

        <div class="docinRekapList">

            ${
                data.map(
                    function(item,index){

                        const floks =
                            Array.isArray(item.floks)
                                ? item.floks
                                : getDocInFlokLetters().map(
                                    function(letter){
                                        return {
                                            id: letter,
                                            populasi:
                                                item[
                                                    "flok" + letter
                                                ]?.populasi || "",
                                            tanggal:
                                                item[
                                                    "flok" + letter
                                                ]?.tanggal || ""
                                        };
                                    }
                                );

                        return `

                            <div
                                class="docinRekapItem">

                                <div
                                    class="docinRekapHeader">

                                    <div>

                                        <strong>
                                            DOC In #${index + 1}
                                        </strong>

                                        <small>
                                            ${escapeDocIn(
                                                item.tanggal
                                            )}
                                        </small>

                                    </div>

                                    <button
                                        type="button"
                                        class="docinDeleteBtn"
                                        onclick="hapusDataDocIn(${index})"
                                        aria-label="Hapus data"
                                        style="display:none;">

                                        <span class="material-symbols-rounded">
                                            delete
                                        </span>

                                    </button>

                                </div>

                                <div
                                    class="docinRekapGrid">

                                    <div>
                                        <small>PT / CV</small>
                                        <strong>
                                            ${escapeDocIn(
                                                item.perusahaan
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <small>PERIODE</small>
                                        <strong>
                                            ${escapeDocIn(
                                                item.periode
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <small>SUPPLIER</small>
                                        <strong>
                                            ${escapeDocIn(
                                                item.supplier
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <small>HARGA / EKOR</small>
                                        <strong>
                                            ${escapeDocIn(
                                                item.harga
                                            )}
                                        </strong>
                                    </div>

                                </div>

                                <div
                                    class="docinRekapFlok">

                                    ${
                                        floks.map(
                                            function(flok){

                                                const id =
                                                    String(
                                                        flok?.id || ""
                                                    )
                                                    .trim()
                                                    .toUpperCase();

                                                return `
                                                    <div>

                                                        <small>
                                                            FLOK ${escapeDocIn(id)}
                                                        </small>

                                                        <strong>
                                                            ${escapeDocIn(
                                                                flok?.populasi ?? ""
                                                            )}
                                                        </strong>

                                                        <small>
                                                            ${escapeDocIn(
                                                                flok?.tanggal ?? ""
                                                            )}
                                                        </small>

                                                    </div>
                                                `;

                                            }
                                        ).join("")
                                    }

                                </div>

                            </div>

                        `;

                    }
                ).join("")
            }

        </div>

    `;

}


// ==========================================
// REFRESH REKAPAN
// ==========================================

function renderDocInTableInPage(){

    const wrap =
        document.getElementById(
            "docinTableWrap"
        );


    if(!wrap){
        return;
    }


    wrap.innerHTML =
        renderDocInTable();

}



// ==========================================
// HAPUS DATA DOC IN
// ==========================================

function hapusDataDocIn(index){

    if(!Number.isInteger(index)){
        return;
    }


    if(
        index < 0 ||
        index >=
        window.fmcDocInDataSesi.length
    ){

        return;

    }


    const yakin =
        confirm(
            `Hapus data DOC In #${index + 1}?`
        );


    if(!yakin){
        return;
    }


    window.fmcDocInDataSesi.splice(
        index,
        1
    );


    renderDocInTableInPage();


    tampilPesanDocIn(
        "Data DOC In berhasil dihapus.",
        "success"
    );

}



// ==========================================
// KOSONGKAN FORM
// ==========================================

function kosongkanFormDocIn(){

    const ids = [
        "docinTanggal",
        "docinPerusahaan",
        "docinPeriode",
        "docinSupplier",
        "docinHarga"
    ];

    getDocInFlokLetters().forEach(
        function(letter){

            ids.push(
                "docinPop" + letter
            );

            ids.push(
                "docinTgl" + letter
            );

        }
    );

    ids.forEach(
        function(id){

            const el =
                document.getElementById(id);

            if(el){
                el.value = "";
            }

        }
    );

}


// ==========================================================
// LOADING SIMPAN DOC IN — FMC iOS STYLE
// Mengikuti tampilan loading Pakan.js.
// Hanya tampilan. Tidak mengubah proses API/GAS.
// ==========================================================

function fmcShowDocInSaving_(){

    if(document.getElementById("fmcDocInSaving")){
        return;
    }

    if(!document.getElementById("fmcDocInSavingStyle")){

        const style =
            document.createElement("style");

        style.id =
            "fmcDocInSavingStyle";

        style.textContent = `
            @keyframes fmcDocInSavingFadeIn{
                from{opacity:0;transform:scale(.96)}
                to{opacity:1;transform:scale(1)}
            }

            @keyframes fmcDocInSavingSpinner{
                to{transform:rotate(360deg)}
            }

            #fmcDocInSaving{
                position:fixed;
                inset:0;
                z-index:999999;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:24px;
                box-sizing:border-box;
                background:rgba(0,0,0,.34);
                backdrop-filter:blur(10px);
                -webkit-backdrop-filter:blur(10px);
            }

            #fmcDocInSaving .fmc-docin-saving-card{
                width:min(250px,calc(100vw - 48px));
                box-sizing:border-box;
                padding:28px 24px 24px;
                border-radius:28px;
                background:rgba(30,30,32,.96);
                color:#fff;
                text-align:center;
                box-shadow:0 20px 60px rgba(0,0,0,.35);
                animation:fmcDocInSavingFadeIn .18s ease-out;
            }

            #fmcDocInSaving .fmc-docin-saving-spinner{
                width:42px;
                height:42px;
                margin:0 auto 18px;
                border:4px solid rgba(255,255,255,.22);
                border-top-color:#fff;
                border-radius:50%;
                animation:fmcDocInSavingSpinner .78s linear infinite;
            }

            #fmcDocInSaving .fmc-docin-saving-title{
                font-size:18px;
                line-height:1.3;
                font-weight:750;
                letter-spacing:-.2px;
            }

            #fmcDocInSaving .fmc-docin-saving-text{
                margin-top:7px;
                font-size:13px;
                line-height:1.45;
                color:rgba(255,255,255,.68);
            }
        `;

        document.head.appendChild(style);
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "fmcDocInSaving";

    overlay.setAttribute(
        "role",
        "status"
    );

    overlay.setAttribute(
        "aria-live",
        "polite"
    );

    overlay.innerHTML = `
        <div class="fmc-docin-saving-card">
            <div
                class="fmc-docin-saving-spinner"
                aria-hidden="true">
            </div>

            <div class="fmc-docin-saving-title">
                Menyiapkan Data
            </div>

            <div class="fmc-docin-saving-text">
                Mohon tunggu sebentar...
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function fmcHideDocInSaving_(){

    const overlay =
        document.getElementById(
            "fmcDocInSaving"
        );

    if(overlay){
        overlay.remove();
    }
}


// ==========================================
// SIMPAN DOC IN
// ==========================================

async function simpanDocIn(){

    /*
     * Jika sudah ada data di
     * "Data Yang Disiapkan",
     * gunakan data sesi tersebut sebagai
     * sumber utama.
     *
     * Form boleh kosong karena memang
     * dikosongkan setelah TAMBAH DATA.
     *
     * Validasi form hanya dilakukan jika
     * belum ada data sesi.
     */
    const adaDataSesi =
        Array.isArray(window.fmcDocInDataSesi) &&
        window.fmcDocInDataSesi.length > 0;

    let formData = null;

    if(!adaDataSesi){

        formData =
            ambilFormDocIn();

        if(!validasiDocIn(formData)){
            return;
        }

    }

    let items = [];

    if(adaDataSesi){

        items =
            window.fmcDocInDataSesi.map(
                function(item){

                    const floks =
                        getDocInFlokLetters().map(
                            function(letter){

                                const source =
                                    item.floks?.[letter] ||
                                    item[
                                        "flok" + letter
                                    ] ||
                                    {};

                                return {
                                    id: letter,
                                    name:
                                        "FLOK " + letter,
                                    populasi:
                                        source.populasi || "",
                                    tanggal:
                                        source.tanggal || ""
                                };

                            }
                        );

                    return {
                        tanggal: item.tanggal,
                        perusahaan: item.perusahaan,
                        periode: item.periode,
                        supplier: item.supplier,
                        harga: item.harga,
                        floks: floks,
                        __fmcLocalDraft:
                            item.__fmcLocalDraft === true
                    };

                }
            );

    }
    else{

        items = [
            {
                tanggal: formData.tanggal,
                perusahaan: formData.perusahaan,
                periode: formData.periode,
                supplier: formData.supplier,
                harga: formData.harga,

                floks:
                    getDocInFlokLetters().map(
                        function(letter){

                            const source =
                                formData.floks[letter];

                            return {
                                id: letter,
                                name:
                                    "FLOK " + letter,
                                populasi:
                                    source?.populasi || "",
                                tanggal:
                                    source?.tanggal || ""
                            };

                        }
                    )
            }
        ];

    }


    fmcShowDocInSaving_();

    const button =
        document.getElementById(
            "btnSimpanDocIn"
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

        /*
         * =====================================
         * DATA SIAP DIKIRIM KE GAS
         * =====================================
         *
         * items = seluruh rekapan.
         *
         * GAS nantinya dapat membaca:
         *
         * payload.items
         *
         * Struktur setiap item:
         *
         * tanggal
         * perusahaan
         * periode
         * supplier
         * harga
         * popA / tglA
         * popB / tglB
         * popC / tglC
         * popD / tglD
         *
         * Field lama tetap dikirim
         * menggunakan item pertama.
         *
         * Ini menjaga kompatibilitas
         * dengan backend lama.
         */



        const localDrafts =
            items.filter(function(item){
                return item.__fmcLocalDraft === true;
            });

        const pertama =
            localDrafts.length
                ? localDrafts[localDrafts.length - 1]
                : items[items.length - 1];

        if(!pertama){
            throw new Error(
                "Data DOC In yang akan disimpan tidak ditemukan."
            );
        }

        const requestedPeriodNo =
            String(pertama.periode ?? "").trim();

        if(!requestedPeriodNo){
            throw new Error(
                "Periode DOC In yang akan disimpan belum tersedia."
            );
        }

        const result =
            await apiPost(
                "saveDocIn",
                {
                    tanggal:
                        pertama.tanggal,

                    perusahaan:
                        pertama.perusahaan,

                    periode:
                        requestedPeriodNo,

                    supplier:
                        pertama.supplier,

                    harga:
                        pertama.harga,

                    /*
                     * Struktur utama D2:
                     * seluruh FLOK tenant yang aktif.
                     */
                    floks:
                        JSON.stringify(
                            pertama.floks
                        ),

                    flok_count:
                        pertama.floks.length,

                    /*
                     * Kompatibilitas backend lama A-D.
                     */
                    popA:
                        pertama.floks.find(
                            f => f.id === "A"
                        )?.populasi || "",

                    tglA:
                        pertama.floks.find(
                            f => f.id === "A"
                        )?.tanggal || "",

                    popB:
                        pertama.floks.find(
                            f => f.id === "B"
                        )?.populasi || "",

                    tglB:
                        pertama.floks.find(
                            f => f.id === "B"
                        )?.tanggal || "",

                    popC:
                        pertama.floks.find(
                            f => f.id === "C"
                        )?.populasi || "",

                    tglC:
                        pertama.floks.find(
                            f => f.id === "C"
                        )?.tanggal || "",

                    popD:
                        pertama.floks.find(
                            f => f.id === "D"
                        )?.populasi || "",

                    tglD:
                        pertama.floks.find(
                            f => f.id === "D"
                        )?.tanggal || ""
                }
            );


        if(
            !result ||
            result.success !== true
        ){

            throw new Error(

                result?.message ||
                "Data DOC In gagal disimpan."

            );

        }




        /*
         * Server confirmation: jika backend mengembalikan nomor
         * periode, nomor tersebut harus sama dengan yang diminta.
         */
        const returnedPeriodNo =
            String(
                result.period_no ??
                result.periodNo ??
                result.active_period_no ??
                result.activePeriodNo ??
                result.data?.period_no ??
                result.data?.periodNo ??
                result.data?.active_period_no ??
                result.data?.activePeriodNo ??
                ""
            ).trim();

        if(
            returnedPeriodNo &&
            returnedPeriodNo !== requestedPeriodNo
        ){
            throw new Error(
                "Server mengembalikan Periode " +
                returnedPeriodNo +
                ", bukan Periode " +
                requestedPeriodNo +
                ". Data tidak dianggap berhasil."
            );
        }


        /*
         * GAS 2 mengembalikan period_id yang digunakan.
         * Simpan sebagai pointer periode aktif.
         */
        const savedPeriodId =
            resolveFmcD2PeriodId(result);

        if(savedPeriodId){
            setFmcD2ActivePeriodId(
                savedPeriodId
            );
        }

        if(
            result.data &&
            typeof result.data === "object"
        ){
            window.fmcDocInLastServerData =
                result.data;
        }

        tampilPesanDocIn(

            "Data DOC In berhasil disimpan.",

            "success"

        );


        /*
         * Setelah berhasil,
         * kosongkan rekapan.
         */

        window.fmcDocInDataSesi = [];


        renderDocInTableInPage();


        /*
         * Ambil ulang data server
         * supaya hasil spreadsheet terbaru
         * bisa digunakan FMC.
         */

        serverData = null;

        await ambilDataServer(true);


        /*
         * Ambil ulang DOC IN.
         */

        await muatDocIn();


        showUpdateToast(
            "Data DOC In berhasil disimpan"
        );


    }
    catch(error){

        console.error(
            "SIMPAN DOC IN ERROR:",
            error
        );


        tampilPesanDocIn(

            error.message ||
            "Gagal menyimpan data DOC In.",

            "error"

        );

    }
    finally{

        fmcHideDocInSaving_();

        if(button){

            button.disabled = false;

            button.innerHTML = `

                <span class="material-symbols-rounded">
                    cloud_upload
                </span>

                SIMPAN DATA DOC IN

            `;

        }

    }

}



// ==========================================
// NORMALISASI DATA SERVER -> SESI PWA
// ==========================================

function normalisasiDocInServerKeSesi(
    data,
    periodId = ""
){
    if(!data || typeof data !== "object"){
        return null;
    }

    const floks =
        Array.isArray(data.floks)
            ? data.floks.map(function(flok){
                const id =
                    String(
                        flok?.id ||
                        flok?.flok ||
                        flok?.kode ||
                        flok?.name ||
                        ""
                    )
                    .trim()
                    .toUpperCase()
                    .replace(/^FLOK\s+/, "");

                return {
                    id: id,
                    name:
                        flok?.name ||
                        ("FLOK " + id),
                    populasi:
                        flok?.populasi ??
                        flok?.population ??
                        "",
                    tanggal:
                        flok?.tanggal ??
                        flok?.tanggal_doc ??
                        flok?.doc_date ??
                        ""
                };
            }).filter(function(flok){
                return /^[A-F]$/.test(flok.id);
            })
            : getDocInFlokLetters().map(
                function(letter){
                    return {
                        id: letter,
                        name:
                            "FLOK " + letter,
                        populasi:
                            data["pop" + letter] ??
                            data["flok" + letter]?.populasi ??
                            "",
                        tanggal:
                            data["tgl" + letter] ??
                            data["flok" + letter]?.tanggal ??
                            ""
                    };
                }
            );

    const item = {
        __fmcLocalDraft: false,
        tanggal:
            data.tanggal ||
            data.tanggal_doc_in ||
            data.doc_in_date ||
            "",

        perusahaan:
            data.perusahaan ||
            data.company ||
            data.nama_pt_cv ||
            "",

        periode:
            data.periode ||
            data.period ||
            data.period_id ||
            periodId ||
            "",

        supplier:
            data.supplier ||
            data.supplier_doc ||
            "",

        harga:
            data.harga ??
            data.harga_doc ??
            data.harga_per_ekor ??
            "",

        floks: {}
    };

    floks.forEach(function(flok){
        item.floks[flok.id] = {
            populasi:
                flok.populasi ?? "",
            tanggal:
                flok.tanggal ?? ""
        };

        item["flok" + flok.id] =
            item.floks[flok.id];
    });

    return item;
}


// ==========================================
// RESTORE SERVER -> "DATA YANG DISIAPKAN"
// ==========================================

function restoreDocInServerToPWA(
    data,
    periodId = ""
){
    const item =
        normalisasiDocInServerKeSesi(
            data,
            periodId
        );

    if(!item){
        return false;
    }

    /*
     * Satu DOC IN aktif per period.
     * Server menjadi sumber utama, jadi replace
     * agar tidak terjadi duplikat saat halaman dibuka.
     */
    window.fmcDocInDataSesi = [item];

    window.fmcDocInLastServerData =
        data;

    if(item.periode){
        setFmcD2ActivePeriodId(
            item.periode
        );
    }
    else if(periodId){
        setFmcD2ActivePeriodId(
            periodId
        );
    }

    renderDocInTableInPage();

    return true;
}


// ==========================================
// LOAD DATA DOC IN
// ==========================================

async function muatDocIn(){

    /*
     * GET DOC IN bukan hanya mengisi form.
     * Record server juga harus dipulihkan ke
     * "Data Yang Disiapkan".
     *
     * Period:
     * - gunakan pointer aktif jika tersedia
     * - jika belum ada, baca getPeriods
     * - jangan menebak jika ada >1 OPEN period
     */

    try{

        let periodId =
            await resolveFmcD2ActivePeriod_();

        let result = null;

        if(periodId){

            result =
                await apiPost(
                    "getDocIn",
                    {
                        period_id:
                            periodId
                    }
                );

        }
        else{

            /*
             * Fallback kompatibilitas:
             * backend boleh resolve sendiri jika
             * tenant hanya mempunyai satu period.
             */
            result =
                await apiPost(
                    "getDocIn",
                    {}
                );

        }


        if(
            !result ||
            result.success !== true
        ){

            console.warn(
                "DOC IN GET:",
                result?.message ||
                "Response getDocIn tidak valid."
            );

            /*
             * Jangan menghapus staging PWA
             * bila GET server gagal.
             */
            return;

        }


        const returnedPeriodId =
            resolveFmcD2PeriodId(
                result
            );

        if(returnedPeriodId){

            setFmcD2ActivePeriodId(
                returnedPeriodId
            );

            periodId =
                returnedPeriodId;

        }


        const data =
            result.data ||
            result.doc_in ||
            null;

        fmcDocInSaveCache_(data, periodId);


        if(!data){

            console.info(
                "DOC IN GET: data belum tersedia."
            );

            return;

        }


        /*
         * 1. Isi form dari server.
         */
        isiFormDocIn(
            data
        );


        /*
         * 2. Pulihkan record server ke
         *    "Data Yang Disiapkan".
         */
        restoreDocInServerToPWA(
            data,
            periodId
        );

    }
    catch(error){

        console.error(
            "LOAD DOC IN ERROR:",
            error
        );

    }

}


// ==========================================
// ISI DATA KE FORM
// ==========================================

function isiFormDocIn(data){

    if(!data) return;

    const setValue = (
        id,
        value
    ) => {

        const el =
            document.getElementById(id);

        if(el){
            el.value =
                value ?? "";
        }

    };

    setValue(
        "docinTanggal",
        data.tanggal
    );

    setValue(
        "docinPerusahaan",
        data.perusahaan
    );

    setValue(
        "docinPeriode",
        data.periode ||
        data.period ||
        data.period_id
    );

    setValue(
        "docinSupplier",
        data.supplier
    );

    setValue(
        "docinHarga",
        data.harga
    );

    /*
     * D2 dynamic FLOK.
     */
    if(Array.isArray(data.floks)){

        data.floks.forEach(
            function(flok){

                const letter =
                    String(
                        flok?.id ||
                        ""
                    )
                    .trim()
                    .toUpperCase();

                if(
                    !FMC_DOCIN_FLOK_LETTERS
                        .includes(letter)
                ){
                    return;
                }

                setValue(
                    "docinPop" + letter,
                    flok.populasi
                );

                setValue(
                    "docinTgl" + letter,
                    flok.tanggal
                );

            }
        );

    }
    else{

        /*
         * Legacy A-D fallback.
         */
        getDocInFlokLetters().forEach(
            function(letter){

                setValue(
                    "docinPop" + letter,
                    data[
                        "pop" + letter
                    ]
                );

                setValue(
                    "docinTgl" + letter,
                    data[
                        "tgl" + letter
                    ]
                );

            }
        );

    }

    setValue(
        "docinTotal",
        data.total
    );

}


// ==========================================
// PESAN
// ==========================================

function tampilPesanDocIn(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "docinMessage"
        );


    if(!el) return;


    el.style.display =
        "block";


    el.className =
        "docinMessage " + tipe;


    el.textContent =
        pesan;

}



// ==========================================
// ESCAPE HTML
// ==========================================

function escapeDocIn(value){

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}