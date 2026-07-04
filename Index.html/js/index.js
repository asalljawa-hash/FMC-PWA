/*

const dashboard = [
  { judul:"🐣 DOC IN", nilai:"39.000" },
  { judul:"🐔 Ayam Hidup", nilai:"38.872" },
  ...
];

*/

const flok = [
  { nama:"FLOK A", hidup:"12.958", mort:"0,32%", bb:"0,070", fcr:"0,83", ip:"421,93" },
  { nama:"FLOK B", hidup:"12.956", mort:"0,34%", bb:"0,070", fcr:"0,83", ip:"421,80" },
  { nama:"FLOK C", hidup:"12.956", mort:"0,32%", bb:"0,070", fcr:"0,83", ip:"421,93" },
  { nama:"FLOK D", hidup:"0", mort:"-", bb:"-", fcr:"-", ip:"-" }
];

function tampilDashboard(){

let html="";

dashboard.forEach(item=>{

html+=`
<div class="card">
<div class="cardTitle">${item.judul}</div>
<div class="cardValue">${item.nilai}</div>
</div>
`;

});

document.getElementById("dashboardPage").innerHTML=html;

}

function tampilFlok(){

let html="";

flok.forEach(item=>{

html+=`
<div class="card">
<h3>${item.nama}</h3>

<p>🐔 Hidup : ${item.hidup}</p>
<p>📉 Mortalitas : ${item.mort}</p>
<p>⚖️ BB : ${item.bb}</p>
<p>🌽 FCR : ${item.fcr}</p>
<p>🎯 IP : ${item.ip}</p>

</div>
`;

});

document.getElementById("flokPage").innerHTML=html;

}

function aktifkanMenu(id){

document.querySelectorAll(".bottomNav button").forEach(btn=>{
btn.classList.remove("active");
});

document.getElementById(id).classList.add("active");

}

function showPage(page){

document.getElementById("dashboardPage").style.display="none";
document.getElementById("flokPage").style.display="none";
document.getElementById("keuanganPage").style.display="none";
document.getElementById("harianPage").style.display="none";
document.getElementById("aiPage").style.display="none";

document.getElementById(page+"Page").style.display="block";

switch(page){

case "dashboard":
aktifkanMenu("btnDashboard");
break;

case "flok":
aktifkanMenu("btnFlok");
break;

case "keuangan":
aktifkanMenu("btnKeuangan");
break;

case "harian":
aktifkanMenu("btnHarian");
break;

case "ai":
aktifkanMenu("btnAI");
break;

}

}

window.onload=function(){

tampilDashboard();

tampilFlok();

tampilKeuangan();

tampilHarian();

showPage("dashboard");

setTimeout(function(){

document.getElementById("splash").classList.add("hide");

},2000);

};