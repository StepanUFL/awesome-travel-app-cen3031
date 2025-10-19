from django.urls import path

from . import views

# app_name = "planner"
urlpatterns = [
    path("", views.index, name="index"),
    path("location/", views.location_info, name="location-info"),
    path("route/", views.route_info, name="route-info"),
    path("new-route/", views.new_route, name="new-route"),
]
