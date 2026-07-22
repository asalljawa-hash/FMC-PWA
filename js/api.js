// ==========================================
// FMC BROILER MOBILE V8
// API.JS
// ==========================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzQV6bliXd_BlxOJgtXdacoHhtdbgWfHUV-vhW3DZSyaTWBSTdNuum5UG3YyWqGwUJh/exec?api=data";


// Cache data
let serverData = null;

// Versi data terakhir
let lastDataVersion =
localStorage.getItem("FMC_DATA_VERSION") || "";


async function ambilDataServer(force = false){

    // Gunakan cache jika sudah ada
    if(serverData && !force){
        return serverData;
    }

    console.log("STEP API");

    try{

const response = await fetch(
    API_URL + "&t=" + Date.now(),
    {
        cache:"no-store"
    }
);


if(!response.ok){

throw new Error("HTTP " + response.status);

}


const data = await response.json();

console.log("DATA SERVER:", data);


serverData = data;


// cek versi data

if(data.system && data.system.dataVersion){

    if(lastDataVersion === ""){

        lastDataVersion = data.system.dataVersion;

        localStorage.setItem(
            "FMC_DATA_VERSION",
            lastDataVersion
        );

    }

    else if(lastDataVersion !== data.system.dataVersion){

        lastDataVersion = data.system.dataVersion;

        localStorage.setItem(
            "FMC_DATA_VERSION",
            lastDataVersion
        );


        if(typeof showUpdateToast === "function"){

            showUpdateToast(
            "Data harian peternakan telah diperbarui"
            );

        }

    }

}


if(typeof statusServer === "function"){
    statusServer(true);
}



if(data.dashboard && data.dashboard.farm){

const farm = data.dashboard.farm;


const el=document.getElementById("farmNama");


if(el){

el.innerHTML=farm.namaFarm;

}

}


return data;



}catch(err){


console.error("API ERROR:",err);


if(typeof statusServer === "function"){

statusServer(false);

}


return null;


}

}



async function refreshData(){

return await ambilDataServer();

}