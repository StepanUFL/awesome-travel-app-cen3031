
    locations = ["Place1", "Place2", "Place3"];
    saved = [];

    function loadList() {

        document.getElementById("test").innerHTML = locations;
    }

    function newList() {
        document.getElementById("test").innerHTML = "List is currently empty";
        locations = [];
    }

    function addToList(loc) {
        place = document.getElementById(loc).value;
        locations.push(place);
        loadList();
    }

    function saveList(userid) {
        saved = locations;
        // send an HTTP request here?
    }

    function returnList() {
        document.getElementById("test").innerHTML = saved;
        locations = saved;
        console.log(locations);
        return locations;
    }