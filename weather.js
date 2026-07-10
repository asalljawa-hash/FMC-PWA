// ==========================================
// FMC WEATHER V10
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

    if(!navigator.geolocation){

        document.getElementById("weatherDesc").textContent =
        "GPS tidak didukung";

        return;

    }

    navigator.geolocation.getCurrentPosition(async(position)=>{

        const lat=position.coords.latitude;
        const lon=position.coords.longitude;

        // Cuaca
        const weatherURL=
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

        const weatherRes=await fetch(weatherURL);
        const weather=await weatherRes.json();

        document.getElementById("weatherTemp").textContent=
        weather.current.temperature_2m+"°C";

        document.getElementById("weatherHumidity").textContent=
        "💧 "+weather.current.relative_humidity_2m+"%";

        document.getElementById("weatherWind").textContent=
        "🌬️ "+weather.current.wind_speed_10m+" km/j";

        document.getElementById("weatherDesc").textContent=
        weatherText(weather.current.weather_code);

        // Nama lokasi
        try{

            const geoURL=
`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;

            const geoRes=await fetch(geoURL);
            const geo=await geoRes.json();

            document.getElementById("weatherLocation").textContent=
            "📍 "+geo.display_name;

        }catch{

            document.getElementById("weatherLocation").textContent=
            "📍 Lokasi tidak diketahui";

        }

    });

}

window.addEventListener("load",loadWeather);