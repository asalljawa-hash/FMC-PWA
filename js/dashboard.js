// ==========================================
// FMC BOILER MOBILE V11
// DASHBOARD.JS
// ==========================================

async function tampilDashboard(){

console.log("STEP DASHBOARD");  

const data = await ambilDataServer();  

if(!data){  

    document.getElementById("dashboardPage").innerHTML=`  

    <div class="card">  

        <h2>  

            <span class="material-symbols-rounded">  

            cloud_off  

            </span>  

            Server Offline  

        </h2>  

        <p>Tidak dapat mengambil data dari Google Sheet.</p>  

    </div>  

    `;  

    return;  

}  

const farm=data.dashboard.farm;  
const kpi=data.dashboard.kpi;  
const flok=data.dashboard.flok || [];  
const ai=data.ai || [];  

let html=`

<div class="dashboardHero">  <div>  

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

<div class="heroLogo">  

    <span class="material-symbols-rounded">  

        dashboard  

    </span>  

</div>

</div>  <div class="card farmCard">  <div class="farmHeader">  <div>  <h2>  <span class="material-symbols-rounded">  home

</span>  ${farm.namaFarm}

</h2>  <small>  Periode ${farm.periode}

</small>  </div>  <div class="onlineBadge">  <span class="material-symbols-rounded">  wifi

</span>  ONLINE

</div>  </div>  <div class="farmInfo">  Chick In :

<b>${farm.chickIn}</b>

</div>  </div>  <h3>KPI</h3>  <div class="gridCard">  ${kpiCard("🐣","DOC",kpi.docIn)}

${kpiCard("🐔","Ayam Hidup",kpi.ayamHidup)}

${kpiCard("💀","Mati",kpi.mati)}

${kpiCard("block","Afkir",kpi.afkir)}

${kpiCard("🫀","Mortalitas",kpi.mortalitas)}

${kpiCard("pie_chart","Deplesi",kpi.deplesi)}

${kpiCard("🍗","FCR",kpi.fcr)}

${kpiCard("🏆","IP",kpi.ip)}

</div>  <h3>Ringkasan Flok</h3>  <div class="gridCard">  
`;  flok.forEach(f=>{  

    html+=`

<div class="card">  <h3>  Flok ${f.nama}

</h3>  <div style="display:grid;  
grid-template-columns:1fr 1fr;  
gap:12px;  
margin-top:15px;">  <div>  <span class="material-symbols-rounded"  
style="color:var(--primary);">

🐔

</span>  <br>  <b>${f.hidup}</b>

<div class="cardTitle">  Ayam Hidup

</div>  </div>  <div>  <span class="material-symbols-rounded"  
style="color:#E53935;">

warning

</span>  <br>  <b>${f.mortalitas}</b>

<div class="cardTitle">  Mortalitas

</div>  </div>  <div>  <div style="font-size:24px">  🍗

</div>  <b>${f.fcr}</b>

<div class="cardTitle">  FCR

</div>  </div>  <div>  <span class="material-symbols-rounded"  
style="color:#1976D2;">

🏆

</span>  <br>  <b>${f.ip}</b>

<div class="cardTitle">  IP

</div>  </div>  </div>  <hr style="margin:16px 0;border:none;border-top:1px solid #eee;">  <div class="cardTitle">  STATUS

</div>  <b>  ${f.status}

</b>  <div style="margin-top:6px;color:#888;font-size:12px;">  Keterangan :
Data belum lengkap

</div>  </div>  `;

});  

html+=`

</div>  <div class="card">  <h2>  <span class="material-symbols-rounded">  smart_toy

</span>  AI Insight

</h2>  `;

if(ai.length>0){  

    ai.forEach(item=>{  

        html+=`

<p style="display:flex;  
align-items:center;  
gap:8px;">  <span class="material-symbols-rounded"  
style="color:#22C55E;">

check_circle

</span>  ${item}

</p>  `;

});  

}else{  

    html+=`

<p>  Belum ada insight.

</p>  `;

}  

html+=`

</div>  <center  
style="margin:20px;color:#777;">  Update terakhir :

${new Date().toLocaleString("id-ID")}

</center>  `;

document.getElementById("dashboardPage").innerHTML=html;

}

// ==========================================

function kpiCard(icon,judul,nilai){

const iconHtml=icon.length<=2  

    ? icon  

    : `<span class="material-symbols-rounded">${icon}</span>`;  

return`

<div class="card">  <div class="kpiIcon">  ${iconHtml}

</div>  <h4>  ${judul}

</h4>  <b>  ${nilai}

</b>  </div>  `;

}