document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/search-history')
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Error fetching search history:', error));
});
