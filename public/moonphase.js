document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fetchMoonPhase').addEventListener('click', async () => {
        const cityName = document.getElementById('cityInput').value.trim();
        if (!cityName) {
            alert('Please enter a city name.');
            return;
        }

        try {
            const moonPhaseData = await fetchMoonPhaseData(cityName);
            updateMoonPhaseInfo(moonPhaseData);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('moonPhaseInfo').textContent = 'Error fetching moon phase data.';
        }
    });
});

async function fetchMoonPhaseData(cityName) {
    try {
        const response = await fetch(`/api/moonphase/${cityName}`);
        if (!response.ok) {
            throw new Error('Moon phase data fetch failed');
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching moon phase data:', error);
        return null;
    }
}


function updateMoonPhaseInfo(moonPhaseData) {
    const moonPhaseElement = document.getElementById('moonPhaseInfo');
    if (moonPhaseData && moonPhaseData.cityName) {
        const moonPhaseDetails = JSON.parse(moonPhaseData.moonPhase);

        const htmlContent = `
            <div class="card">
            <div class="card-body">
                <h3 class="moon-phase-city">${moonPhaseData.cityName}, ${moonPhaseData.country}</h3>
                <p><strong>Phase Name:</strong> ${moonPhaseDetails.phase_name || 'N/A'}</p>
                <p><strong>Stage:</strong> ${moonPhaseDetails.stage || 'N/A'}</p>
                <p><strong>Days Until Next Full Moon:</strong> ${moonPhaseDetails.days_until_next_full_moon || 'N/A'}</p>
                <p><strong>Days Until Next New Moon:</strong> ${moonPhaseDetails.days_until_next_new_moon || 'N/A'}</p>
            </div>
           </div>
        `;
        moonPhaseElement.innerHTML = htmlContent;
    } else {
        moonPhaseElement.innerHTML = '<div class="alert alert-danger" role="alert">Error fetching moon phase data or data is unavailable.</div>';
    }
}




