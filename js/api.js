// ==========================================
// FMC BROILER MOBILE V8
// API.JS
// ==========================================

// URL Google Apps Script
const API_URL =
"https://script.google.com/macros/s/AKfycbz-aTY1geCXwtz0MibQKVP5k0bUsLHRIlHVKItkcuqb0i_-ByZZ24n6fGGVXPsHYSff/exec?api=data";

// Cache data
let serverData = null;

async function ambilDataServer(){

    try{

        const response = await fetch(API_URL);

        });

        if(!response.ok){

            throw new Error("HTTP "+response.status);

        }

        const data = await response.json();

serverData = data;

statusServer(true);

if (data.dashboard && data.dashboard.farm) {

    const farm = data.dashboard.farm;

    const el = document.getElementById("farmNama");

    if (el) {
        el.innerHTML = "🏠 " + farm.namaFarm;
    }
}

return data;

} catch (err) {

    console.log(err);

    alert(
        "ERROR : " +
        err.name +
        "\n\n" +
        err.message
    );

    statusServer(false);

    return null;

}

}

// Refresh data
async function refreshData(){

    return await ambilDataServer();

}