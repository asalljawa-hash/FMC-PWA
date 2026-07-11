// ==========================================
// FMC WEATHER V11
// ==========================================

function weatherText(code){

    if(code===0) return "☀️ Cerah";
    if(code<=3) return "⛅ Berawan";
    if(code<=48) return "🌫 Berkabut";
    if(code<=67) return "🌧 Hujan";
    if(code<=77) return "❄ Dingin";
    if(code<=82) return "🌦 Hujan";
    if(code<=99) return "⛈ Badai";

    return "Tidak diketahui";

}

async function loadWeather(){

    const temp=document.getElementById("weatherTemp");
    const desc=document.getElementById("weatherDesc");
    const hum=document.getElementById("weatherHumidity");
    const wind=document.getElementById("weatherWind");
    const loc=document.getElementById("weatherLocation");

    temp.textContent="--°C";
    desc.textContent="Memuat cuaca...";
    hum.textContent="💧 --%";
    wind.textContent="🌬️ -- km/j";
    loc.textContent="📍 Mengambil lokasi...";

    if(!navigator.geolocation){

        desc.textContent="GPS tidak didukung";
        loc.textContent="📍 Lokasi tidak tersedia";
        return;

    }

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            try{

                const lat=position.coords.latitude;
                const lon=position.coords.longitude;

                const weatherURL=
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

                const weatherRes=await fetch(weatherURL);

                if(!weatherRes.ok){
                    throw new Error("Weather API gagal");
                }

                const weather=await weatherRes.json();

                temp.textContent=
                weather.current.temperature_2m+"°C";

                hum.textContent=
                "💧 "+weather.current.relative_humidity_2m+"%";

                wind.textContent=
                "🌬️ "+weather.current.wind_speed_10m+" km/j";

                desc.textContent=
                weatherText(weather.current.weather_code);

                try{

                    const geoURL=
`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;

                    const geoRes=await fetch(geoURL);

                    if(geoRes.ok){

                        const geo=await geoRes.json();

                        loc.textContent=
                        "📍 "+(geo.display_name || "Lokasi tidak diketahui");

                    }else{

                        loc.textContent=
                        "📍 Lokasi tidak diketahui";

                    }

                }catch{

                    loc.textContent=
                    "📍 Lokasi tidak diketahui";

                }

            }catch(error){

                console.error(error);

                temp.textContent="--°C";
                desc.textContent="Gagal mengambil data cuaca";
                hum.textContent="💧 --%";
                wind.textContent="🌬️ -- km/j";
                loc.textContent="📍 Periksa koneksi internet";

            }

        },

        (error)=>{

            console.error(error);

            temp.textContent="--°C";
            desc.textContent="Izin lokasi diperlukan";
            hum.textContent="💧 --%";
            wind.textContent="🌬️ -- km/j";
            loc.textContent="📍 Aktifkan GPS & izin lokasi";

        },

        {

            enableHighAccuracy:true,
            timeout:10000,
            maximumAge:300000

        }

    );

}

window.addEventListener("load",loadWeather);