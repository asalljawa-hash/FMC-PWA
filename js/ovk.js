// ==========================================================
// FMC BROILER MOBILE V11
// OVK.JS
// ==========================================================
// MODUL : OVK / OBAT & VITAMIN
// STATUS: UI + TENANT GAS V1
// GAS   : TERHUBUNG — saveOVK
//
// STRUKTUR SHEET 💊 Obat
//
// A = No
// B = Tgl/Bulan
// C = Nama Obat
// D = Harga
// E = Qty
// F = Total
//
// RUMUS:
// Total Item = Harga × Qty
// Total OVK  = jumlah seluruh Total Item
// ==========================================================

"use strict";


// ==========================================================
// DATA SEMENTARA OVK
// ==========================================================

window.fmcOVKDataSesi =
    window.fmcOVKDataSesi || [];

// ==========================================================
// SESSION TENANT
// ==========================================================
// OVK mengikuti pola Master Kontrak: email tenant diambil
// secara eksplisit dari session sebelum SAVE / GET.
// ==========================================================

function getOVKTenantEmail(){

    try{

        if(typeof getLoginUser === "function"){

            const user =
                getLoginUser();

            const email =
                String(
                    user?.email || ""
                )
                .trim()
                .toLowerCase();

            if(email){
                return email;
            }
        }

        const raw =
            localStorage.getItem(
                "FMC_USER"
            );

        if(!raw){
            return "";
        }

        const user =
            JSON.parse(raw);

        return String(
            user?.email || ""
        )
        .trim()
        .toLowerCase();

    }
    catch(error){

        console.error(
            "OVK SESSION TENANT ERROR:",
            error
        );

        return "";
    }
}


function getOVKSessionIdentity(){

    try{

        let user = null;

        if(typeof getLoginUser === "function"){
            user = getLoginUser();
        }

        if(!user){
            const raw =
                localStorage.getItem("FMC_USER");

            if(raw){
                user = JSON.parse(raw);
            }
        }

        user = user || {};

        return {
            email:
                String(user?.email || "")
                    .trim()
                    .toLowerCase(),
            user_id:
                String(
                    user?.user_id ||
                    user?.userId ||
                    ""
                ).trim(),
            tenant_id:
                String(
                    user?.tenant_id ||
                    user?.tenantId ||
                    ""
                ).trim()
        };

    }catch(error){

        console.error(
            "OVK SESSION IDENTITY ERROR:",
            error
        );

        return {
            email: "",
            user_id: "",
            tenant_id: ""
        };
    }
}


function pastikanTenantOVK(){

    const identity =
        getOVKSessionIdentity();

    if(
        !identity.email &&
        !identity.user_id &&
        !identity.tenant_id
    ){

        throw new Error(
            "Session tenant tidak ditemukan. Silakan login kembali."
        );
    }

    return identity.email;
}


window.fmcOVKDataServer =
    window.fmcOVKDataServer || [];

const OVK_LOCAL_CACHE_KEY =
    "FMC_OVK_CACHE_V1";


function simpanOVKCacheTenant(
    items
){

    try{

        const email =
            pastikanTenantOVK();

        const cache =
            JSON.parse(
                localStorage.getItem(
                    OVK_LOCAL_CACHE_KEY
                ) || "{}"
            );

        cache[email] =
            (Array.isArray(items)
                ? items
                : []
            ).map(
                function(item){

                    return {
                        no:
                            item?.no ?? "",

                        row:
                            item?.row ?? "",

                        tanggal:
                            String(
                                item?.tanggal || ""
                            ),

                        namaObat:
                            String(
                                item?.namaObat || ""
                            ),

                        harga:
                            Number(
                                item?.harga || 0
                            ),

                        qty:
                            Number(
                                item?.qty || 0
                            ),

                        total:
                            Number(
                                item?.total || 0
                            )
                    };

                }
            );

        localStorage.setItem(
            OVK_LOCAL_CACHE_KEY,
            JSON.stringify(cache)
        );

    }
    catch(error){

        console.warn(
            "OVK CACHE SAVE ERROR:",
            error
        );

    }
}


function ambilOVKCacheTenant(){

    try{

        const email =
            pastikanTenantOVK();

        const cache =
            JSON.parse(
                localStorage.getItem(
                    OVK_LOCAL_CACHE_KEY
                ) || "{}"
            );

        const items =
            cache[email];

        return Array.isArray(items)
            ? items
            : [];

    }
    catch(error){

        console.warn(
            "OVK CACHE READ ERROR:",
            error
        );

        return [];
    }
}


// ==========================================================
// TAMPILKAN HALAMAN OVK
// ==========================================================

async function tampilOVK(){

    const page =
        document.getElementById(
            "ovkPage"
        );


    if(!page){

        console.warn(
            "OVK: #ovkPage tidak ditemukan."
        );

        return;
    }


    page.innerHTML =
        renderOVKPage();


    await initOVK();

}


// ==========================================================
// RENDER HALAMAN UTAMA
// ==========================================================

function renderOVKPage(){

    return `

        <section class="ovkPage">


            <!-- ==========================================
                 HEADER
            ========================================== -->

            <div class="ovkHeader">

                <div class="ovkHeaderIcon">

                    <span class="material-symbols-rounded">
                        medication
                    </span>

                </div>


                <div class="ovkHeaderText">

                    <div class="ovkHeaderSmall">
                        FMC BROILER MOBILE V11
                    </div>

                    <h2>
                        OVK
                    </h2>

                    <p>
                        Data Obat & Vitamin
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 INFORMASI
            ========================================== -->

            <div class="ovkInfo">

                <span class="material-symbols-rounded">
                    info
                </span>


                <div>

                    <strong>
                        Data OVK
                    </strong>

                    <p>
                        Silakan isi data obat atau vitamin
                        sesuai data yang diterima dari perusahaan.
                        Sistem FMC menghitung biaya berdasarkan
                        Harga × Qty.
                    </p>

                </div>

            </div>


            <!-- ==========================================
                 INPUT DATA
            ========================================== -->

            <div class="ovkCard">


                <div class="ovkSectionTitle">

                    <span class="material-symbols-rounded">
                        edit_note
                    </span>

                    <h3>
                        Input Data Obat
                    </h3>

                </div>


                <div class="ovkForm">


                    <!-- TANGGAL -->

                    <div class="ovkField">

                        <label for="ovkTanggal">
                            Tgl / Bulan
                        </label>

                        <input
                            type="date"
                            id="ovkTanggal"
                            autocomplete="off">

                    </div>


                    <!-- NAMA OBAT -->

                    <div class="ovkField">

                        <label for="ovkNamaObat">
                            Nama Obat
                        </label>

                        <input
                            type="text"
                            id="ovkNamaObat"
                            maxlength="100"
                            placeholder="Contoh: Vitamin, obat, vaksin"
                            autocomplete="off">

                    </div>


                    <!-- HARGA DAN QTY -->

                    <div class="ovkFormRow">


                        <div class="ovkField">

                            <label for="ovkHarga">
                                Harga
                            </label>

                            <input
                                type="number"
                                id="ovkHarga"
                                min="0"
                                step="1"
                                inputmode="numeric"
                                placeholder="Harga"
                                autocomplete="off"
                                oninput="hitungTotalOVKInput()">

                        </div>


                        <div class="ovkField">

                            <label for="ovkQty">
                                Qty
                            </label>

                            <input
                                type="number"
                                id="ovkQty"
                                min="0"
                                step="0.01"
                                inputmode="decimal"
                                placeholder="Jumlah"
                                autocomplete="off"
                                oninput="hitungTotalOVKInput()">

                        </div>


                    </div>


                    <!-- TOTAL INPUT -->

                    <div class="ovkField">

                        <label for="ovkTotal">
                            Total
                        </label>

                        <input
                            type="text"
                            id="ovkTotal"
                            value="—"
                            readonly
                            tabindex="-1"
                            aria-readonly="true">

                    </div>


                    <!-- PESAN -->

                    <div
                        id="ovkMessage"
                        class="ovkMessage"
                        style="display:none;">
                    </div>


                    <!-- TAMBAH DATA -->

                    <button
                        type="button"
                        id="btnTambahOVK"
                        class="ovkAddBtn"
                        onclick="tambahDataOVK()">

                        <span class="material-symbols-rounded">
                            add
                        </span>

                        TAMBAH DATA

                    </button>


                </div>

            </div>


            <!-- ==========================================
                 DATA YANG DISIAPKAN
            ========================================== -->

            <div class="ovkCard">


                <div class="ovkSectionTitle">

                    <span class="material-symbols-rounded">
                        inventory_2
                    </span>

                    <h3>
                        Data Yang Disiapkan
                    </h3>

                </div>


                <div
                    id="ovkTableWrap"
                    class="ovkTableWrap">

                    ${renderOVKTable()}

                </div>


            </div>


            <!-- ==========================================
                 SIMPAN
            ========================================== -->

            <div class="ovkSaveArea">

                <button
                    type="button"
                    id="btnSimpanOVK"
                    class="ovkSaveBtn"
                    onclick="simpanDataOVK()">

                    <span class="material-symbols-rounded">
                        save
                    </span>

                    SIMPAN DATA OVK

                </button>


                <small>

                    
                    <b> 💊 </b>
                    

                </small>

            </div>


        </section>

    `;

}


// ==========================================================
// INISIALISASI OVK
// ==========================================================

async function initOVK(){

    const tanggal =
        document.getElementById(
            "ovkTanggal"
        );


    if(
        tanggal &&
        !tanggal.value
    ){

        tanggal.value =
            tanggalHariIniOVK();

    }


    renderOVKTableInPage();

    /*
     * Server adalah sumber data utama.
     * Data lama tenant dimuat kembali saat halaman OVK dibuka.
     */
    try{

        /*
         * GET awal bersifat silent.
         * Jangan menampilkan "Tidak dapat terhubung ke server"
         * hanya karena pembacaan awal gagal.
         */
        await muatDataOVKDariServerOVK({
            silent: true
        });

    }catch(error){

        console.warn(
            "OVK: GET awal dari server gagal.",
            error
        );

    }

}


// ==========================================================
// TANGGAL HARI INI
// ==========================================================
// Menggunakan waktu lokal perangkat.
// Tidak menggunakan toISOString()
// agar tidak bergeser tanggal karena UTC.
// ==========================================================

function tanggalHariIniOVK(){

    const now =
        new Date();


    const tahun =
        now.getFullYear();


    const bulan =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const hari =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        tahun +
        "-" +
        bulan +
        "-" +
        hari
    );

}


// ==========================================================
// HITUNG TOTAL INPUT
// ==========================================================
// Harga × Qty
// ==========================================================

function hitungTotalOVKInput(){

    const harga =
        parseFloat(
            document.getElementById(
                "ovkHarga"
            )?.value
        );


    const qty =
        parseFloat(
            document.getElementById(
                "ovkQty"
            )?.value
        );


    const totalEl =
        document.getElementById(
            "ovkTotal"
        );


    if(!totalEl){

        return;
    }


    if(
        !Number.isFinite(harga) ||
        !Number.isFinite(qty) ||
        harga <= 0 ||
        qty <= 0
    ){

        totalEl.value =
            "—";

        return;
    }


    const total =
        harga * qty;


    totalEl.value =
        formatRupiahOVK(
            total
        );

}


// ==========================================================
// TAMBAH DATA OVK
// ==========================================================

function tambahDataOVK(){

    const tanggal =
        document.getElementById(
            "ovkTanggal"
        )?.value || "";


    const namaObat =
        document.getElementById(
            "ovkNamaObat"
        )?.value.trim() || "";


    const hargaRaw =
        document.getElementById(
            "ovkHarga"
        )?.value || "";


    const qtyRaw =
        document.getElementById(
            "ovkQty"
        )?.value || "";


    // ==========================================
    // VALIDASI TANGGAL
    // ==========================================

    if(!tanggal){

        tampilPesanOVK(
            "Silakan isi tanggal / bulan.",
            "warning"
        );

        return;
    }


    // ==========================================
    // VALIDASI NAMA
    // ==========================================

    if(!namaObat){

        tampilPesanOVK(
            "Silakan isi nama obat atau vitamin.",
            "warning"
        );

        return;
    }


    // ==========================================
    // VALIDASI HARGA
    // ==========================================

    if(
        hargaRaw === ""
    ){

        tampilPesanOVK(
            "Silakan isi harga.",
            "warning"
        );

        return;
    }


    const harga =
        Number(
            hargaRaw
        );


    if(
        !Number.isFinite(harga) ||
        harga <= 0
    ){

        tampilPesanOVK(
            "Harga harus lebih dari 0.",
            "warning"
        );

        return;
    }


    // ==========================================
    // VALIDASI QTY
    // ==========================================

    if(
        qtyRaw === ""
    ){

        tampilPesanOVK(
            "Silakan isi Qty.",
            "warning"
        );

        return;
    }


    const qty =
        Number(
            qtyRaw
        );


    if(
        !Number.isFinite(qty) ||
        qty <= 0
    ){

        tampilPesanOVK(
            "Qty harus lebih dari 0.",
            "warning"
        );

        return;
    }


    // ==========================================
    // HITUNG TOTAL ITEM
    // ==========================================

    const total =
        harga * qty;


    // ==========================================
    // DATA BARU
    // ==========================================

    const data = {

        tanggal:
            tanggal,

        namaObat:
            namaObat,

        harga:
            harga,

        qty:
            qty,

        total:
            total

    };


    // ==========================================
    // MASUKKAN KE DATA SESI
    // ==========================================

    window.fmcOVKDataSesi.push(
        data
    );


    // ==========================================
    // REFRESH TABEL
    // ==========================================

    renderOVKTableInPage();


    // ==========================================
    // RESET INPUT
    // ==========================================

    resetFormOVK();


    // ==========================================
    // PESAN
    // ==========================================

    tampilPesanOVK(
        "Data OVK berhasil ditambahkan.",
        "success"
    );

}


// ==========================================================
// RENDER TABEL
// ==========================================================

function renderOVKTable(){

    const serverData =
        window.fmcOVKDataServer || [];

    const sesiData =
        window.fmcOVKDataSesi || [];

    const data =
        serverData.concat(sesiData);


    // ==========================================
    // BELUM ADA DATA
    // ==========================================

    if(
        !data.length
    ){

        return `

            <div class="ovkEmpty">

                <span class="material-symbols-rounded">
                    medication
                </span>

                <strong>
                    Belum ada data
                </strong>

                <small>
                    Data obat atau vitamin yang
                    ditambahkan akan muncul di sini.
                </small>

            </div>

        `;

    }


    // ==========================================
    // HITUNG TOTAL KESELURUHAN
    // ==========================================

    const totalKeseluruhan =
        data.reduce(
            function(
                total,
                item
            ){

                return (
                    total +
                    (
                        Number(
                            item.total
                        ) || 0
                    )
                );

            },
            0
        );


    // ==========================================
    // TABEL
    // ==========================================

    return `

        <div class="ovkTableScroll">

            <table class="ovkTable">


                <!-- HEADER -->

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Tgl/Bulan
                        </th>

                        <th>
                            Nama Obat
                        </th>

                        <th>
                            Harga
                        </th>

                        <th>
                            Qty
                        </th>

                        <th>
                            Total
                        </th>

                        <th>
                        </th>

                    </tr>

                </thead>


                <!-- DATA -->

                <tbody>

                    ${
                        data.map(
                            function(
                                item,
                                index
                            ){

                                return `

                                    <tr>


                                        <!-- NO -->

                                        <td>
                                            ${index + 1}
                                        </td>


                                        <!-- TANGGAL -->

                                        <td>
                                            ${escapeOVK(
                                                formatTanggalOVK(
                                                    item.tanggal
                                                )
                                            )}
                                        </td>


                                        <!-- NAMA -->

                                        <td
                                            class="ovkNameCell">

                                            ${escapeOVK(
                                                item.namaObat
                                            )}

                                        </td>


                                        <!-- HARGA -->

                                        <td>
                                            ${formatRupiahOVK(
                                                item.harga
                                            )}
                                        </td>


                                        <!-- QTY -->

                                        <td>
                                            ${formatQtyOVK(
                                                item.qty
                                            )}
                                        </td>


                                        <!-- TOTAL -->

                                        <td>
                                            ${formatRupiahOVK(
                                                item.total
                                            )}
                                        </td>


                                        <!-- HAPUS -->

                                        <td>

                                            ${index < serverData.length ? `
                                                <button
                                                    type="button"
                                                    class="ovkDeleteBtn"
                                                    onclick="hapusDataOVKServer(${index})"
                                                    aria-label="Hapus data server"
                                                    title="Hapus data server">

                                                    <span class="material-symbols-rounded">
                                                        delete
                                                    </span>

                                                </button>
                                            ` : `
                                                <button
                                                    type="button"
                                                    class="ovkDeleteBtn"
                                                    onclick="hapusDataOVK(${index - serverData.length})"
                                                    aria-label="Hapus data">

                                                    <span class="material-symbols-rounded">
                                                        delete
                                                    </span>

                                                </button>
                                            `}

                                        </td>


                                    </tr>

                                `;

                            }
                        ).join("")
                    }

                </tbody>


            </table>

        </div>


        <!-- ======================================
             TOTAL KESELURUHAN
        ======================================= -->

        <div class="ovkGrandTotal">

            <div>

                <small>
                    TOTAL KESELURUHAN OVK
                </small>

                <strong>
                    ${formatRupiahOVK(
                        totalKeseluruhan
                    )}
                </strong>

            </div>


            <span class="material-symbols-rounded">
                calculate
            </span>

        </div>

    `;

}


// ==========================================================
// RENDER ULANG TABEL
// ==========================================================

function renderOVKTableInPage(){

    const wrap =
        document.getElementById(
            "ovkTableWrap"
        );


    if(!wrap){

        return;
    }


    wrap.innerHTML =
        renderOVKTable();

}


// ==========================================================
// HAPUS DATA
// ==========================================================

function hapusDataOVK(
    index
){

    if(
        !Number.isInteger(index)
    ){

        return;
    }


    if(
        index < 0 ||
        index >=
        window.fmcOVKDataSesi.length
    ){

        return;
    }


    const data =
        window.fmcOVKDataSesi[
            index
        ];


    const nama =
        data?.namaObat ||
        "data ini";


    const yakin =
        confirm(
            `Hapus ${nama}?`
        );


    if(!yakin){

        return;
    }


    window.fmcOVKDataSesi.splice(
        index,
        1
    );


    renderOVKTableInPage();


    tampilPesanOVK(
        "Data OVK berhasil dihapus.",
        "success"
    );

}


// ==========================================================
// HAPUS SATU DATA OVK DARI SERVER GAS 2
// ==========================================================

async function hapusDataOVKServer(
    serverIndex
){

    const serverData =
        Array.isArray(window.fmcOVKDataServer)
            ? window.fmcOVKDataServer
            : [];

    if(
        !Number.isInteger(serverIndex) ||
        serverIndex < 0 ||
        serverIndex >= serverData.length
    ){
        return;
    }

    const item =
        serverData[serverIndex];

    const namaObat =
        String(
            item?.namaObat ||
            "data OVK"
        );

    const yakin =
        window.confirm(
            `Hapus ${namaObat} dari server?`
        );

    if(!yakin){
        return;
    }

    try{

        const result =
            await ovkPostDirect(
                "deleteOVKItem",
                {
                    index:
                        String(
                            serverIndex
                        )
                }
            );

        if(
            !result ||
            result.success !== true
        ){
            throw new Error(
                result?.message ||
                "Data OVK gagal dihapus dari server."
            );
        }

        const responseData =
            result.data || {};

        window.fmcOVKDataServer =
            Array.isArray(
                responseData.items
            )
                ? responseData.items.map(
                    function(item, index){

                        return {
                            no:
                                item.no ??
                                index + 1,

                            row:
                                item.row ??
                                index + 2,

                            tanggal:
                                String(
                                    item.tanggal ||
                                    ""
                                ),

                            namaObat:
                                String(
                                    item.namaObat ||
                                    ""
                                ),

                            harga:
                                Number(
                                    item.harga ||
                                    0
                                ),

                            qty:
                                Number(
                                    item.qty ||
                                    0
                                ),

                            total:
                                Number(
                                    item.total ||
                                    (
                                        Number(item.harga || 0) *
                                        Number(item.qty || 0)
                                    )
                                ),

                            __server:
                                true
                        };

                    }
                )
                : [];

        renderOVKTableInPage();

        // SATU notifikasi server.
        // showUpdateToast/showToast sudah menyediakan ikon 📢.
        tampilToastServerOVK(
            "Data OVK berhasil dihapus dari server"
        );

    }
    catch(error){

        console.error(
            "OVK DELETE SERVER ERROR:",
            error
        );

        // SATU notifikasi error server.
        tampilToastServerOVK(
            "Data OVK gagal dihapus dari server: " +
            (
                error?.message ||
                "error tidak diketahui"
            )
        );

    }

}


// ==========================================================
// RESET FORM
// ==========================================================

function resetFormOVK(){

    const nama =
        document.getElementById(
            "ovkNamaObat"
        );


    const harga =
        document.getElementById(
            "ovkHarga"
        );


    const qty =
        document.getElementById(
            "ovkQty"
        );


    const total =
        document.getElementById(
            "ovkTotal"
        );


    if(nama){

        nama.value =
            "";

    }


    if(harga){

        harga.value =
            "";

    }


    if(qty){

        qty.value =
            "";

    }


    if(total){

        total.value =
            "—";

    }


    // Tanggal sengaja tidak dihapus.
    // User masih berada pada tanggal
    // yang sama.


    if(nama){

        setTimeout(
            function(){

                nama.focus();

            },
            50
        );

    }

}




// ==========================================================
// DIRECT POST OVK KE GAS
// ----------------------------------------------------------
// OVK memakai direct fetch untuk SAVE / GET.
//
// apiPost() FMC memang praktis untuk modul umum, tetapi ia
// menyamarkan error fetch/response menjadi:
// "Tidak dapat terhubung ke server."
//
// Untuk OVK, error asli harus sampai ke modul agar:
// 1. SAVE tidak salah didiagnosis.
// 2. GET server dapat dibaca kembali.
// 3. Debugging tidak lagi buta.
// ==========================================================

async function ovkPostDirect(
    action,
    payload = {}
){

    const identity =
        getOVKSessionIdentity();

    if(
        !identity.email &&
        !identity.user_id &&
        !identity.tenant_id
    ){
        throw new Error(
            "Session tenant tidak ditemukan. Silakan login kembali."
        );
    }

    // ==========================================================
    // ENDPOINT KHUSUS OVK — GAS 2 DATABASE
    // ----------------------------------------------------------
    // OVK TIDAK BOLEH memakai API_BASE / GAS 1.
    // GAS 1 tetap dipakai modul lain.
    // ==========================================================
    const apiUrl =
        "https://script.google.com/macros/s/AKfycbwNuclFEmIi555Ld3ORqSkIWlDvYG4WJUW8UZX84-ho5FNbB6RN7YF80c-hDlkpkZ8s/exec";

    const body = {
        action:
            action,

        ...payload,

        email:
            identity.email,

        user_id:
            identity.user_id,

        tenant_id:
            identity.tenant_id
    };

    console.info(
        "OVK DIRECT POST:",
        {
            action: action,
            email: identity.email,
            user_id: identity.user_id,
            tenant_id: identity.tenant_id
        }
    );

    const response =
        await fetch(
            apiUrl,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    new URLSearchParams(body),

                cache:
                    "no-store"
            }
        );


    if(!response.ok){

        throw new Error(
            "HTTP " +
            response.status
        );

    }


    const raw =
        await response.text();

    console.info(
        "OVK DIRECT RESPONSE:",
        raw
    );


    let result;

    try{

        result =
            JSON.parse(raw);

    }
    catch(error){

        console.error(
            "OVK RESPONSE BUKAN JSON:",
            raw
        );

        throw new Error(
            "Response server OVK tidak valid."
        );

    }


    if(
        !result ||
        typeof result !== "object"
    ){

        throw new Error(
            "Response server OVK tidak valid."
        );

    }


    return result;

}


// ==========================================================
// SIMPAN DATA
// ----------------------------------------------------------
// OVK menggunakan direct POST tenant ke GAS.
// apiPost() menangani endpoint, tenant email, response JSON,
// dan session secara konsisten dengan Master Kontrak.
// ==========================================================
// GAS TENANT V1
// Action : saveOVK
// Payload:
// {
//     items: JSON.stringify(items)
// }
//
// Catatan:
// - Email tenant TIDAK dikirim manual dari modul ini.
// - api.js Tenant Identity otomatis menambahkan email user
//   untuk action non-auth.
// - Total dari PWA hanya untuk tampilan.
// - GAS menghitung ulang kolom F melalui Spreadsheet.
// ==========================================================

async function simpanDataOVK(){

    const data =
        window.fmcOVKDataSesi || [];


    // ==========================================
    // VALIDASI DATA
    // ==========================================

    if(
        !data.length
    ){

        tampilPesanOVK(
            "Belum ada data OVK yang siap disimpan.",
            "warning"
        );

        return;
    }


    // ==========================================
    // TOMBOL SIMPAN
    // ==========================================

    const button =
        document.getElementById(
            "btnSimpanOVK"
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

        // ==========================================
        // SALIN DATA
        // ==========================================
        //
        // Total tetap ikut dikirim untuk kompatibilitas
        // payload, tetapi GAS tidak mempercayainya.
        // Kolom F dihitung oleh Spreadsheet.
        //
        // ==========================================

        const items =
            data.map(
                function(item){

                    return {

                        tanggal:
                            item.tanggal,

                        namaObat:
                            item.namaObat,

                        harga:
                            Number(
                                item.harga
                            ),

                        qty:
                            Number(
                                item.qty
                            ),

                        total:
                            Number(
                                item.total
                            ) || 0

                    };

                }
            );


        // ==========================================
        // KIRIM KE GAS
        // ==========================================

        const result =
            await ovkPostDirect(
                "saveOVK",
                {
                    items:
                        JSON.stringify(
                            items
                        )
                }
            );


        // ==========================================
        // CEK RESPONSE
        // ==========================================

        if(
            !result ||
            result.success !== true
        ){

            throw new Error(
                result?.message ||
                "Data OVK gagal disimpan."
            );

        }


        // ==========================================
        // RESPONSE GAS
        // ==========================================
        //
        // GAS mengembalikan:
        // data.jumlah
        // data.totalBatch
        // data.items
        //
        // Total item berasal dari formula Spreadsheet.
        //
        // ==========================================

        const responseData =
            result.data || {};


        const jumlah =
            Number(
                responseData.jumlah || 0
            );


        const totalBatch =
            Number(
                responseData.totalBatch || 0
            );


        // ==========================================
        // SIMPAN HASIL FORMULA DARI GAS
        // ==========================================
        //
        // Hanya digunakan untuk informasi/debug.
        // Data sesi tetap dibersihkan setelah sukses.
        //
        // ==========================================

        console.log(
            "=========================================="
        );

        console.log(
            "FMC OVK - BERHASIL DISIMPAN"
        );

        console.log(
            "Jumlah:",
            jumlah
        );

        console.log(
            "Total Batch dari Spreadsheet:",
            totalBatch
        );

        console.log(
            "Response:",
            responseData
        );

        console.log(
            "=========================================="
        );


        // ==========================================
        // 📢 SAVE SUKSES
        // ==========================================
        //
        // Jangan menghapus data sesi sebelum GET server
        // berhasil. Jika GET gagal, data yang baru disimpan
        // tetap terlihat di PWA.
        // ==========================================

        // SATU notifikasi server.
        // showUpdateToast/showToast sudah menyediakan ikon 📢.
        tampilToastServerOVK(
            "Data OVK berhasil tersimpan di server"
        );

        /*
         * Response SAVE sudah membawa data hasil penulisan.
         * Simpan sebagai cache tenant sementara.
         */
        if(
            Array.isArray(
                responseData?.items
            )
        ){

            simpanOVKCacheTenant(
                responseData.items
            );

        }


        /*
         * GET verifikasi setelah SAVE.
         * Jika berhasil:
         *   - server menjadi sumber utama
         *   - data sesi dibersihkan
         *   - tabel dirender dari server
         *
         * Jika gagal:
         *   - SAVE tetap dianggap sukses
         *   - data sesi dipertahankan
         *   - tidak muncul notif error kedua
         */
        try{

            const serverItems =
                await muatDataOVKDariServerOVK({
                    silent: true
                });


            if(
                Array.isArray(serverItems)
            ){

                window.fmcOVKDataSesi =
                    [];

                renderOVKTableInPage();

            }


        }catch(verifyError){

            console.warn(
                "OVK: SAVE sukses, GET verifikasi gagal. Data sesi dipertahankan.",
                verifyError
            );

        }


        // ==========================================
        // RESET FORM
        // ==========================================

        resetFormOVK();



    }
    catch(error){

        console.error(
            "OVK SAVE ERROR:",
            error
        );


        const pesanError =
            error?.message ||
            "Data OVK gagal disimpan.";

        // SATU notifikasi error server.
        tampilToastServerOVK(
            "Data OVK gagal disimpan: " +
            pesanError
        );

    }
    finally{

        // ==========================================
        // KEMBALIKAN TOMBOL
        // ==========================================

        if(button){

            button.disabled = false;

            button.innerHTML = `
                <span class="material-symbols-rounded">
                    save
                </span>

                SIMPAN DATA OVK
            `;

        }

    }

}


// ==========================================================
// GET DATA OVK DARI SERVER
// ==========================================================

async function muatDataOVKDariServerOVK(
    options = {}
){

    const silent =
        options.silent === true;

    try{

        const email =
            pastikanTenantOVK();

        const result =
            await ovkPostDirect(
                "getOVK",
                {}
            );

        if(
            !result ||
            result.success !== true
        ){

            throw new Error(
                result?.message ||
                "Data OVK belum dapat dibaca dari server."
            );

        }

        /*
         * apiPost() dipakai khusus GET karena jalur ini
         * sudah terbukti dapat membaca response GAS di PWA.
         *
         * GAS OVK mengembalikan:
         * {
         *   success: true,
         *   data: {
         *      tenant_id,
         *      items: [...]
         *   }
         * }
         *
         * Tetap dukung beberapa bentuk response
         * agar tidak rapuh terhadap wrapper API.
         */

        const responseData =
            result.data ||
            result.result ||
            result;


        let items =
            Array.isArray(
                responseData?.items
            )
                ? responseData.items
                : Array.isArray(
                    responseData
                )
                    ? responseData
                    : [];


        window.fmcOVKDataServer =
            items
                .map(
                    function(item){

                        if(
                            !item ||
                            typeof item !== "object"
                        ){
                            return null;
                        }

                        return {

                            no:
                                item.no ??
                                "",

                            row:
                                item.row ??
                                "",

                            tanggal:
                                String(
                                    item.tanggal ||
                                    ""
                                ),

                            namaObat:
                                String(
                                    item.namaObat ||
                                    ""
                                ),

                            harga:
                                Number(
                                    item.harga || 0
                                ),

                            qty:
                                Number(
                                    item.qty || 0
                                ),

                            total:
                                Number(
                                    item.total || 0
                                ),

                            __server:
                                true

                        };

                    }
                )
                .filter(
                    function(item){
                        return item !== null;
                    }
                );


        /*
         * Server adalah sumber utama.
         * Data server langsung ditampilkan di PWA.
         */
        renderOVKTableInPage();

        /*
         * Cache hanya sebagai fallback UI.
         * Server tetap sumber data utama.
         */
        simpanOVKCacheTenant(
            window.fmcOVKDataServer
        );


        console.info(
            "OVK GET SERVER OK:",
            {
                jumlah:
                    window.fmcOVKDataServer.length,

                items:
                    window.fmcOVKDataServer
            }
        );


        /*
         * Jangan tampilkan notif "berhasil dimuat dari server".
         * User hanya perlu melihat datanya.
         */
        return window.fmcOVKDataServer;


    }catch(error){

        console.error(
            "OVK GET SERVER ERROR:",
            error
        );

        /*
         * GET awal dibuat silent.
         * Jangan lagi menampilkan pesan generik
         * "Tidak dapat terhubung ke server."
         */
        const cached =
            ambilOVKCacheTenant();

        if(
            cached.length
        ){

            window.fmcOVKDataServer =
                cached.map(
                    function(item){

                        return {
                            ...item,
                            __server: false,
                            __cache: true
                        };

                    }
                );

            renderOVKTableInPage();

        }

        if(
            !silent
        ){

            tampilPesanOVK(
                "Server gagal dibaca: " +
                (
                    error?.message ||
                    "error tidak diketahui"
                ),
                "warning"
            );

        }

        throw error;
    }
}

// ==========================================================
// TOAST SERVER
// ==========================================================

function tampilToastServerOVK(
    pesan
){

    try{

        if(
            typeof showUpdateToast ===
            "function"
        ){

            showUpdateToast(
                pesan
            );

            return;
        }


        if(
            typeof showToast ===
            "function"
        ){

            showToast(
                pesan
            );

            return;
        }


        console.info(
            "OVK SERVER TOAST:",
            pesan
        );

    }
    catch(error){

        console.warn(
            "OVK SERVER TOAST ERROR:",
            error
        );

    }
}

// ==========================================================
// PESAN
// ==========================================================

function tampilPesanOVK(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "ovkMessage"
        );


    if(!el){

        return;
    }


    el.textContent =
        pesan;


    el.className =
        "ovkMessage " +
        tipe;


    el.style.display =
        "block";


    clearTimeout(
        window.fmcOVKMessageTimer
    );


    window.fmcOVKMessageTimer =
        setTimeout(
            function(){

                el.style.display =
                    "none";

            },
            4000
        );

}


// ==========================================================
// FORMAT RUPIAH
// ==========================================================

function formatRupiahOVK(
    value
){

    const angka =
        Number(
            value
        );


    if(
        !Number.isFinite(
            angka
        )
    ){

        return "—";
    }


    return new Intl.NumberFormat(
        "id-ID",
        {
            style:
                "currency",

            currency:
                "IDR",

            minimumFractionDigits:
                0
        }
    ).format(
        angka
    );

}


// ==========================================================
// FORMAT QTY
// ==========================================================

function formatQtyOVK(
    value
){

    const angka =
        Number(
            value
        );


    if(
        !Number.isFinite(
            angka
        )
    ){

        return "—";
    }


    return new Intl.NumberFormat(
        "id-ID",
        {
            maximumFractionDigits:
                2
        }
    ).format(
        angka
    );

}


// ==========================================================
// FORMAT TANGGAL
// ==========================================================

function formatTanggalOVK(
    value
){

    if(!value){

        return "—";
    }


    const bagian =
        String(
            value
        ).split(
            "-"
        );


    if(
        bagian.length !== 3
    ){

        return value;
    }


    return (
        bagian[2] +
        "/" +
        bagian[1] +
        "/" +
        bagian[0]
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeOVK(
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


// ==========================================================
// DEBUG LOAD
// ==========================================================

console.log(
    "FMC OVK.JS LOADED"
);