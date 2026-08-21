// ==========================================
// FMC BROILER MOBILE V11 FIX
// DASHBOARD.JS
// EKONOMI FLOK FIX
// BAGIAN 1
// ==========================================

async function tampilDashboard(){

    console.log("STEP DASHBOARD");

    const data = await ambilDataServer();

    if(!data){

        document.getElementById("dashboardPage").innerHTML = `

            <div class="card">

                <h2>

                    <span class="material-symbols-rounded">
                        cloud_off
                    </span>

                    Server Offline

                </h2>

                <p>
                    Tidak dapat mengambil data dari Google Sheet.
                </p>

            </div>

        `;

        return;

    }


    // ===============================
    // AMBIL DATA DASHBOARD
    // ===============================

    const dashboard =
        data.dashboard || {};

    const farm =
        dashboard.farm || {};

    const kpi =
        dashboard.kpi || {};

    /*
     * Ambil data flok mentah.
     *
     * Jangan langsung render semua data
     * karena backend bisa mengirim slot
     * FLOK A-D walaupun beberapa masih kosong.
     */

    const flokRaw =
        Array.isArray(dashboard.flok)
            ? dashboard.flok
            : [];


    /*
     * ==========================================
     * FILTER FLOK AKTIF
     * ==========================================
     *
     * FLOK hanya ditampilkan jika memang
     * mempunyai data.
     *
     * Ini mencegah FLOK kosong seperti C
     * ikut muncul sebagai:
     *
     * Ayam Hidup  : 0
     * Mortalitas  : 0
     * FCR         : 0
     * IP          : 0
     * STATUS      : BELUM
     *
     * Data bernilai 0 tetap dianggap data
     * jika ada field populasi/hidup/dll yang
     * memang terisi.
     */

    const flok =
        flokRaw.filter(function(f){

            if(!f){
                return false;
            }


            /*
             * Normalisasi nama flok.
             */

            const nama =
                String(
                    f.nama ??
                    f.flok ??
                    ""
                )
                .trim();


            /*
             * Jika nama flok tidak ada,
             * jangan tampilkan.
             */

            if(!nama){
                return false;
            }


            /*
             * Cek field data utama.
             *
             * Jangan menggunakan status sebagai
             * penentu karena flok kosong bisa saja
             * mendapat status "BELUM".
             */

            const kandidat = [

                f.populasi,
                f.docIn,
                f.chickIn,
                f.jumlah,
                f.total,
                f.hidup,
                f.ayamHidup,
                f.mati,
                f.kematian,
                f.afkir,
                f.mortalitas,
                f.fcr,
                f.ip,
                f.bb,
                f.bbAvg,
                f.pakan,
                f.pakanKg,
                f.tanggal,
                f.tglDoc,
                f.docDate

            ];


            /*
             * Ada data jika minimal satu field
             * benar-benar berisi nilai.
             */

            return kandidat.some(function(value){

                if(
                    value === null ||
                    value === undefined
                ){
                    return false;
                }


                if(
                    typeof value === "string"
                ){

                    return value.trim() !== "";

                }


                /*
                 * Angka 0 tetap merupakan nilai
                 * valid jika memang berasal dari
                 * data flok.
                 */

                if(
                    typeof value === "number"
                ){

                    return Number.isFinite(value);

                }


                return true;

            });

        });


    const ekonomiFlok =
        dashboard.ekonomiFlok || [];

    const realisasiPanen =
        dashboard.realisasiPanen || [];

    const ai =
        data.ai || [];


    let html = `

        <div class="dashboardHero">

            <div>

                <div class="heroSmall">

                    FMC BOILER MOBILE V11

                </div>

                <h1>

                    Dashboard

                </h1>

                <div class="heroDate">

                    <span class="material-symbols-rounded">

                        calendar_month

                    </span>

                    ${new Date().toLocaleDateString("id-ID",{

                        weekday:"long",

                        day:"numeric",

                        month:"long",

                        year:"numeric"

                    })}

                </div>

            </div>

            <div
                class="heroAction"
                onclick="openShareDialog(
                    shareDashboard,
                    exportDashboardPDF
                )">

                <span class="material-symbols-rounded">

                    share

                </span>

            </div>

        </div>


        <div class="card farmCard">

            <div class="farmHeader">

                <div>

                    <h2>

                        <span class="material-symbols-rounded">

                            home

                        </span>

                        ${farm.namaFarm}

                    </h2>

                    <small>

                        Periode ${farm.periode}

                    </small>

                </div>

                <div class="onlineBadge">

                    ONLINE

                </div>

            </div>

            <div class="farmInfo">

                Chick In :

                <b>${farm.chickIn}</b>

            </div>

        </div>


        <h3>

            KPI

        </h3>


        <div class="gridCard">

            ${kpiCard(
                "🐣",
                "DOC",
                kpi.docIn
            )}

            ${kpiCard(
                "🐔",
                "Ayam Hidup",
                kpi.ayamHidup
            )}

            ${kpiCard(
                "💀",
                "Mati",
                kpi.mati
            )}

            ${kpiCard(
                "block",
                "Afkir",
                kpi.afkir
            )}

            ${kpiCard(
                "📉",
                "Mortalitas",
                kpi.mortalitas
            )}

            ${kpiCard(
                "pie_chart",
                "Deplesi",
                kpi.deplesi
            )}

            ${kpiCard(
                "🍗",
                "FCR",
                kpi.fcr
            )}

            ${kpiCard(
                "emoji_events",
                "IP",
                kpi.ip
            )}

        </div>


        <h3>

            Ringkasan Flok

        </h3>


        <div class="gridCard">

`;


    // ==========================================
    // RENDER FLOK AKTIF SAJA
    // ==========================================

    flok.forEach(function(f){

        html += `

            <div class="card">

                <h3>

                    Flok ${f.nama}

                </h3>


                <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:12px;
                    margin-top:15px;
                ">


                    <div>

                        <span
                            class="material-symbols-rounded"
                            style="color:var(--primary);">

                            🐔

                        </span>

                        <br>

                        <b>

                            ${f.hidup || 0}

                        </b>

                        <div class="cardTitle">

                            Ayam Hidup

                        </div>

                    </div>


                    <div>

                        <span
                            class="material-symbols-rounded"
                            style="color:#E53935;">

                            warning

                        </span>

                        <br>

                        <b>

                            ${f.mortalitas || 0}

                        </b>

                        <div class="cardTitle">

                            Mortalitas

                        </div>

                    </div>


                    <div>

                        <span
                            class="material-symbols-rounded"
                            style="color:#8B5E3C;">

                            🍗

                        </span>

                        <br>

                        <b>

                            ${f.fcr || 0}

                        </b>

                        <div class="cardTitle">

                            FCR

                        </div>

                    </div>


                    <div>

                        <span
                            class="material-symbols-rounded"
                            style="color:#1976D2;">

                            emoji_events

                        </span>

                        <br>

                        <b>

                            ${f.ip || 0}

                        </b>

                        <div class="cardTitle">

                            IP

                        </div>

                    </div>


                </div>


                <hr style="
                    margin:16px 0;
                    border:none;
                    border-top:1px solid #eee;
                ">


                <div class="cardTitle">

                    STATUS

                </div>

                <b>

                    ${f.status || "BELUM"}

                </b>


                <div style="
                    margin-top:6px;
                    color:#888;
                    font-size:12px;
                ">

                    Keterangan :

                    Data belum lengkap

                </div>


            </div>

        `;

    });


    html += `

        </div>


        <h3>

            Ekonm Flok

        </h3>


        <div class="tableEkonomi">

            <table>

                <thead>

                    <tr>

                        <th>

                            Flok

                        </th>

                        <th>

                            Rp/Ekor

                        </th>

                        <th>

                            Pakan/Kg

                        </th>

                        <th>

                            Biaya Pakan

                        </th>

                        <th>

                            Pendapatan

                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    // ==========================================
    // EKONOMI FLOK
    // ==========================================

    html += `

        ${ekonomiFlok.map(function(f){

            return `

                <tr>

                    <td>

                        <b>
                            ${f.flok}
                        </b>

                    </td>

                    <td>

                        ${f.rpEkor || 0}

                    </td>

                    <td>

                        ${f.pakanKg || 0}

                    </td>

                    <td>

                        ${f.biayaPakan || 0}

                    </td>

                    <td>

                        ${f.pendapatan || 0}

                    </td>

                </tr>

            `;

        }).join("")}

                </tbody>

            </table>

        </div>

    `;


    // ==========================================
    // REALISASI PANEN
    // ==========================================

    html += `

        <h3 style="margin-top:25px;">

            📦 Realisasi Panen
            (${realisasiPanen.length})

        </h3>


        <div class="tableEkonomi">

            <table>

                <thead>

                    <tr>

                        <th>
                            Total Ekor
                        </th>

                        <th>
                            Tonase
                        </th>

                        <th>
                            BB
                        </th>

                        <th>
                            FCR
                        </th>

                        <th>
                            IP
                        </th>

                        <th>
                            Mati
                        </th>

                        <th>
                            Harga
                        </th>

                        <th>
                            Omset
                        </th>

                        <th>
                            Profit/Ekor
                        </th>

                        <th>
                            Profit
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${realisasiPanen.map(function(r){

                        return `

                            <tr>

                                <td>
                                    ${r.totalEkor || 0}
                                </td>

                                <td>
                                    ${r.tonase || 0}
                                </td>

                                <td>
                                    ${r.bb || 0}
                                </td>

                                <td>
                                    ${r.fcr || 0}
                                </td>

                                <td>
                                    <b>
                                        ${r.ip || "-"}
                                    </b>
                                </td>

                                <td>
                                    ${r.kematian || 0}
                                </td>

                                <td>
                                    ${r.harga || 0}
                                </td>

                                <td>
                                    ${r.omset || 0}
                                </td>

                                <td>
                                    ${r.profitEkor || 0}
                                </td>

                                <td>
                                    <b>
                                        ${r.profit || 0}
                                    </b>
                                </td>

                            </tr>

                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>

    `;


    // ==========================================
    // PENUTUP DASHBOARD
    // ==========================================

    html += `

        <center
            style="margin:20px;color:#777;">

            Update terakhir :

            ${new Date().toLocaleString("id-ID")}

        </center>

    `;


    document.getElementById(
        "dashboardPage"
    ).innerHTML = html;

}


// ==========================================
// KPI CARD
// ==========================================

function kpiCard(
    icon,
    judul,
    nilai
){

    const iconHtml =
        icon.length <= 2
            ? icon
            : `
                <span class="material-symbols-rounded">

                    ${icon}

                </span>
              `;


    return `

        <div class="card">

            <div class="kpiIcon">

                ${iconHtml}

            </div>

            <h4>

                ${judul}

            </h4>

            <b>

                ${nilai ?? 0}

            </b>

        </div>

    `;

}