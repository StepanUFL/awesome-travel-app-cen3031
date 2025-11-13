// Helper to read Django's CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

const fetchRoute = '/route/' + 12345678 + '/';

/*

// Functionality of "Send List to Backend" button
// TO-DO Tidy up file pathing and variable types between files
document.getElementById('saveListButton').addEventListener('click', function() {
    fetch(fetchRoute, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ location_ids: currentIDs }),
    })
    //.then(response => response.json())
    .then(data => {
        console.log('Server responded:', data);
        alert('Order saved successfully');
    })
    .catch(error => {
        console.error('Error', error);
        alert('Error');
    });
});

*/

document.getElementById('login').addEventListener('click', function() {
    alert("Log in request goes here");

});

document.getElementById('signin').addEventListener('click', function() {
    alert("Sign in request goes here");

});