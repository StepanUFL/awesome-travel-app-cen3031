from django.urls import include, path

from . import views

# app_name = "planner"
urlpatterns = [
    path("", views.index, name="index"),
    path("location/<id>/", views.location, name="location"),
    path("route/", views.route, name="route"),
    path("route/<int:id>/", views.route_id, name="route_id"),
]
