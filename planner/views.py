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


# URL: /location/{id}
# View that responds to GET requests for information about a location
#
# GET: Returns a JSON object containing information about the location
def location(request: HttpRequest, id):
    return JsonResponse(locations[id])


# URL: /route/{id}
# View that updates routes or returns route info
#
# GET: Returns a JSON object with the route with the given ID
#
# POST: Updates the route with the given ID, or creates a new one
# Payload Parameters:
#   location_ids: A comma-separated list of location IDs (is there a better way?)
def route(request: HttpRequest, id):
    if request.method == "POST":
        routes[id] = request.POST["location_ids"].split(sep=",")
        return HttpResponseRedirect(reverse("index"))

    elif request.method == "GET":
        return JsonResponse(routes[id], safe=False)
