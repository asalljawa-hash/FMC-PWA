// ==========================================================
// FMC BROILER MOBILE V11
// MASTER KONTRAK.JS
// UI ONLY
// ==========================================================

"use strict";


// ==========================================================
// TAMPILKAN HALAMAN MASTER KONTRAK
// ==========================================================

async function tampilMasterKontrak(){

    const page =
        document.getElementById("masterKontrakPage");

    if(!page) return;


    page.innerHTML = `

        <div class="card masterKontrakCard">


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


                <!-- HEADER TABEL -->

                <div class="masterKontrakTableHeader">

                    <div>
                        BB AVG
                    </div>

                    <div>
                        HARGA KONTRAK
                    </div>

                    <div>
                        
                    </div>

                </div>


                <!-- DATA ROW -->

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


    renderBarisKontrakUI();

}


// ==========================================================
// DATA UI SEMENTARA
// ==========================================================

let dataMasterKontrakUI = [];


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
        !dataMasterKontrakUI ||
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

    dataMasterKontrakUI.push({

        bbAvg:"",
        harga:""

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

    if(
        !dataMasterKontrakUI[index]
    ) return;


    dataMasterKontrakUI[index][field] =
        value;

}


// ==========================================================
// HAPUS BARIS
// ==========================================================

function hapusBarisKontrakUI(index){

    if(
        index < 0 ||
        index >= dataMasterKontrakUI.length
    ) return;


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


    renderBarisKontrakUI();

}


// ==========================================================
// VALIDASI
// ==========================================================

function validasiMasterKontrakUI(){

    if(
        !dataMasterKontrakUI.length
    ){

        return {
            valid:false,
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
            parseFloat(
                item.bbAvg
            );

        const harga =
            parseFloat(
                item.harga
            );


        if(
            !Number.isFinite(bbAvg)
        ){

            return {
                valid:false,
                message:
                    `BB Avg pada baris ${i + 1} belum diisi.`
            };

        }


        if(
            bbAvg < 0
        ){

            return {
                valid:false,
                message:
                    `BB Avg pada baris ${i + 1} tidak valid.`
            };

        }


        if(
            !Number.isFinite(harga)
        ){

            return {
                valid:false,
                message:
                    `Harga kontrak pada baris ${i + 1} belum diisi.`
            };

        }


        if(
            harga <= 0
        ){

            return {
                valid:false,
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
                valid:false,
                message:
                    `BB Avg ${key} ditemukan lebih dari satu kali.`
            };

        }


        bbAvgSet.add(key);

    }


    return {
        valid:true,
        message:"Data kontrak siap disimpan."
    };

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

            MENYIAPKAN...

        `;

    }


    try{

        /*
         * Coba kirim ke GAS sejak sekarang.
         * Jika action GAS belum tersedia,
         * data tetap aman di sesi UI dan
         * alur lama tetap berjalan.
         */

        const result =
            await kirimMasterKontrakKeGAS();


        if(
            result &&
            result.success === true
        ){

            tampilPesanMasterKontrak(
                result.message ||
                "Data kontrak berhasil disimpan.",
                "success"
            );

            return;

        }


        console.info(
            "GAS saveMasterKontrak belum aktif:",
            result?.message ||
            "Action belum tersedia."
        );


        tampilPesanMasterKontrak(
            "Data kontrak sudah siap. Koneksi spreadsheet akan aktif saat action GAS tersedia.",
            "info"
        );

    }
    catch(error){

        console.warn(
            "MASTER KONTRAK GAS:",
            error
        );

        tampilPesanMasterKontrak(
            "Data kontrak sudah siap. Koneksi spreadsheet akan aktif saat GAS tersedia.",
            "info"
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
// SIAPKAN DATA MASTER KONTRAK UNTUK GAS
// ==========================================================
// Action GAS: saveMasterKontrak
// ==========================================================

async function kirimMasterKontrakKeGAS(){

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
            success:false,
            message:
                "Belum ada data kontrak."
        };

    }


    /*
     * apiPost menggunakan URLSearchParams.
     * Karena itu array dikirim sebagai JSON string
     * agar GAS menerima seluruh baris dengan utuh.
     */

    return await apiPost(
        "saveMasterKontrak",
        {
            items:
                JSON.stringify(items)
        }
    );

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