from django.db import models
from django.contrib.auth.hashers import make_password


# creating a user with password for database
class SimpleUser(models.Model):
    userID = models.AutoField(primary_key=True)
    userName = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)

    def set_password(self, raw):
        self.password = make_password(raw)


class Route(models.Model):
    location_ids = models.JSONField(null=True)

    def __str__(self):
        return str(self.location_ids)
    
class UserRoute(models.Model):
    user = models.ForeignKey(SimpleUser, on_delete=models.CASCADE)
    input_ids = models.JSONField()
    route_ids = models.JSONField()
    route_names = models.JSONField()
    distance_meters = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.userName}: {' -> '.join(self.route_names)}"
