let map;
let service;
let infowindow;
let selectedPlaceId = null;
let selectedPlaceName = null;
let idToName = Object.create(null);
window.markers = [];

console.log("script.js loaded");
window.initMap = function() {
    console.log("initMap called");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 29.6516, lng: -82.3248 },
        zoom: 14,
    });

    map.addListener("click", (event) => {
    // Check if the clicked object is a POI
    if (event.placeId) {
        // Prevent the default InfoWindow from showing

        console.log("POI clicked with Place ID:", event.placeId);
        event.stop();

        // Fetch place details using the placeId
        const request = {
            placeId: event.placeId,
            fields: ["name", "formatted_address", "photos", "rating", "geometry", "types"],
        };

        service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Update the page with the place details
                selectedPlaceId = event.placeId;
                updatePlaceDetails(place);
            }
        });
    }
    });

    initSearchBar(map);

    service = new google.maps.places.PlacesService(map);
    infowindow = new google.maps.InfoWindow();

/*
    service.nearbySearch(
        { location: { lat: 29.6516, lng: -82.3248 }, radius: 2000, type: "tourist_attraction" },
        displayPlaces
    );
*/
    document.getElementById("add-to-list-btn").addEventListener("click", () => {
    if (selectedPlaceId) {
        idToName[selectedPlaceId] = selectedPlaceName || selectedPlaceId;
        if (!currentIDs.includes(selectedPlaceId)) currentIDs.push(selectedPlaceId);
        renderList();
  }
});

}

const optimizeUrl = "/optimize-route/";

function optimizeCurrentRoute() {
  if (currentIDs.length < 2) {
    document.getElementById("optimal-route").innerText = "Add at least two places to optimize.";
    return;
  }
  fetch(optimizeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ place_ids: currentIDs }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) { alert(data.error); return; }
      document.getElementById("optimal-route").innerText =
        `${data.route_names.join(" -> ")} (total: ${Math.round(data.distance_meters / 1000)} km)`;
      currentIDs = data.route_ids;  // reflect optimized order
      renderList();
    })
    .catch((err) => { console.error(err); alert("Failed to optimize route"); });
}

// Hook the “Calculate shortest route!” button to the optimizer
document.getElementById("saveListButton").addEventListener("click", optimizeCurrentRoute);



function initSearchBar(map) {
  const input = document.getElementById("search-bar");
  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["place_id", "name", "geometry", "formatted_address", "photos", "rating", "types"],
  });
  autocomplete.bindTo("bounds", map);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      performTextSearch(input.value, map);
      return;
    }

    // Set the current selection from Autocomplete
    if (place.place_id) {
      selectedPlaceId = place.place_id;
      selectedPlaceName = place.name || place.place_id;
    }

    map.setCenter(place.geometry.location);
    map.setZoom(15);

    new google.maps.Marker({
      map,
      position: place.geometry.location,
      title: place.name,
    });

    updatePlaceDetails(place);
  });
}

// Perform a text search for vague queries
function performTextSearch(query, map) {
    const service = new google.maps.places.PlacesService(map);

    service.textSearch({ query, bounds: map.getBounds() }, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            alert("No results found for the search query.");
            return;
        }

        // Clear existing markers
        clearMarkers();

        // Add markers for each result
        results.forEach(place => {
            if (!place.geometry || !place.geometry.location) return;

            const marker = addMarker(map, place.geometry.location, place.name);

            marker.addListener("click", () => {
                // Update the page with the place details
                selectedPlaceId = place.place_id;
                updatePlaceDetails(place);
            });
        });

        // Center the map on the first result
        map.setCenter(results[0].geometry.location);
        map.setZoom(13);
    });
}

// Add a marker and store it in the global array
function addMarker(map, position, title) {
    const marker = new google.maps.Marker({
        map,
        position,
        title,
    });
    window.markers.push(marker); // Add the marker to the global array
    return marker;
}

// Clear existing markers from the map
function clearMarkers() {
    window.markers.forEach(marker => marker.setMap(null)); // Remove each marker from the map
    window.markers = []; // Reset the markers array
}

// bug with the search bar replacing previous locations?
function updatePlaceDetails(place) {
  console.log("Updating place details for:", place);

  // always set selection, was a bug with mixing clicks and searches
  if (place.place_id) {
    selectedPlaceId = place.place_id;
  }
  selectedPlaceName = place.name || selectedPlaceId;

  document.getElementById("place-name").textContent = place.name || "N/A";
  document.getElementById("place-address").textContent = place.formatted_address || "N/A";
  document.getElementById("place-rating").textContent = place.rating ? `Rating: ${place.rating} / 5 Stars` : "No rating available";

  const photoDiv = document.getElementById("place-photo");
  if (place.photos && place.photos.length > 0) {
    const photoUrl = place.photos[0].getUrl({ maxWidth: 400 });
    photoDiv.innerHTML = `<img src="${photoUrl}" alt="${place.name}" style="width:100%; border-radius:8px;">`;
  } else {
    photoDiv.innerHTML = `<p>No photo available</p>`;
  }

  const googleMapsLink = place.place_id ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}` : null;
  document.getElementById("place-address").innerHTML += googleMapsLink
    ? `<br><a href="${googleMapsLink}" target="_blank" style="color:blue; text-decoration:underline;">View on Google Maps</a>`
    : "";

  const summary = place.types ? `Tags: ${place.types.join(", ").replace(/_/g, " ")}` : "No tags associated";
  document.getElementById("place-summary").textContent = summary;

  document.getElementById("add-to-list-btn").disabled = false;
}


function getPlaceDetails(placeId) {
    console.log("Fetching details for Place ID:", placeId);
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


                infowindow.setContent(`<div><strong>${place.name}</strong><br>${place.formatted_address}</div>`);
                infowindow.setPosition(place.geometry.location);
                infowindow.open(map);

            }

        }
    );
}

function addPlaceToList(placeId, placeName, btn) {
  if (!currentIDs.includes(placeId)) {
    idToName[placeId] = placeName || placeId;
    currentIDs.push(placeId);
    btn.textContent = "Saved";
    btn.disabled = true;
    renderList();
  }
  console.log("Current IDs:", currentIDs);
  selectedPlaceId = null;
  selectedPlaceName = null;
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

        }
    );
}



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
// Update: ID is no longer needed to create a route
const fetchRoute = '/route/';

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
  const container = document.getElementById("test");
  container.innerHTML = "";
  currentIDs.forEach(id => {
    const div = document.createElement("div");
    div.className = "route-id";
    div.textContent = idToName[id] || id;  // show human name if we have it
    container.appendChild(div);
  });
  document.getElementById("location_ids").value = currentIDs.join(",");
}

function addToList(loc) {
  const el = document.getElementById(loc);
  const placeId = el.id;
  const name = el.value || placeId;
  idToName[placeId] = name;
  if (!currentIDs.includes(placeId)) currentIDs.push(placeId);
  renderList();
}

function saveList(userid) {
  saved = currentIDs.slice();  // decouple from currentIDs
  console.log("Saved list:", saved);
}

// ended up removing the button, remove this function later?
function returnList() {
  currentIDs = saved;
  renderList();
  optimizeCurrentRoute();
  return currentIDs;
}

// clear wasn't working before, need to compltely reset variables
function newList() {
  document.getElementById("test").textContent = "List is currently empty";
  document.getElementById("optimal-route").textContent = "";
  document.getElementById("location_ids").value = "";

  currentIDs.length = 0;              
  saved.length = 0;                  
  idToName = Object.create(null);    
  selectedPlaceId = null;
  selectedPlaceName = null;

  console.log("Cleared. currentIDs:", currentIDs, "saved:", saved);
}

// UNUSED AS OF NOW
// This overwrites the form's action attribute with the correct URL depending on the ID of the route.
function setRouteFormAction() {
  routeId = "123abc";
  document.getElementById("route-form").action = "/route/" + routeId + "/";
}