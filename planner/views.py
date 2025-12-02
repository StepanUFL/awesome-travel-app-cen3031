import json
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.db import IntegrityError
from django.contrib.auth.hashers import check_password
from .models import Route, SimpleUser, UserRoute
from django.conf import settings
from .utils.distance import optimal_route
from django.db.models import Prefetch


# View for the index page
def index(request: HttpRequest):
    return render(request, "index.html", {})


def login(request: HttpRequest):
    if request.method == "POST":
        username = (request.POST.get("userName") or request.POST.get("username") or "").strip()
        password = request.POST.get("password") or ""
        if not username or not password:
            return render(request, "login.html", {"error": "Username and password are required.", "userName": username})
        
        if username == "admin" and password == "password123":
            request.session["is_admin"] = True
            request.session["simple_user_name"] = "admin"
            return HttpResponseRedirect(reverse("admin_users"))

        try:
            user = SimpleUser.objects.get(userName=username)
        except SimpleUser.DoesNotExist:
            return render(request, "login.html", {"error": "Invalid username or password.", "userName": username})

        if check_password(password, user.password):
            # this is from CHATGPT, I did not know how to create "sessions" to remember the created username to display it
            request.session["simple_user_id"] = user.pk
            request.session["simple_user_name"] = user.userName
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "login.html", {"error": "Invalid username or password.", "userName": username})

    return render(request, "login.html")

# revisit
def admin_users(request: HttpRequest):
    if not request.session.get("is_admin"):
        return HttpResponseRedirect(reverse("login"))

    # Order trips newest first; prefetch into 'trips' to avoid N+1 queries
    trips_qs = UserRoute.objects.only(
        "user_id", "route_names", "distance_meters", "created_at"
    ).order_by("-created_at")

    users = (
        SimpleUser.objects
        .all()
        .order_by("userName")
        .prefetch_related(Prefetch("userroute_set", queryset=trips_qs, to_attr="trips"))
    )

    current_username = request.session.get("simple_user_name")
    return render(request, "admin_users.html", {"users": users, "current_username": current_username})

def signin(request: HttpRequest):
    if request.method == "POST":
        username = (request.POST.get("userName") or "").strip()
        password = request.POST.get("password") or ""
        if not username or not password:
            return render(request, "signin.html", {"error": "Username and password are required.", "userName": username})
        user = SimpleUser(userName=username)
        user.set_password(password)
        try:
            user.save()
        except IntegrityError:
            return render(request, "signin.html", {"error": "Username already taken.", "userName": username})
        return HttpResponseRedirect(reverse("login"))
    return render(request, "signin.html")


def main(request: HttpRequest):
    # as described above, session stuff is from CHATGPT
    current_username = request.session.get("simple_user_name")
    return render(request, "main.html", {"current_username": current_username})



def optimize_route(request: HttpRequest):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        data = json.loads(request.body)
        place_ids = data.get("place_ids") or data.get("location_ids") or []
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if len(place_ids) < 2:
        return JsonResponse({"error": "Add at least two locations"}, status=400)
    if not getattr(settings, "GOOGLE_MAPS_API_KEY", ""):
        return JsonResponse({"error": "Google Maps API key missing"}, status=500)

    from .utils.distance import optimal_route
    result = optimal_route(place_ids, settings.GOOGLE_MAPS_API_KEY)

    # If a user is logged in, persist the trip
    uid = request.session.get("simple_user_id")
    if uid:
        try:
            user = SimpleUser.objects.get(pk=uid)
            UserRoute.objects.create(
                user=user,
                input_ids=place_ids,
                route_ids=result["route_ids"],
                route_names=result["route_names"],
                distance_meters=result["distance_meters"],
            )
        except SimpleUser.DoesNotExist:
            pass  # ignore if session is stale

    return JsonResponse(result)

def user_info(request: HttpRequest):
    uid = request.session.get("simple_user_id")
    if not uid:
        return HttpResponseRedirect(reverse("login"))
    user = SimpleUser.objects.get(pk=uid)
    trips = UserRoute.objects.filter(user=user).order_by("-created_at")
    return render(request, "user_info.html", {
        "current_username": user.userName,
        "trips": trips,
    })

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
def route(request: HttpRequest):
    if request.method == "POST":
        request_body = json.loads(request.body)
        new_route = Route(location_ids=request_body["location_ids"])
        new_route.save()
        return HttpResponseRedirect(reverse("index"))
