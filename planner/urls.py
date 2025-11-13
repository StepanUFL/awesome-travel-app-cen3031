from django.urls import path

from . import views

# app_name = "planner"
urlpatterns = [
    path("", views.index, name="index"),
    path('login', views.login, name="login"),
    path('signin', views.signin, name="signin"),
    path('main', views.main, name="main"),
    path("location/<id>/", views.location, name="location"),
    path("route/<int:id>/", views.route, name="route"),
]
