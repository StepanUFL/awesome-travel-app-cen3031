let map;
let service;
let infowindow;
let selectedPlaceId = null;
let selectedPlaceName = null;

console.log("script.js loaded");
window.initMap = function() {
    console.log("initMap called");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 29.6516, lng: -82.3248 },
        zoom: 14,
    });

    service = new google.maps.places.PlacesService(map);
    infowindow = new google.maps.InfoWindow();

    service.nearbySearch(
        { location: { lat: 29.6516, lng: -82.3248 }, radius: 2000, type: "tourist_attraction" },
        displayPlaces
    );

    document.getElementById("add-to-list-btn").addEventListener("click", () => {
        if (selectedPlaceId) {
            currentIDs.push(selectedPlaceId);
            renderList();
            alert(`${selectedPlaceName} added to list`);
        }

    });

}

function displayPlaces(results, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) return;

    results.forEach(place =>
        {
            if (!place.geometry || !place.geometry.location) return;

            const marker = new google.maps.Marker({
                map,
                position: place.geometry.location,
                title: place.name,
            });

            marker.addListener("click", () =>
                {
                    /*
                    infowindow.setContent(`
                        <div>
                            <strong>${place.name}</strong><br>
                            <button onclick="addPlaceToList('${place.place_id}', '${place.name}', this)">
                                Add to List
                            </button>
                        </div>
                    `);
                    infowindow.open(map, marker);
                    */
                    getPlaceDetails(place.place_id);
                }
            );
        }
    );
}

function getPlaceDetails(placeId) {
    const request = {
        placeId,
        fields: ["name", "formatted_address", "photos", "rating", "place_id", "geometry"]
    };

    service.getDetails(request, (place, status) =>
        {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                selectedPlaceId = place.place_id;
                selectedPlaceName = place.name;

                console.log("Place details: ", place);

                document.getElementById("place-name").textContent = place.name;
                document.getElementById("place-address").textContent = place.formatted_address;
                document.getElementById("place-rating").textContent = place.rating;
                document.getElementById("add-to-list-btn").disabled = false;

                const photoDiv = document.getElementById("place-photo");
                if (place.photos && place.photos.length > 0) {
                    const photoUrl = place.photos[0].getUrl({ maxWidth: 400 });
                    photoDiv.innerHTML = `<img src="${photoUrl}" alt="${place.name}" style="width:100%; border-radius:8px;">`;

                }
                else {
                    photoDiv.innerHTML = `<p>No photo available</p>`;
                }

                /*
                infowindow.setContent(`<div><strong>${place.name}</strong><br>${place.formatted_address}</div>`);
                infowindow.setPosition(place.geometry.location);
                infowindow.open(map);
                */
            }

        }
    );
}

function addPlaceToList(placeId, placeName, btn) {
    if (!currentIDs.includes(placeId)) {
        currentIDs.push(placeId);
        btn.textContent = "Saved";
        btn.disabled = true;
        renderList();
    }
    console.log("Current IDs:", currentIDs);
}

// Dummy data that mimics an accessible list of many locations
// TO-DO Make a function to call the Place API to get location data based on ID
locations = [
    { id: "abc1", name: "Place1" },
    { id: "abc2", name: "Place2" },
    { id: "abc3", name: "Place3" },
    { id: "abc4", name: "Place4" }
];

currentIDs = [];
saved = [];

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

//url pathing is gonna be weird, maybe make a route encoding system?
const fetchRoute = '/route/' + 12345678 + '/';

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

function getLocations() {
    return currentIDs
        .map(id => locations.find(loc => loc.id === id))
        .filter(Boolean)
        .map(loc => loc.name);
}

function renderList() {
    document.getElementById("test").innerHTML = currentIDs;
    document.getElementById("test2").innerHTML = getLocations();
    document.getElementById("location_ids").value = currentIDs;
}

function newList() {
    document.getElementById("test").innerHTML = "List is currently empty";
    document.getElementById("test2").innerHTML = "List is currently empty";
    currentIDs = [];
}

function addToList(loc) {
    place = document.getElementById(loc).id;
    currentIDs.push(place);
    renderList();
}

function saveList(userid) {
    saved = currentIDs;
    // send an HTTP request here?
}

function returnList() {
    currentIDs = saved;
    renderList();
    return currentIDs;
}

// UNUSED AS OF NOW
// This overwrites the form's action attribute with the correct URL depending on the ID of the route.
function setRouteFormAction() {
  routeId = "123abc";
  document.getElementById("route-form").action = "/route/" + routeId + "/";
}