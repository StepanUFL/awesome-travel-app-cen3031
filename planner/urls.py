from django.urls import path
from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("optimize-route/", views.optimize_route, name="optimize_route"),
    path("login", views.login, name="login"),
    path("signin", views.signin, name="signin"),
    path("main", views.main, name="main"),
    path("location/<id>/", views.location, name="location"),
    path("route/<int:id>/", views.route, name="route"),
    path("admin-users", views.admin_users, name="admin_users"),
]