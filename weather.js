const showPosition = async (position) => {
    const lat = position.coords.latitude
    const lng = position.coords.longitude
    const place = await getPlaceName(lat, lng)
    getWeather(place)
}
  
const showError = (error) => {
    let message;
    switch(error.code) {
      case error.PERMISSION_DENIED:
        message = "Allow to access your current location or grab the location from map."
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Location information is unavailable, grab the location from map."
        break;
      case error.TIMEOUT:
        message = "The request to get user location timed out, grab the location from map."
        break;
      case error.UNKNOWN_ERROR:
        message = "An unknown error occurred, grab the location from map."
        break;
    }
    document.querySelector(".days-wrapper").innerHTML = `<h1>${message}</h1>`
  }

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
}

const getPlaceName = async (lat, lng) => {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoianN3aXRoanMiLCJhIjoiY2t2bjl2cXE3OW81MjJuczdnbTdoa2tnNyJ9.vyi3KY_FqFWSAdpuR-qTzQ`)
    const data = await response.json()

    const district = data.features.filter(item => {
        return item.id.includes("district")
    })
    const place = data.features.filter(item => {
        return item.id.includes("place")
    })
    if (district.length > 0) {
        return district[0].text
    } else if (place.length > 0) {
        return place[0].text
    } else {
        return false
    }
}

const getWeather = (place) => {
    const box = document.querySelector(".weather-wrapper");
    const wrapper = document.querySelector(".days-wrapper");
    const unitChanger = document.querySelector("#unit");
    const notFound = document.querySelector(".not-found");
    box.classList.add("hide")
    document.querySelector(".place").innerText = "";
    document.querySelector(".loading").classList.remove("hide");
        if (place) {
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=10d535d8dad64606479a529972f16544&units=metric`)
                .then(response => response.json())
                .then(data => {
                    const set = new Set()
                    const unique = data.list.filter(item => {
                    const date = item.dt_txt.slice(8,10)
                    const isDuplicate = set.has(date)
                    set.add(date)
                    if (!isDuplicate) {
                        return true
                    }
                    return false
                    })
                    document.querySelector(".loading").classList.add("hide");
                    document.querySelector(".place").innerText = place;
                    wrapper.innerHTML = "";
                    unitChanger.classList.contains("hideV") && unitChanger.classList.remove("hideV");
                    box.classList.remove("hide");
                    wrapper.classList.remove("hide");
                    notFound.classList.add("hide");
                    unique.map(item => {
                        const date = String(new Date(item.dt_txt.slice(0,10))).slice(4,15);
                        wrapper.innerHTML += `<div class="day-weather">
                        <img src="http://openweathermap.org/img/w/${item.weather[0].icon}.png" alt="Clouds">
                        <div class="date">${date}</div>
                        <div class="temp"><span class="temp-value">${item.main.temp.toFixed(2)}</span> <span class="temp-unit">°C</span></div>
                        <div class="type">${item.weather[0].main}</div>
                        </div>`
                        });
                        if (unitChanger.value === "Fahrenheit") {
                            changeUnit("Fahrenheit")
                        }
                })
                .catch (() => {
                    document.querySelector(".loading").classList.add("hide");
                    document.querySelector(".place").innerText = "";
                    box.classList.remove("hide");
                    wrapper.classList.add("hide");
                    unitChanger.classList.add("hideV");
                    notFound.classList.remove("hide");
                })
        } else {
            document.querySelector(".loading").classList.add("hide");
            document.querySelector(".place").innerText = "";
            box.classList.remove("hide");
            wrapper.classList.add("hide");
            unitChanger.classList.add("hideV");
            notFound.classList.remove("hide");
        }
        
}

const changeUnit = (unit) => {
    const days = document.querySelectorAll(".temp-value")
    const units = document.querySelectorAll(".temp-unit")
    
    if (unit === "Celsius" && units[0].innerText === "F") {
        days.forEach(item => {
            const f = parseFloat(item.innerText)
            const c = (f - 32) * 5/9
            item.innerText = c.toFixed(2)
        })
        units.forEach(unit => {
            unit.innerText = "°C"
        })
    } else if (unit === "Fahrenheit" && units[0].innerText === "°C") {
        days.forEach(item => {
            const c = parseFloat(item.innerText)
            const f = (c * 9/5) + 32
            item.innerText = f.toFixed(2)
        })
        units.forEach(unit => {
            unit.innerText = "F"
        })
    }
}

mapboxgl.accessToken = 'pk.eyJ1IjoianN3aXRoanMiLCJhIjoiY2t2bjl2cXE3OW81MjJuczdnbTdoa2tnNyJ9.vyi3KY_FqFWSAdpuR-qTzQ';
const map = new mapboxgl.Map({
        container: 'map', // container id
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [78.23539967204061, 11.458216832796865], // starting position
        zoom: 6 // starting zoom
});

map.on('click', async (e) => {
    const lat = e.lngLat.wrap().lat
    const lng = e.lngLat.wrap().lng
    const place = await getPlaceName(lat, lng)
    getWeather(place)
});