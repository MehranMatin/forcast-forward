const apiKey = '88b944ca4dbc06132a8237b582984434';

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