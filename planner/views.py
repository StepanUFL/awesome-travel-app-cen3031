import json
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import Route


# View for the index page
def index(request: HttpRequest):
    return render(request, "index.html", {})


# URL: /location/{id}
# View that responds to GET requests for information about a location
#
# GET: Returns a JSON object containing information about the location
def location(request: HttpRequest, id):
    return JsonResponse({"nope": "nope"})


# URL: /route/{id}
# View that updates routes or returns route info
#
# GET: Returns a JSON object with the route with the given ID
#
# POST: Updates the route with the given ID, or creates a new one
# Body should be JSON data with a list named "location_ids"
def route(request: HttpRequest, id: int):
    if request.method == "POST":
        location_ids_json = json.loads(request.body)
        new_route = Route(location_ids=location_ids_json)
        new_route.pk = id
        new_route.save()
        return HttpResponseRedirect(reverse("index"))

    elif request.method == "GET":
        return JsonResponse(Route.objects.get(pk=id).location_ids)
        # return JsonResponse(routes[id], safe=False)
