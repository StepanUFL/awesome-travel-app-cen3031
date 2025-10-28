    // Dummy data that mimics an accessible list of many locations
    // TO-DO Make a function to call the Place API to get location data based on ID
    locations = [
        { id: "abc1", name: "Place1" },
        { id: "abc2", name: "Place2" },
        { id: "abc3", name: "Place3" },
        { id: "abc4", name: "Place4" }
    ];

    currentIDs = ["abc1", "abc2", "abc3"];
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
        .then(response => response.json())
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