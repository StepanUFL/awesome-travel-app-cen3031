from django.urls import path

from . import views

# app_name = "planner"
urlpatterns = [
    path("", views.index, name="index"),
    path("location/<id>/", views.location, name="location"),
    path("route/<id>/", views.route, name="route"),
]
