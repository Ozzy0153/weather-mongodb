document.addEventListener('DOMContentLoaded', function() {
    // Weather data event listener
    document.getElementById('weather-button').addEventListener('click', async () => {
        const cityInput = document.getElementById('cityInput').value.trim();
        if (!cityInput) return;

        document.getElementById('weather-info').classList.add('hidden');
        document.getElementById('extended-forecast-container').classList.add('hidden');

        const weatherData = await fetchWeatherData(cityInput);
        updateWeatherInfo(weatherData);

        if (weatherData && weatherData.coord) {
            const { lat, lon } = weatherData.coord;
            const extendedForecastData = await fetchExtendedForecast(lat, lon);
            updateExtendedForecast(extendedForecastData);
        }
    });

    // Air quality data event listener
    document.getElementById('air-quality-button').addEventListener('click', async () => {
        const cityName = document.getElementById('cityInput').value.trim();
        if (!cityName) return;

        const airQualityData = await fetchAirQualityData(cityName);
        updateAirQualityInfo(airQualityData);
    });

    // Moon phase data event listener
    document.getElementById('fetchMoonPhase').addEventListener('click', async () => {
        const cityName = document.getElementById('cityInput').value.trim();
        if (!cityName) {
            alert('Please enter a city name.');
            return;
        }

        const moonPhaseData = await fetchMoonPhaseData(cityName);
        if (moonPhaseData) {
            updateMoonPhaseInfo(moonPhaseData);
        } else {
            document.getElementById('moonPhaseInfo').textContent = 'Error fetching moon phase data.';
        }
    });
});

// Function to fetch weather data
async function fetchWeatherData(cityName) {
    try {
        const response = await fetch(`/api/weather/${cityName}`);
        if (!response.ok) {
            throw new Error('Weather data fetch failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to fetch extended forecast
async function fetchExtendedForecast(lat, lon) {
    try {
        const response = await fetch(`/onecall/${lat}/${lon}`);
        if (!response.ok) {
            throw new Error('Extended forecast fetch failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching extended forecast:', error);
        return null;
    }
}

// Function to fetch air quality data
async function fetchAirQualityData(cityName) {
    try {
        const response = await fetch(`/api/air-quality/${cityName}`);
        if (!response.ok) {
            throw new Error('Air quality data fetch failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        return null;
    }
}

// Function to fetch moon phase data
async function fetchMoonPhaseData(cityName) {
    try {
        const response = await fetch(`/api/moonphase/${cityName}`);
        if (!response.ok) {
            throw new Error('Moon phase data fetch failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching moon phase data:', error);
        return null;
    }
}


function getWindDirection(degrees) {
    const directions = ['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest'];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
}

function formatTime(timestamp) {
    const time = new Date(timestamp * 1000);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
let map;
function initMap(lat, lon) {
    if (map) {
        map.remove();
    }

    map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

    L.marker([lat, lon]).addTo(map);
}

function updateWeatherInfo(weatherData) {
    const weatherInfoElement = document.getElementById('weather-info');
    if (weatherData) {
        weatherInfoElement.classList.remove('hidden'); // Show the weather info
        const { temp, feels_like, humidity, pressure } = weatherData.main;
        const { description, icon } = weatherData.weather[0];
        const { speed, deg } = weatherData.wind;
        const { country } = weatherData.sys;
        const { lat, lon } = weatherData.coord;

        weatherInfoElement.innerHTML = `    
            <p>Temperature: ${temp} &deg;C</p>
            <p>Weather: ${description}</p>
            <p>Feels Like: ${feels_like} &deg;C</p>
            <p>Humidity: ${humidity}%</p>
            <p>Pressure: ${pressure} hPa</p>
            <p>Wind Speed: ${speed} m/s (${getWindDirection(deg)})</p>
            <p>Country: ${country}</p>
            <p>Weather Icon: <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"></p>
        `;

        initMap(lat, lon);
    } else {
        weatherInfoElement.innerHTML = 'Failed to fetch weather data.';
    }
}

function updateExtendedForecast(forecastData) {
    const forecastContainer = document.getElementById('extended-forecast-container');
    if (forecastData && forecastData.daily) {
        forecastContainer.classList.remove('hidden');
        forecastContainer.innerHTML = '<h2 class="forecast-heading">7-Days Extended Forecast</h2><div class="forecast-days">';
        forecastData.daily.forEach(day => {
            const date = new Date(day.dt * 1000);
            const options = { weekday: 'long' };
            const dayOfWeek = new Intl.DateTimeFormat('en-US', options).format(date);
            const windDirection = getWindDirection(day.wind_deg);
            const sunriseTime = formatTime(day.sunrise);
            const sunsetTime = formatTime(day.sunset);

            forecastContainer.innerHTML += `
                <div class="forecast-day">
                    <p class="day-of-week">${dayOfWeek}</p>
                    <p>Temp: ${day.temp.day} &deg;C</p>
                    <p>Wind: ${day.wind_speed} m/s (${windDirection})</p>
                    <p>Sunrise: ${sunriseTime}</p>
                    <p>Sunset: ${sunsetTime}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
                </div>
            `;
        });
        forecastContainer.innerHTML += '</div>';
    } else {
        forecastContainer.innerHTML = 'Failed to fetch extended forecast data.';
    }
}

document.getElementById('weather-button').addEventListener('click', async () => {
    const cityInput = document.getElementById('cityInput').value;
    if (!cityInput) return;

    document.getElementById('weather-info').classList.add('hidden');
    document.getElementById('extended-forecast-container').classList.add('hidden');

    const weatherData = await fetchWeatherData(cityInput);
    updateWeatherInfo(weatherData);

    if (weatherData && weatherData.coord) {
        const { lat, lon } = weatherData.coord;
        const extendedForecastData = await fetchExtendedForecast(lat, lon);
        updateExtendedForecast(extendedForecastData);
    }

});



