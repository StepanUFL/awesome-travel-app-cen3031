import json

from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import Route


# View for the index page
def index(request: HttpRequest):
    if request.method == "GET":
        return render(request, "index.html", {})


# URL: /route/{id}
# View that updates routes or returns route info
#
# GET: Returns a JSON object with the route with the given ID
#
# POST: Updates the route with the given ID
# Body should be JSON data with a list named "location_ids"
def route_id(request: HttpRequest, id: int):
    if request.method == "POST":
        route: Route = Route.objects.get(pk=id)
        request_body = json.loads(request.body)
        route.location_ids = request_body["location_ids"]
        route.save()
        return HttpResponseRedirect(reverse("index"))

    elif request.method == "GET":
        return JsonResponse(Route.objects.get(pk=id).location_ids)
        # return JsonResponse(routes[id], safe=False)


# URL: /route/
# POST: Creates a new route
# Body should be JSON data with a list named "location_ids"
# Returns JSON with the field "route_id" containing the id of the route
def route(request: HttpRequest):
    if request.method == "POST":
        request_body = json.loads(request.body)
        new_route = Route(location_ids=request_body["location_ids"])
        new_route.save()
        # return HttpResponseRedirect(reverse("index"))
        return JsonResponse({"route_id": new_route.id})
