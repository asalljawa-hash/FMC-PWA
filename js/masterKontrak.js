// ==========================================================
// FMC BROILER MOBILE V12
// MASTER KONTRAK.JS
// FINAL - TENANT AWARE + SERVER FIRST
// ==========================================================

"use strict";

/*
 * CATATAN PENTING
 * ----------------------------------------------------------
 * - apiPost() pada api.js otomatis menambahkan email tenant
 *   dari FMC_USER untuk semua action non-auth.
 * - File ini juga mengambil email session secara eksplisit
 *   sebagai validasi sebelum GET/SAVE.
 * - Server/GAS adalah sumber data utama.
 * - Sheet tenant yang dipakai ditentukan oleh GAS melalui
 *   getTenantByEmail(email).
 * - Tidak mengubah rumus spreadsheet.
 */

// ==========================================================
// STATE
// ==========================================================

let dataMasterKontrakUI = [];

// Menandai apakah isi form saat ini sudah tersimpan di server.
let masterKontrakDataTersimpan = false;

const MASTER_KONTRAK_LOCAL_KEY =
    "FMC_MASTER_KONTRAK_CACHE";

const MASTER_KONTRAK_KEYBOARD_GUARD = {
    installed: false,
    timer: null
};

// ==========================================================
// KEYBOARD MOBILE - JAGA INPUT TERAKHIR TETAP TERLIHAT
// ==========================================================

function pasangKeyboardMasterKontrak(){

    if(MASTER_KONTRAK_KEYBOARD_GUARD.installed){
        return;
    }

    MASTER_KONTRAK_KEYBOARD_GUARD.installed = true;

    const scrollKeInputAktif = function(){

        clearTimeout(
            MASTER_KONTRAK_KEYBOARD_GUARD.timer
        );

        MASTER_KONTRAK_KEYBOARD_GUARD.timer =
            setTimeout(
                function(){

                    const active =
                        document.activeElement;

                    if(
                        !active ||
                        !active.matches(
                            "#masterKontrakPage .masterKontrakRow input"
                        )
                    ){
                        return;
                    }

                    /*
                     * scrollIntoView() dibuat ke tengah viewport,
                     * bukan hanya ke bawah layar. Dengan begitu
                     * keyboard Android tidak menutup input yang
                     * sedang diedit.
                     */
                    try{

                        active.style.scrollMarginBottom =
                            "220px";

                        active.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                            inline: "nearest"
                        });

                    }
                    catch(error){

                        console.warn(
                            "MASTER KONTRAK KEYBOARD SCROLL ERROR:",
                            error
                        );
                    }

                },
                350
            );
    };

    document.addEventListener(
        "focusin",
        function(event){

            const target =
                event.target;

            if(
                target &&
                target.matches &&
                target.matches(
                    "#masterKontrakPage .masterKontrakRow input"
                )
            ){

                scrollKeInputAktif();
            }
        }
    );

    /*
     * Saat keyboard Android benar-benar membuka/menutup,
     * visualViewport berubah. Kita scroll ulang agar posisi
     * input tetap aman.
     */
    if(window.visualViewport){

        window.visualViewport.addEventListener(
            "resize",
            scrollKeInputAktif
        );

        window.visualViewport.addEventListener(
            "scroll",
            scrollKeInputAktif
        );
    }
}


// ==========================================================
// STATE TOMBOL SIMPAN
// ==========================================================

function setMasterKontrakSaveButtonState(tersimpan){

    masterKontrakDataTersimpan =
        tersimpan === true;

    const button =
        document.getElementById(
            "btnSimpanMasterKontrak"
        );

    if(!button) return;

    if(masterKontrakDataTersimpan){

        button.disabled = true;

        button.innerHTML = `
            <span class="material-symbols-rounded">
                check_circle
            </span>
            DATA TELAH TERSIMPAN
        `;

        return;
    }

    button.disabled = false;

    button.innerHTML = `
        <span class="material-symbols-rounded">
            save
        </span>
        SIMPAN MASTER KONTRAK
    `;
}


// ==========================================================
// SESSION TENANT
// ==========================================================

function getMasterKontrakTenantEmail(){

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
            "MASTER KONTRAK SESSION ERROR:",
            error
        );

        return "";
    }
}

function pastikanTenantMasterKontrak(){

    const email =
        getMasterKontrakTenantEmail();

    if(!email){

        throw new Error(
            "Session tenant tidak ditemukan. Silakan login kembali."
        );
    }

    return email;
}

// ==========================================================
// TAMPILKAN HALAMAN MASTER KONTRAK
// ==========================================================

async function tampilMasterKontrak(){

    const page =
        document.getElementById(
            "masterKontrakPage"
        );

    if(!page) return;

    pasangKeyboardMasterKontrak();

    page.innerHTML = `
        <div class="card masterKontrakCard">

            <div class="masterKontrakHeader">
                <div>
                    <div class="masterKontrakSmall">
                        FMC BROILER MOBILE V12
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
                </div>
            </div>

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

                <div class="masterKontrakTableHeader">
                    <div>BB AVG</div>
                    <div>HARGA KONTRAK</div>
                    <div></div>
                </div>

                <div
                    id="masterKontrakRows"
                    class="masterKontrakRows">
                </div>

            </div>

            <div
                id="masterKontrakMessage"
                class="masterKontrakMessage"
                style="display:none;">
            </div>

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

    // Saat halaman baru dibangun, tombol kembali ke mode SIMPAN.
    setMasterKontrakSaveButtonState(false);

    /*
     * Mulai dari kosong supaya tidak ada data tenant lama
     * yang tertinggal ketika user berpindah tenant/session.
     */
    dataMasterKontrakUI = [];
    renderBarisKontrakUI();

    /*
     * Server adalah sumber utama.
     * Data dari spreadsheet langsung dimuat saat halaman dibuka.
     */
    try{

        await muatMasterKontrakDariGAS({
            silent: false
        });

    }
    catch(error){

        console.warn(
            "MASTER KONTRAK: GET awal gagal.",
            error
        );

        /*
         * Jika server gagal, tampilkan cache tenant yang sama
         * sebagai fallback UI. Cache tidak pernah dianggap
         * sebagai data server.
         */
        const cached =
            ambilMasterKontrakSessionLocal();

        if(cached.length){

            dataMasterKontrakUI =
                cached.map(
                    function(item){
                        return {
                            bbAvg: item.bbAvg,
                            harga: item.harga
                        };
                    }
                );

            renderBarisKontrakUI();
            setMasterKontrakSaveButtonState(false);

            tampilPesanMasterKontrak(
                "Data server belum dapat dimuat. Data lokal tenant ini ditampilkan sementara.",
                "warning"
            );
        }
    }
}

// ==========================================================
// RENDER BARIS
// ==========================================================

function renderBarisKontrakUI(){

    const container =
        document.getElementById(
            "masterKontrakRows"
        );

    if(!container) return;

    if(
        !Array.isArray(dataMasterKontrakUI) ||
        dataMasterKontrakUI.length === 0
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
        dataMasterKontrakUI.map(
            function(item,index){

                return `
                    <div
                        class="masterKontrakRow"
                        data-index="${index}">

                        <div class="masterKontrakInputGroup">
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
                                oninput="ubahDataKontrakUI(${index}, 'bbAvg', this.value)">
                        </div>

                        <div class="masterKontrakInputGroup">
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
                                oninput="ubahDataKontrakUI(${index}, 'harga', this.value)">
                        </div>

                        <button
                            type="button"
                            class="masterKontrakDeleteBtn"
                            title="Hapus baris"
                            onclick="hapusBarisKontrakUI(${index})">

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

    // Ada perubahan baru -> data belum tersimpan.
    setMasterKontrakSaveButtonState(false);

    dataMasterKontrakUI.push({
        bbAvg: "",
        harga: ""
    });

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

            /*
             * Beri waktu keyboard Android muncul, lalu pastikan
             * input baris terakhir tidak tertutup keyboard.
             */
            setTimeout(
                function(){
                    try{
                        input.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                            inline: "nearest"
                        });
                    }
                    catch(error){
                        console.warn(
                            "MASTER KONTRAK ADD ROW SCROLL ERROR:",
                            error
                        );
                    }
                },
                350
            );
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

    if(!dataMasterKontrakUI[index]) return;

    if(
        String(dataMasterKontrakUI[index][field] ?? "") !==
        String(value ?? "")
    ){
        dataMasterKontrakUI[index][field] =
            value;

        // Edit data -> wajib simpan kembali.
        setMasterKontrakSaveButtonState(false);
    }
}

// ==========================================================
// HAPUS BARIS
// ==========================================================

function hapusBarisKontrakUI(index){

    if(
        index < 0 ||
        index >= dataMasterKontrakUI.length
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

    dataMasterKontrakUI.splice(
        index,
        1
    );

    // Hapus data -> wajib simpan kembali.
    setMasterKontrakSaveButtonState(false);

    renderBarisKontrakUI();
}

// ==========================================================
// VALIDASI
// ==========================================================

function validasiMasterKontrakUI(){

    if(!dataMasterKontrakUI.length){

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
        i < dataMasterKontrakUI.length;
        i++
    ){

        const item =
            dataMasterKontrakUI[i];

        const bbAvg =
            parseFloat(item.bbAvg);

        const harga =
            parseFloat(item.harga);

        if(!Number.isFinite(bbAvg)){

            return {
                valid: false,
                message:
                    `BB Avg pada baris ${i + 1} belum diisi.`
            };
        }

        if(bbAvg < 0){

            return {
                valid: false,
                message:
                    `BB Avg pada baris ${i + 1} tidak valid.`
            };
        }

        if(!Number.isFinite(harga)){

            return {
                valid: false,
                message:
                    `Harga kontrak pada baris ${i + 1} belum diisi.`
            };
        }

        if(harga <= 0){

            return {
                valid: false,
                message:
                    `Harga kontrak pada baris ${i + 1} harus lebih dari 0.`
            };
        }

        const key =
            bbAvg.toFixed(2);

        if(bbAvgSet.has(key)){

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
// NORMALISASI RESPONSE GAS
// ==========================================================

function normalisasiResponseMasterKontrak(result){

    let items = [];

    if(
        result &&
        result.data &&
        Array.isArray(result.data.items)
    ){
        items = result.data.items;
    }
    else if(
        result &&
        Array.isArray(result.items)
    ){
        items = result.items;
    }
    else if(
        result &&
        Array.isArray(result.data)
    ){
        items = result.data;
    }

    return items
        .map(
            function(item){

                return {
                    bbAvg:
                        Number(item?.bbAvg),
                    harga:
                        Number(item?.harga),
                    __server: true
                };
            }
        )
        .filter(
            function(item){

                return Number.isFinite(item.bbAvg) &&
                       Number.isFinite(item.harga);
            }
        );
}

// ==========================================================
// SAVE MASTER KONTRAK KE GAS
// ==========================================================

async function kirimMasterKontrakKeGAS(){

    const hasil =
        validasiMasterKontrakUI();

    if(!hasil.valid){
        return {
            success: false,
            message: hasil.message
        };
    }

    const email =
        pastikanTenantMasterKontrak();

    const items =
        dataMasterKontrakUI.map(
            function(item){
                return {
                    bbAvg:
                        Number(item.bbAvg),
                    harga:
                        Number(item.harga)
                };
            }
        );

    if(!items.length){
        return {
            success: false,
            message:
                "Belum ada data kontrak."
        };
    }

    /*
     * Ikuti engine Pakan dan Operasional:
     * semua request tenant memakai apiPost().
     * api.js yang mengelola session/email tenant.
     */
    return await apiPost(
        "saveMasterKontrak",
        {
            email: email,
            items:
                JSON.stringify(items)
        }
    );
}

// ==========================================================
// SIMPAN UI
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

        /*
         * SAVE adalah tahap utama.
         * Jika GAS mengembalikan success:true,
         * data dianggap berhasil tersimpan.
         */
        const result =
            await kirimMasterKontrakKeGAS();

        if(
            !result ||
            result.success !== true
        ){

            throw new Error(
                result?.message ||
                "Data Master Kontrak gagal disimpan ke server."
            );
        }

        /*
         * 📢 sukses langsung setelah response SAVE
         * dari GAS benar-benar success:true.
         */
        tampilPesanMasterKontrak(
            result.message ||
            "Data Master Kontrak berhasil disimpan di server.",
            "success"
        );

        // SAVE berhasil -> tombol berubah menjadi DATA TELAH TERSIMPAN.
        setMasterKontrakSaveButtonState(true);

        tampilToastServerMasterKontrak(
            "Data Master Kontrak berhasil tersimpan di server"
        );

        /*
         * GET verifikasi adalah tahap tambahan.
         * Jika GET gagal, SAVE tidak dibatalkan.
         * Ini mengikuti prinsip Operasional:
         * refresh/GET tidak boleh mengubah SAVE sukses
         * menjadi SAVE gagal.
         */
        try{

            const serverItems =
                await muatMasterKontrakDariGAS({
                    silent: true
                });

            tampilPesanMasterKontrak(
                `Data Master Kontrak tersimpan dan berhasil dibaca kembali dari server (${serverItems.length} baris).`,
                "success"
            );

        }catch(verifyError){

            console.warn(
                "MASTER KONTRAK: SAVE sukses, GET verifikasi gagal.",
                verifyError
            );

            tampilPesanMasterKontrak(
                "Data sudah tersimpan di server. Pembacaan ulang server belum berhasil.",
                "warning"
            );
        }

    }catch(error){

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
            "Data Master Kontrak belum berhasil tersimpan di server"
        );

        // Gagal -> tetap dalam mode SIMPAN agar user bisa mencoba lagi.
        setMasterKontrakSaveButtonState(false);

    }finally{

        // Jangan mengembalikan tombol secara paksa ke SIMPAN setelah SAVE sukses.
        // State tombol sudah ditentukan oleh hasil SAVE di atas.
        if(button && !masterKontrakDataTersimpan){
            button.disabled = false;
        }
    }
}

// ==========================================================
// GET MASTER KONTRAK DARI GAS
// ==========================================================

async function muatMasterKontrakDariGAS(
    options = {}
){

    const silent =
        options.silent === true;

    try{

        const email =
            pastikanTenantMasterKontrak();

        const result =
            await apiPost(
                "getMasterKontrak",
                {
                    email: email
                }
            );

        if(
            !result ||
            result.success !== true
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

        /*
         * Server adalah sumber utama.
         * Array kosong dari server berarti memang
         * belum ada data kontrak.
         */
        dataMasterKontrakUI =
            items.map(
                function(item){
                    return {
                        bbAvg: item.bbAvg,
                        harga: item.harga,
                        __server: true
                    };
                }
            );

        renderBarisKontrakUI();
        simpanMasterKontrakSessionLocal();

        // Data yang berhasil dibaca dari server dianggap sudah tersimpan.
        // Tidak menampilkan notif "berhasil dimuat dari server" lagi.
        setMasterKontrakSaveButtonState(
            items.length > 0
        );

        console.info(
            "MASTER KONTRAK GET OK:",
            {
                email: email,
                items: items
            }
        );

        return items;

    }catch(error){

        console.error(
            "MASTER KONTRAK GET ERROR:",
            error
        );

        if(!silent){

            tampilPesanMasterKontrak(
                error?.message ||
                "Data server Master Kontrak belum dapat dimuat.",
                "warning"
            );
        }

        throw error;
    }
}

// ==========================================================
// LOCAL CACHE PER TENANT
// ==========================================================

function simpanMasterKontrakSessionLocal(){

    try{

        const email =
            getMasterKontrakTenantEmail();

        if(!email){
            return;
        }

        const cache =
            JSON.parse(
                localStorage.getItem(
                    MASTER_KONTRAK_LOCAL_KEY
                ) || "{}"
            );

        cache[email] =
            dataMasterKontrakUI.map(
                function(item){
                    return {
                        bbAvg: Number(item.bbAvg),
                        harga: Number(item.harga)
                    };
                }
            );

        localStorage.setItem(
            MASTER_KONTRAK_LOCAL_KEY,
            JSON.stringify(cache)
        );

    }
    catch(error){

        console.warn(
            "MASTER KONTRAK CACHE SAVE ERROR:",
            error
        );
    }
}

function ambilMasterKontrakSessionLocal(){

    try{

        const email =
            getMasterKontrakTenantEmail();

        if(!email){
            return [];
        }

        const cache =
            JSON.parse(
                localStorage.getItem(
                    MASTER_KONTRAK_LOCAL_KEY
                ) || "{}"
            );

        const items =
            cache[email];

        if(!Array.isArray(items)){
            return [];
        }

        return items
            .map(
                function(item){
                    return {
                        bbAvg: Number(item?.bbAvg),
                        harga: Number(item?.harga)
                    };
                }
            )
            .filter(
                function(item){
                    return Number.isFinite(item.bbAvg) &&
                           Number.isFinite(item.harga);
                }
            );

    }
    catch(error){

        console.warn(
            "MASTER KONTRAK CACHE READ ERROR:",
            error
        );

        return [];
    }
}

// ==========================================================
// PESAN
// ==========================================================

function tampilPesanMasterKontrak(
    pesan,
    tipe = "info"
){

    const el =
        document.getElementById(
            "masterKontrakMessage"
        );

    if(!el) return;

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
// ==========================================================

function tampilToastServerMasterKontrak(
    pesan
){

    try{

        // Toast global sudah menangani ikon 📢.
        // Bersihkan ikon yang mungkin ikut terbawa dari caller
        // agar notif tidak pernah menjadi "📢 📢".
        const pesanBersih =
            String(pesan || "")
                .replace(/^(?:\s*📢\s*)+/, "")
                .trim();

        if(
            typeof showUpdateToast ===
            "function"
        ){
            showUpdateToast(pesanBersih);
            return;
        }

        if(
            typeof showToast ===
            "function"
        ){
            showToast(pesanBersih);
            return;
        }

        console.info(
            "MASTER KONTRAK TOAST:",
            pesan
        );

    }
    catch(error){

        console.warn(
            "MASTER KONTRAK TOAST ERROR:",
            error
        );
    }
}
