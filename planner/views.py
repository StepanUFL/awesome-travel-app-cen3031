import json
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.db import IntegrityError
from django.contrib.auth.hashers import check_password
from .models import Route, SimpleUser

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

def admin_users(request: HttpRequest):
    # Only allow the special admin session
    if not request.session.get("is_admin"):
        return HttpResponseRedirect(reverse("login"))
    users = SimpleUser.objects.all().order_by("userName")
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

def location(request: HttpRequest, id):
    return JsonResponse({"nope": "nope"})

def route(request: HttpRequest, id: int):
    if request.method == "POST":
        location_ids_json = json.loads(request.body)
        new_route = Route(location_ids=location_ids_json)
        new_route.pk = id
        new_route.save()
        return HttpResponseRedirect(reverse("index"))
    elif request.method == "GET":
        return JsonResponse(Route.objects.get(pk=id).location_ids)