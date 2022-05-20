/* SETTINGS ********************************************************/
const apiKey = '88b944ca4dbc06132a8237b582984434';
const daysForcast = 5;



/* INIT ********************************************************/

function init() {
    document.querySelector('nav > button').addEventListener('click', handleSearch);
    getSavedCities();
}
init();



/* EVENT HANDLERS ********************************************************/

async function handleSearch () {
    // take user input and remove extra whitespace
    const city = document.querySelector('nav input').value.trim();

    // ends function if no input
    if (!city) return;

    const {name, lat, lon} = await getLatLon(city);
    const data = await getWeather(lat, lon);
    displayWeather(name, data);

    saveCity(name, lat, lon);
}

async function handleSavedSearch(e) {
    const button = e.target;
    const name = button.textContent;
    const {lat, lon} = button.dataset;

    const data = await getWeather(lat, lon);
    displayWeather(name, data);
}



/* API CALLS ********************************************************/

// converting city name to lat/lon
async function getLatLon (city) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const name = data[0].name;
    const lat = data[0].lat;
    const lon = data[0].lon;
    // returning an object using literals
    return {name, lat, lon};
}

// get weather using latitude and longitude
async function getWeather (lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}



/* DOM RENDERING ********************************************************/

// display weather
function displayWeather (name, data) {
    const icon = data.current.weather[0].icon;
    const temp = data.current.temp;
    const humidity = data.current.humidity;
    const windSpeed = data.current.wind_speed;
    const uvIndex = data.current.uvi;

    let uvScale;
    // update uvScale
    if (uvIndex < 3) uvScale = 'low';
    else if (uvIndex < 6) uvScale = 'moderate';
    else if (uvIndex < 8) uvScale = 'high';
    else if (uvIndex < 11) uvScale = 'veryhigh';
    else uvScale = 'extreme';

    // current weather & forcast
    let html = `
        <div>
            <h2>${name} <img src='https://openweathermap.org/img/wn/${icon}@2x.png'></h2>
            <p>Temp: ${temp}&deg;F</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed}mph</p>
            <p>UV Index: <span class='${uvScale}'>${uvIndex}</span></p>
        </div>
        <ul>
    `;

    for (let i = 1; i <= daysForcast; i++) {
        const day = data.daily[i];
        const date = new Date(day.dt * 1000);
        const temp = day.temp.day;
        const humidity = day.humidity;
        const windSpeed = day.wind_speed;
        const icon = day.weather[0].icon;
        html += `
            <li>
                <h3>${date.toLocaleDateString()} <img src='https://openweathermap.org/img/wn/${icon}.png'/></h3>
                <p>Temp: ${temp}&deg;F</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed}mph</p>
            </li>
        `;
    }
    
    html += '</ul>';
    document.querySelector('section').innerHTML = html;
}

function getSavedCities() {
    const cities = getCityData();
    const btnPlaceholder = document.querySelector('nav div');
    let html = '';

    for (let {name, lat, lon} of cities) {
        html += `<button data-lat='${lat}' data-lon='${lon}'>${name}</button>`;
    }

    btnPlaceholder.innerHTML = html;
    for (let button of btnPlaceholder.querySelectorAll('button')) {
        button.addEventListener('click', handleSavedSearch);
    }
}



/* DATA ********************************************************/

function saveCity(name, lat, lon) {
    const cities = getCityData();

    // make sure not already added to local
    // if we do not find that city then argument is true, add it
    if (!cities.find(c => c.name === name)) {
        cities.push({name, lat, lon});

        // turn obj back into string then write to local storage
        localStorage.setItem('cities', JSON.stringify(cities));
        getSavedCities();
    }
}

function getCityData() {
    let cities = localStorage.getItem('cities');

    if (cities) {
        // into an array of objects
        cities = JSON.parse(cities);
    } else {
        // nothing in local storage
        cities = [];
    }

    return cities;
}