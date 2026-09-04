// ==========================================================
// FMC BROILER MOBILE
// OPERASIONAL.JS
// UI + HITUNG TOTAL + REKAPAN
// ==========================================================

"use strict";


/* OPERASIONAL SERVER TABLE V1 */
(function(){

    if(document.getElementById("operasionalServerTableStyle")) return;

    const style = document.createElement("style");

    style.id = "operasionalServerTableStyle";

    style.textContent = `
        .operasionalTableScroll{
            width:100%;
            overflow-x:auto;
            -webkit-overflow-scrolling:touch;
        }

        .operasionalDataTable{
            width:100%;
            min-width:760px;
            border-collapse:collapse;
            font-size:.82rem;
        }

        .operasionalDataTable th,
        .operasionalDataTable td{
            padding:10px 8px;
            text-align:left;
            vertical-align:middle;
            border-bottom:1px solid rgba(127,127,127,.18);
        }

        .operasionalDataTable th{
            font-size:.68rem;
            letter-spacing:.04em;
            white-space:nowrap;
        }

        .operasionalDataTable td:nth-child(3){
            min-width:180px;
        }

        .operasionalNumber{
            text-align:right !important;
            white-space:nowrap;
        }

        .operasionalTableTotal{
            font-weight:700;
        }

        .operasionalActionCell{
            width:52px;
            text-align:center !important;
        }

        .operasionalDeleteBtn{
            width:36px;
            height:36px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border:0;
            border-radius:10px;
            cursor:pointer;
        }
    `;

    document.head.appendChild(style);

})();


// ==========================================================
// DATA SEMENTARA OPERASIONAL
// ==========================================================

window.fmcOperasionalDataSesi =
    window.fmcOperasionalDataSesi || [];


// ==========================================================
// TAMPILKAN HALAMAN OPERASIONAL
// ==========================================================

// FMC FAST OPEN — OPERASIONAL CACHE (DISPLAY ONLY)
function fmcOperasionalCacheKey_(){ return "fmc_operasional_fast_cache_v3"; }
function fmcOperasionalSaveCache_(items){ try{ localStorage.setItem(fmcOperasionalCacheKey_(),JSON.stringify({saved_at:Date.now(),items:Array.isArray(items)?items:[]})); }catch(e){ console.warn("OPERASIONAL CACHE SAVE:",e); } }
function fmcOperasionalApplyCache_(){ try{ const raw=localStorage.getItem(fmcOperasionalCacheKey_()); if(!raw)return false; const p=JSON.parse(raw); if(!p||!Array.isArray(p.items))return false; window.fmcOperasionalDataSesi=p.items.map(function(item){ return {id:item.id||item.item_id||"",tanggal:item.tanggal||"",kategori:item.kategori||"",keterangan:item.keterangan||"",harga:Number(item.harga)||0,qty:Number(item.qty)||0,total:Number(item.total)||((Number(item.harga)||0)*(Number(item.qty)||0)),__server:true}; }); return true; }catch(e){ console.warn("OPERASIONAL CACHE LOAD:",e); return false; } }
async function fmcOperasionalSyncServer_(){ try{ const result=await apiPost("getOperasional",{}); if(!result||result.success!==true||!result.data)throw new Error(result?.message||"Data Operasional dari server tidak tersedia."); const rows=Array.isArray(result.data.items)?result.data.items:[]; window.fmcOperasionalDataSesi=rows.map(function(item){ return {id:item.id||item.item_id||"",tanggal:item.tanggal||"",kategori:item.kategori||"",keterangan:item.keterangan||"",harga:Number(item.harga)||0,qty:Number(item.qty)||0,total:Number(item.total)||((Number(item.harga)||0)*(Number(item.qty)||0)),__server:true}; }); fmcOperasionalSaveCache_(window.fmcOperasionalDataSesi); if(result.period_id){ window.fmcOperasionalActivePeriodId=String(result.period_id).trim(); try{localStorage.setItem("fmcD2ActivePeriodId",String(result.period_id).trim());}catch(e){} } if(document.getElementById("operasionalTableWrap"))renderOperasionalTableInPage(); if(typeof hitungTotalOperasional==="function")hitungTotalOperasional(); }catch(e){ console.error("GET OPERASIONAL SERVER GAGAL:",e); } }

async function tampilOperasional(){

    const page =
        document.getElementById(
            "operasionalPage"
        );

    if(!page) return;

    fmcOperasionalApplyCache_();

    page.innerHTML = `

        <div class="card operasionalCard">


            <!-- ==========================================
                 HEADER
            ========================================== -->

            <div class="operasionalHeader">

                <div>

                    <h2>

                        <span class="material-symbols-rounded">
                            payments
                        </span>

                        Operasional

                    </h2>

                    <p>
                        Pencatatan biaya operasional farm
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 INPUT OPERASIONAL
            ========================================== -->

            <div class="operasionalSection">

                <h3>

                    <span class="material-symbols-rounded">
                        receipt_long
                    </span>

                    Data Pengeluaran

                </h3>


                <!-- TANGGAL -->

                <label for="operasionalTanggal">
                    Tanggal
                </label>

                <input
                    type="date"
                    id="operasionalTanggal"
                    autocomplete="off">


                <!-- KATEGORI MANUAL -->

                <label for="operasionalKategori">
                    Kategori
                </label>

                <input
                    type="text"
                    id="operasionalKategori"
                    placeholder="Ketik kategori sendiri"
                    autocomplete="off">


                <!-- KETERANGAN MANUAL -->

                <label for="operasionalKeterangan">
                    Keterangan
                </label>

                <textarea
                    id="operasionalKeterangan"
                    rows="3"
                    placeholder="Ketik keterangan pengeluaran"
                    autocomplete="off">
                </textarea>


                <!-- HARGA SATUAN -->

                <label for="operasionalHarga">
                    Harga Satuan
                </label>

                <input
                    type="number"
                    id="operasionalHarga"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    placeholder="Masukkan harga satuan"
                    autocomplete="off">


                <!-- QTY -->

                <label for="operasionalQty">
                    Qty
                </label>

                <input
                    type="number"
                    id="operasionalQty"
                    min="0"
                    step="1"
                    inputmode="decimal"
                    placeholder="Masukkan jumlah"
                    autocomplete="off">

            </div>


            <!-- ==========================================
                 TAMBAH DATA
            ========================================== -->

            <button
                type="button"
                id="btnTambahOperasional"
                class="operasionalAddBtn"
                onclick="tambahDataOperasional()">

                <span class="material-symbols-rounded">
                    add
                </span>

                TAMBAH DATA

            </button>


            <!-- ==========================================
                 DATA YANG DISIAPKAN
            ========================================== -->

            <div class="operasionalSection">

                <h3>

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    Data Yang Disiapkan

                </h3>


                <div
                    id="operasionalTableWrap"
                    class="operasionalTableWrap">

                    ${renderOperasionalTable()}

                </div>

            </div>


            <!-- ==========================================
                 TOTAL
            ========================================== -->

            <div class="operasionalTotal">

                <div class="operasionalTotalIcon">

                    <span class="material-symbols-rounded">
                        calculate
                    </span>

                </div>

                <div>

                    <small>
                        TOTAL PENGELUARAN
                    </small>

                    <strong id="totalOperasional">
                        —
                    </strong>

                </div>

            </div>


            <!-- ==========================================
                 MESSAGE
            ========================================== -->

            <div
                id="operasionalMessage"
                class="operasionalMessage"
                style="display:none;">
            </div>


            <!-- ==========================================
                 BUTTON
            ========================================== -->

            <button
                type="button"
                id="btnSimpanOperasional"
                class="operasionalSaveBtn"
                onclick="simpanOperasionalUI()">

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA OPERASIONAL

            </button>


        </div>

    `;


    // ======================================================
    // EVENT HITUNG TOTAL OTOMATIS
    // ======================================================

    const hargaInput =
        document.getElementById(
            "operasionalHarga"
        );


    const qtyInput =
        document.getElementById(
            "operasionalQty"
        );


    if(hargaInput){

        hargaInput.addEventListener(
            "input",
            hitungTotalOperasional
        );

    }


    if(qtyInput){

        qtyInput.addEventListener(
            "input",
            hitungTotalOperasional
        );

    }


    // Tampilkan kondisi total awal
    hitungTotalOperasional();

    Promise.resolve().then(function(){ fmcOperasionalSyncServer_(); });

}


// ==========================================================
// HITUNG TOTAL OPERASIONAL
// ==========================================================

function hitungTotalOperasional(){

    const totalEl =
        document.getElementById(
            "totalOperasional"
        );

    if(!totalEl) return;

    /*
     * TOTAL PENGELUARAN mengikuti seluruh
     * data yang sudah masuk ke "Data Yang Disiapkan".
     * Setelah TAMBAH DATA, form dikosongkan, jadi
     * total tidak boleh hanya membaca form aktif.
     */
    const data =
        window.fmcOperasionalDataSesi || [];

    let totalRekap =
        data.reduce(
            function(sum, item){

                const harga =
                    Number(item?.harga) || 0;

                const qty =
                    Number(item?.qty) || 0;

                const totalItem =
                    Number(item?.total) ||
                    (harga * qty);

                return sum + totalItem;
            },
            0
        );

    /*
     * Jika belum ada rekapan, tetap tampilkan
     * preview dari form aktif seperti perilaku lama.
     */
    if(data.length === 0){

        const harga =
            parseFloat(
                document.getElementById(
                    "operasionalHarga"
                )?.value
            ) || 0;

        const qty =
            parseFloat(
                document.getElementById(
                    "operasionalQty"
                )?.value
            ) || 0;

        totalRekap =
            harga * qty;
    }

    if(totalRekap <= 0){
        totalEl.textContent = "—";
        return;
    }

    totalEl.textContent =
        formatRupiahOperasional(
            totalRekap
        );
}


// ==========================================================
// FORMAT RUPIAH
// ==========================================================

function formatRupiahOperasional(
    value
){

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    );

}


// ==========================================================
// AMBIL DATA FORM
// ==========================================================

function ambilFormOperasional(){

    const harga =
        parseFloat(
            document.getElementById(
                "operasionalHarga"
            )?.value
        ) || 0;


    const qty =
        parseFloat(
            document.getElementById(
                "operasionalQty"
            )?.value
        ) || 0;


    return {

        tanggal:
            document.getElementById(
                "operasionalTanggal"
            )?.value || "",


        kategori:
            document.getElementById(
                "operasionalKategori"
            )?.value.trim() || "",


        keterangan:
            document.getElementById(
                "operasionalKeterangan"
            )?.value.trim() || "",


        harga:
            harga,


        qty:
            qty,


        total:
            harga * qty

    };

}


// ==========================================================
// VALIDASI OPERASIONAL
// ==========================================================

function validasiOperasional(
    data
){

    if(!data.tanggal){

        tampilPesanOperasional(
            "Tanggal belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.kategori){

        tampilPesanOperasional(
            "Kategori belum diisi.",
            "error"
        );

        return false;

    }


    if(!data.keterangan){

        tampilPesanOperasional(
            "Keterangan belum diisi.",
            "error"
        );

        return false;

    }


    if(data.harga <= 0){

        tampilPesanOperasional(
            "Harga satuan harus lebih dari 0.",
            "error"
        );

        return false;

    }


    if(data.qty <= 0){

        tampilPesanOperasional(
            "Qty harus lebih dari 0.",
            "error"
        );

        return false;

    }


    return true;

}


// ==========================================================
// TAMBAH DATA OPERASIONAL
// ==========================================================

function tambahDataOperasional(){

    const data =
        ambilFormOperasional();


    if(
        !validasiOperasional(
            data
        )
    ){

        return;

    }


    /*
     * Simpan data ke sesi PWA.
     */

    window.fmcOperasionalDataSesi.push(
        data
    );

    hitungTotalOperasional();


    /*
     * Tampilkan rekapan terbaru.
     */

    renderOperasionalTableInPage();


    /*
     * Kosongkan form
     * untuk input berikutnya.
     */

    kosongkanFormOperasional();


    tampilPesanOperasional(
        "Data operasional berhasil ditambahkan.",
        "success"
    );

}


// ==========================================================
// RENDER REKAPAN OPERASIONAL
// ==========================================================

function renderOperasionalTable(){

    const data =
        window.fmcOperasionalDataSesi || [];

    if(!data.length){

        return `
            <div class="operasionalEmpty">

                <span class="material-symbols-rounded">
                    receipt_long
                </span>

                <strong>
                    Belum ada data
                </strong>

                <small>
                    Data pengeluaran yang ditambahkan
                    akan muncul di sini.
                </small>

            </div>
        `;

    }

    return `
        <div class="operasionalTableScroll">

            <table class="operasionalDataTable">

                <thead>
                    <tr>
                        <th>TANGGAL</th>
                        <th>KATEGORI</th>
                        <th>KETERANGAN</th>
                        <th>HARGA</th>
                        <th>QTY</th>
                        <th>TOTAL</th>
                        <th>AKSI</th>
                    </tr>
                </thead>

                <tbody>

                    ${
                        data.map(
                            function(item,index){

                                return `
                                    <tr>

                                        <td>
                                            ${escapeOperasional(item.tanggal)}
                                        </td>

                                        <td>
                                            ${escapeOperasional(item.kategori)}
                                        </td>

                                        <td>
                                            ${escapeOperasional(item.keterangan)}
                                        </td>

                                        <td class="operasionalNumber">
                                            ${formatRupiahOperasional(item.harga)}
                                        </td>

                                        <td class="operasionalNumber">
                                            ${escapeOperasional(item.qty)}
                                        </td>

                                        <td class="operasionalNumber operasionalTableTotal">
                                            ${formatRupiahOperasional(item.total)}
                                        </td>

                                        <td class="operasionalActionCell">

                                            <button
                                                type="button"
                                                class="operasionalDeleteBtn"
                                                onclick="hapusDataOperasional(${index})"
                                                aria-label="Hapus data"
                                                title="Hapus dari daftar">

                                                <span class="material-symbols-rounded">
                                                    delete
                                                </span>

                                            </button>

                                        </td>

                                    </tr>
                                `;

                            }
                        ).join("")
                    }

                </tbody>

            </table>

        </div>
    `;

}


// ==========================================================
// REFRESH OPERASIONAL LANGSUNG DARI SERVER
// ==========================================================
async function refreshOperasionalDariServer(){

    try{

        const result =
            await apiPost(
                "getOperasional",
                {}
            );

        if(
            !result ||
            result.success !== true ||
            !result.data
        ){
            throw new Error(
                (result && result.message) ||
                "Data Operasional dari server tidak tersedia."
            );
        }

        const serverItems =
            Array.isArray(result.data.items)
                ? result.data.items
                : [];

        window.fmcOperasionalDataSesi =
            serverItems.map(
                function(item){

                    return {
                        id:
                            item.id ||
                            item.item_id ||
                            "",

                        tanggal:
                            item.tanggal || "",

                        kategori:
                            item.kategori || "",

                        keterangan:
                            item.keterangan || "",

                        harga:
                            Number(item.harga) || 0,

                        qty:
                            Number(item.qty) || 0,

                        total:
                            Number(item.total) ||
                            (
                                (Number(item.harga) || 0) *
                                (Number(item.qty) || 0)
                            ),

                        __server: true
                    };

                }
            );

        renderOperasionalTableInPage();

        return true;

    }catch(error){

        console.warn(
            "REFRESH OPERASIONAL DARI SERVER GAGAL:",
            error
        );

        return false;

    }

}

// ==========================================================
// REFRESH REKAPAN
// ==========================================================

function renderOperasionalTableInPage(){

    const wrap =
        document.getElementById(
            "operasionalTableWrap"
        );


    if(!wrap){

        return;

    }


    wrap.innerHTML =
        renderOperasionalTable();

}


// ==========================================================
// DIALOG HAPUS OPERASIONAL — FMC PROFESSIONAL
// Hanya mengganti tampilan konfirmasi. Logika hapus tetap sama.
// ==========================================================

function fmcConfirmHapusOperasional_(item, index){

    return new Promise(function(resolve){

        const existing = document.getElementById(
            "fmcOperasionalDeleteDialog"
        );

        if(existing){
            existing.remove();
        }

        const styleId = "fmcOperasionalDeleteDialogStyle";

        if(!document.getElementById(styleId)){

            const style = document.createElement("style");
            style.id = styleId;

            style.textContent = `
                #fmcOperasionalDeleteDialog{
                    position:fixed;
                    inset:0;
                    z-index:99999;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                    box-sizing:border-box;
                    background:rgba(0,0,0,.55);
                    backdrop-filter:blur(8px);
                    -webkit-backdrop-filter:blur(8px);
                    animation:fmcOperasionalDialogIn .18s ease-out;
                }

                #fmcOperasionalDeleteDialog .fmc-od-card{
                    width:min(100%,390px);
                    box-sizing:border-box;
                    background:#202124;
                    color:#fff;
                    border-radius:28px;
                    padding:28px 22px 18px;
                    box-shadow:0 24px 70px rgba(0,0,0,.42);
                    animation:fmcOperasionalCardIn .2s ease-out;
                }

                #fmcOperasionalDeleteDialog .fmc-od-icon{
                    width:56px;
                    height:56px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border-radius:18px;
                    margin-bottom:18px;
                    background:#fff0f0;
                    color:#dc2626;
                }

                #fmcOperasionalDeleteDialog .fmc-od-icon .material-symbols-rounded{
                    font-size:30px;
                }

                #fmcOperasionalDeleteDialog .fmc-od-title{
                    margin:0 0 8px;
                    font-size:22px;
                    line-height:1.25;
                    font-weight:750;
                    letter-spacing:-.25px;
                }

                #fmcOperasionalDeleteDialog .fmc-od-text{
                    margin:0 0 18px;
                    color:rgba(255,255,255,.68);
                    font-size:15px;
                    line-height:1.5;
                }

                #fmcOperasionalDeleteDialog .fmc-od-info{
                    display:flex;
                    flex-direction:column;
                    gap:4px;
                    margin-bottom:20px;
                    padding:13px 15px;
                    border-radius:15px;
                    background:rgba(255,255,255,.07);
                    color:#fff;
                }

                #fmcOperasionalDeleteDialog .fmc-od-category{
                    font-size:16px;
                    font-weight:700;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }

                #fmcOperasionalDeleteDialog .fmc-od-detail{
                    font-size:13px;
                    color:rgba(255,255,255,.58);
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }

                #fmcOperasionalDeleteDialog .fmc-od-actions{
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:12px;
                }

                #fmcOperasionalDeleteDialog .fmc-od-btn{
                    min-height:54px;
                    border:0;
                    border-radius:17px;
                    font:inherit;
                    font-size:16px;
                    font-weight:750;
                    cursor:pointer;
                    -webkit-tap-highlight-color:transparent;
                    transition:transform .12s ease, filter .12s ease;
                }

                #fmcOperasionalDeleteDialog .fmc-od-btn:active{
                    transform:scale(.97);
                }

                #fmcOperasionalDeleteDialog .fmc-od-cancel{
                    background:#303136;
                    color:#fff;
                }

                #fmcOperasionalDeleteDialog .fmc-od-delete{
                    background:#e52525;
                    color:#fff;
                    box-shadow:0 8px 22px rgba(229,37,37,.22);
                }

                @keyframes fmcOperasionalDialogIn{
                    from{opacity:0}
                    to{opacity:1}
                }

                @keyframes fmcOperasionalCardIn{
                    from{opacity:0;transform:scale(.94) translateY(8px)}
                    to{opacity:1;transform:scale(1) translateY(0)}
                }
            `;

            document.head.appendChild(style);
        }

        const kategori = escapeOperasional(
            item?.kategori || "Pengeluaran"
        );

        const keterangan = escapeOperasional(
            item?.keterangan || "Tanpa keterangan"
        );

        const nomor = index + 1;

        const dialog = document.createElement("div");
        dialog.id = "fmcOperasionalDeleteDialog";

        dialog.innerHTML = `
            <div class="fmc-od-card" role="dialog" aria-modal="true" aria-labelledby="fmcOperasionalDeleteTitle">

                <div class="fmc-od-icon">
                    <span class="material-symbols-rounded">delete</span>
                </div>

                <h2 class="fmc-od-title" id="fmcOperasionalDeleteTitle">
                    Hapus Data Operasional?
                </h2>

                <p class="fmc-od-text">
                    Data yang dipilih akan dihapus dari daftar pengeluaran.
                    Tindakan ini tidak dapat dibatalkan.
                </p>

                <div class="fmc-od-info">
                    <div class="fmc-od-category">
                        ${kategori}
                    </div>
                    <div class="fmc-od-detail">
                        Data pengeluaran #${nomor} • ${keterangan}
                    </div>
                </div>

                <div class="fmc-od-actions">
                    <button type="button" class="fmc-od-btn fmc-od-cancel">
                        Batal
                    </button>

                    <button type="button" class="fmc-od-btn fmc-od-delete">
                        Hapus
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(dialog);

        const cancelBtn = dialog.querySelector(".fmc-od-cancel");
        const deleteBtn = dialog.querySelector(".fmc-od-delete");

        let finished = false;

        const close = function(result){
            if(finished) return;
            finished = true;

            if(dialog.parentNode){
                dialog.remove();
            }

            document.removeEventListener("keydown", onKeyDown);
            resolve(result);
        };

        const onKeyDown = function(event){
            if(event.key === "Escape"){
                close(false);
            }
        };

        if(cancelBtn){
            cancelBtn.addEventListener("click", function(){
                close(false);
            });
        }

        if(deleteBtn){
            deleteBtn.addEventListener("click", function(){
                close(true);
            });
        }

        dialog.addEventListener("click", function(event){
            if(event.target === dialog){
                close(false);
            }
        });

        document.addEventListener("keydown", onKeyDown);

        if(deleteBtn){
            deleteBtn.focus();
        }
    });
}


// ==========================================================
// LOADING SIMPAN OPERASIONAL — FMC iOS STYLE
// Hanya UI. Tidak mengubah proses API/GAS.
// ==========================================================

function fmcShowOperasionalSaving(){

    if(document.getElementById("fmcOperasionalSaving")){
        return;
    }

    const styleId = "fmcOperasionalSavingStyle";

    if(!document.getElementById(styleId)){

        const style = document.createElement("style");
        style.id = styleId;

        style.textContent = `
            #fmcOperasionalSaving{
                position:fixed;
                inset:0;
                z-index:99998;
                display:flex;
                align-items:center;
                justify-content:center;
                background:rgba(0,0,0,.38);
                backdrop-filter:blur(8px);
                -webkit-backdrop-filter:blur(8px);
                opacity:0;
                transition:opacity .2s ease;
            }

            #fmcOperasionalSaving .fmc-os-card{
                min-width:210px;
                max-width:280px;
                padding:28px 26px;
                border-radius:26px;
                box-sizing:border-box;
                background:rgba(35,35,40,.97);
                color:#fff;
                text-align:center;
                box-shadow:0 18px 55px rgba(0,0,0,.35);
                transform:scale(.94);
                transition:transform .2s ease;
            }

            #fmcOperasionalSaving .fmc-os-spinner{
                position:relative;
                width:42px;
                height:42px;
                margin:0 auto 18px;
            }

            #fmcOperasionalSaving .fmc-os-spinner span{
                position:absolute;
                width:4px;
                height:11px;
                border-radius:999px;
                background:#fff;
                left:19px;
                top:2px;
                transform-origin:2px 19px;
                animation:fmcOperasionalSpinnerFade 1s linear infinite;
            }

            #fmcOperasionalSaving .fmc-os-title{
                font-size:18px;
                font-weight:700;
                margin-bottom:6px;
            }

            #fmcOperasionalSaving .fmc-os-text{
                font-size:14px;
                color:rgba(255,255,255,.68);
            }

            @keyframes fmcOperasionalSpinnerFade{
                0%{opacity:.15}
                50%{opacity:1}
                100%{opacity:.15}
            }
        `;

        document.head.appendChild(style);
    }

    const overlay = document.createElement("div");
    overlay.id = "fmcOperasionalSaving";

    const dots = Array.from({length:8}, function(_, index){
        return `<span style="transform:rotate(${index * 45}deg);animation-delay:${-(1 - index * .10)}s;opacity:${.18 + index * .10}"></span>`;
    }).join("");

    overlay.innerHTML = `
        <div class="fmc-os-card">
            <div class="fmc-os-spinner">
                ${dots}
            </div>

            <div class="fmc-os-title">
                Menyimpan Data
            </div>

            <div class="fmc-os-text">
                Mohon tunggu sebentar...
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(function(){
        overlay.style.opacity = "1";
        const card = overlay.querySelector(".fmc-os-card");
        if(card){
            card.style.transform = "scale(1)";
        }
    });
}


function fmcHideOperasionalSaving(){

    const overlay = document.getElementById(
        "fmcOperasionalSaving"
    );

    if(!overlay){
        return;
    }

    overlay.style.opacity = "0";

    const card = overlay.querySelector(".fmc-os-card");
    if(card){
        card.style.transform = "scale(.94)";
    }

    setTimeout(function(){
        if(overlay.parentNode){
            overlay.remove();
        }
    }, 200);
}


// ==========================================================
// HAPUS DATA OPERASIONAL
// ==========================================================

async function hapusDataOperasional(
    index
){

    if(!Number.isInteger(index)){
        return;
    }

    const rows = Array.isArray(window.fmcOperasionalDataSesi)
        ? window.fmcOperasionalDataSesi
        : [];

    if(index < 0 || index >= rows.length){
        return;
    }

    const item = rows[index] || {};
    const serverId = String(
        item.id ||
        item.item_id ||
        ""
    ).trim();

    const confirmed =
        await fmcConfirmHapusOperasional_(
            item,
            index
        );

    if(!confirmed){
        return;
    }

    try{
        if(item.__server && serverId){
            const periodId = String(
                window.fmcOperasionalActivePeriodId ||
                localStorage.getItem("fmcD2ActivePeriodId") ||
                ""
            ).trim();

            const result = await apiPost(
                "deleteOperasional",
                periodId
                    ? { period_id: periodId, id: serverId }
                    : { id: serverId }
            );

            if(!result || result.success !== true){
                throw new Error(
                    result?.message ||
                    "Data operasional gagal dihapus dari server."
                );
            }

            const serverItems = Array.isArray(result?.data?.items)
                ? result.data.items
                : [];

            window.fmcOperasionalDataSesi = serverItems.map(function(row){
                return {
                    id: row.id || row.item_id || "",
                    tanggal: row.tanggal || "",
                    kategori: row.kategori || "",
                    keterangan: row.keterangan || "",
                    harga: Number(row.harga) || 0,
                    qty: Number(row.qty) || 0,
                    total: Number(row.total) || ((Number(row.harga) || 0) * (Number(row.qty) || 0)),
                    __server: true
                };
            });

            renderOperasionalTableInPage();
            hitungTotalOperasional();

            tampilPesanOperasional(
                "Data operasional berhasil dihapus dari server.",
                "success"
            );
            return;
        }

        rows.splice(index, 1);
        renderOperasionalTableInPage();
        hitungTotalOperasional();

        tampilPesanOperasional(
            "Data operasional berhasil dihapus dari data yang disiapkan.",
            "success"
        );
    }catch(error){
        console.error("HAPUS OPERASIONAL ERROR:", error);
        tampilPesanOperasional(
            error?.message || "Data operasional gagal dihapus.",
            "error"
        );
    }
}


// ==========================================================
// KOSONGKAN FORM
// ==========================================================

function kosongkanFormOperasional(){

    const tanggal =
        document.getElementById(
            "operasionalTanggal"
        );


    const kategori =
        document.getElementById(
            "operasionalKategori"
        );


    const keterangan =
        document.getElementById(
            "operasionalKeterangan"
        );


    const harga =
        document.getElementById(
            "operasionalHarga"
        );


    const qty =
        document.getElementById(
            "operasionalQty"
        );


    if(tanggal){

        tanggal.value = "";

    }


    if(kategori){

        kategori.value = "";

    }


    if(keterangan){

        keterangan.value = "";

    }


    if(harga){

        harga.value = "";

    }


    if(qty){

        qty.value = "";

    }


    hitungTotalOperasional();

}


// ==========================================================
// SIMPAN OPERASIONAL
// ==========================================================

async function simpanOperasionalUI(){

    /*
     * Jika sudah ada data di rekapan,
     * gunakan seluruh data tersebut.
     */

    let items = [];


    const pendingRows =
        (Array.isArray(window.fmcOperasionalDataSesi)
            ? window.fmcOperasionalDataSesi
            : []
        ).filter(function(item){
            return !item.__server;
        });

    if(pendingRows.length){

        items =
            pendingRows.map(
                function(item){

                    return {

                        tanggal:
                            item.tanggal,

                        kategori:
                            item.kategori,

                        keterangan:
                            item.keterangan,

                        harga:
                            item.harga,

                        qty:
                            item.qty,

                        total:
                            item.total

                    };

                }
            );

    }else{

        /*
         * Jika tidak ada data pending dan form kosong,
         * jangan kirim request SAVE kosong ke GAS 2.
         */
        const formData =
            ambilFormOperasional();

        const formKosong =
            !formData.kategori &&
            !formData.keterangan &&
            formData.harga <= 0 &&
            formData.qty <= 0;

        if(formKosong){

            tampilPesanOperasional(
                "Tidak ada data baru untuk disimpan.",
                "error"
            );

            return;

        }

        /*
         * Kompatibilitas:
         * jika user langsung menekan SIMPAN
         * tanpa menekan TAMBAH DATA,
         * form tetap dapat diproses.
         */

        if(
            !validasiOperasional(
                formData
            )
        ){

            return;

        }


        items = [

            {

                tanggal:
                    formData.tanggal,

                kategori:
                    formData.kategori,

                keterangan:
                    formData.keterangan,

                harga:
                    formData.harga,

                qty:
                    formData.qty,

                total:
                    formData.total

            }

        ];

    }


    const button =
        document.getElementById(
            "btnSimpanOperasional"
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


    fmcShowOperasionalSaving();


    try{

        /*
         * =====================================
         * PAYLOAD UNTUK GAS
         * =====================================
         *
         * Seluruh rekapan dikirim melalui:
         *
         * payload.items
         *
         * Action GAS:
         *
         * saveOperasional
         */

        const pertama =
            items[0];


        const result =
            await apiPost(

                "saveOperasional",

                {

                    /*
                     * Period D2 yang sedang aktif.
                     */
                    period_id:
                        String(
                            window.fmcOperasionalActivePeriodId ||
                            localStorage.getItem("fmcD2ActivePeriodId") ||
                            ""
                        ).trim(),

                    /*
                     * Field utama.
                     */

                    tanggal:
                        pertama.tanggal,

                    kategori:
                        pertama.kategori,

                    keterangan:
                        pertama.keterangan,

                    harga:
                        pertama.harga,

                    qty:
                        pertama.qty,

                    total:
                        pertama.total,


                    /*
                     * Seluruh data rekapan.
                     */

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
                "Data operasional gagal disimpan."

            );

        }


        tampilPesanOperasional(
            "Data operasional berhasil disimpan.",
            "success"
        );


        /*
         * Bersihkan sesi setelah berhasil.
         */

        window.fmcOperasionalDataSesi =
            [];


        /*
         * Bersihkan form.
         */

        kosongkanFormOperasional();


        /*
         * Ambil ulang DATA OPERASIONAL langsung dari server.
         *
         * Jangan memakai ambilDataServer() di sini karena
         * yang dibutuhkan adalah getOperasional secara khusus.
         * Dengan begitu tabel langsung kembali tanpa refresh
         * halaman atau pindah menu.
         */
        const refreshed =
            await refreshOperasionalDariServer();

        if(!refreshed){

            /*
             * SAVE tetap sukses walaupun GET ulang gagal.
             * Tabel dibiarkan mengikuti status terakhir.
             */
            renderOperasionalTableInPage();

        }


        /*
         * Toast jika tersedia.
         */

        if(
            typeof showUpdateToast ===
            "function"
        ){

            showUpdateToast(
                "Data operasional berhasil disimpan"
            );

        }

    }
    catch(error){

        console.error(
            "SIMPAN OPERASIONAL ERROR:",
            error
        );


        tampilPesanOperasional(

            error.message ||
            "Gagal menyimpan data operasional.",

            "error"

        );

    }
    finally{

        fmcHideOperasionalSaving();

        if(button){

            button.disabled = false;


            button.innerHTML = `

                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA OPERASIONAL

            `;

        }

    }

}


// ==========================================================
// PESAN
// ==========================================================

function tampilPesanOperasional(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "operasionalMessage"
        );


    if(!el) return;


    el.style.display =
        "block";


    el.className =
        "operasionalMessage " + tipe;


    el.textContent =
        pesan;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeOperasional(
    value
){

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