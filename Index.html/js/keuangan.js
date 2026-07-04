const keuangan = [
  {
    judul: "💰 Total Biaya Operasional",
    nilai: "Rp 39.052.000"
  },
  {
    judul: "🌽 Total Konsumsi Pakan",
    nilai: "1.200 Kg"
  },
  {
    judul: "📈 Estimasi Omzet",
    nilai: "Rp 0"
  },
  {
    judul: "📉 Estimasi Laba",
    nilai: "Rp -39.052.000"
  },
  {
    judul: "🐔 Profit / Ekor",
    nilai: "-3.719"
  }
];

function tampilKeuangan() {

  let html = "";

  keuangan.forEach(item => {

    html += `
      <div class="card">
        <div class="cardTitle">${item.judul}</div>
        <div class="cardValue">${item.nilai}</div>
      </div>
    `;

  });

  document.getElementById("keuanganPage").innerHTML = html;

}