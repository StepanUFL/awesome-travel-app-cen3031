from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

users = {}

locations = {
    "america": {
        "display_name": "America",
    },
    "brazil": {
        "display_name": "Brazil",
    },
}

routes = {}


# View for the index page
def index(request: HttpRequest):
    return render(request, "index.html", {})


# View that responds to GET requests for information about a location
# URL: /location/
# URL Parameters:
#   id: The ID of the location
def location_info(request: HttpRequest):
    location_id = request.GET["id"]
    return JsonResponse(locations[location_id])


# View that responds to POST requests to create a new route
# URL: /new-route/
# Payload Parameters:
#   route_id: The ID that the route should be created under
#   locations_ids: A comma-separated list of location IDs
def new_route(request: HttpRequest):
    route_id = request.POST["route_id"]

    location_ids = request.POST["location_ids"].split(sep=",")
    route = []
    for id in location_ids:
        route.append(id)

    routes[route_id] = route

    return HttpResponseRedirect(reverse("index"))


# View that responds to GET requests for information about a route
# URL: /route/
# URL Parameters:
#   id: The ID of the route
def route_info(request: HttpRequest):
    route_id = request.GET["id"]
    return JsonResponse(routes[route_id])
