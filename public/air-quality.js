document.addEventListener('DOMContentLoaded', function() {
    const airQualityButton = document.getElementById('air-quality-button');
    const cityInput = document.getElementById('cityInput');

    airQualityButton.addEventListener('click', async () => {
        const cityName = cityInput.value;
        if (!cityName) return;

        const airQualityInfo = document.getElementById('air-quality-info');
        airQualityInfo.innerHTML = '';

        try {
            const response = await fetch(`/air-quality/${cityName}`);
            if (!response.ok) {
                throw new Error('Air quality data fetch failed');
            }
            const data = await response.json();
            updateAirQualityInfo(data);
        } catch (error) {
            console.error('Error fetching air quality data:', error);
            airQualityInfo.innerHTML = 'Failed to fetch air quality data.';
        }
    });
});

async function fetchAirQualityData(cityName) {
    try {
        const response = await fetch(`/air-quality/${cityName}`);
        if (!response.ok) {
            throw new Error('Air quality data fetch failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        return null;
    }
}

function updateAirQualityInfo(airQualityData) {
    const airQualityElement = document.getElementById('air-quality-info');
    if (airQualityData && airQualityData.status === "ok" && airQualityData.data) {
        const data = airQualityData.data;
        const htmlContent = `
                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title">Air Quality Index (AQI): ${data.aqi}</h3>
                        <p class="card-text">Location: ${data.city ? data.city.name : 'Unknown'}</p>
                        <p class="card-text">Dominant Pollutant: ${data.dominentpol ? data.dominentpol.toUpperCase() : 'N/A'}</p>
                        <p class="card-text">PM2.5 Value: ${data.iaqi.pm25 ? data.iaqi.pm25.v : 'N/A'} µg/m³</p>
                        <p class="card-text">PM10 Value: ${data.iaqi.pm10 ? data.iaqi.pm10.v : 'N/A'} µg/m³</p>
                        <p class="card-text">CO Value: ${data.iaqi.co ? data.iaqi.co.v : 'N/A'} mg/m³</p>
                        <p class="card-text">SO2 Value: ${data.iaqi.so2 ? data.iaqi.so2.v : 'N/A'} µg/m³</p>
                        <p class="card-text">NO2 Value: ${data.iaqi.no2 ? data.iaqi.no2.v : 'N/A'} µg/m³</p>
                    </div>
                </div>
            `;
        airQualityElement.innerHTML = htmlContent;
    } else {
        airQualityElement.innerHTML = '<div class="alert alert-danger" role="alert">Failed to fetch air quality data or data is unavailable.</div>';
    }
}

