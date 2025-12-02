from django.db import models
from django.contrib.auth.hashers import make_password

class SimpleUser(models.Model):
    userID = models.AutoField(primary_key=True)
    userName = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)

    def set_password(self, raw):
        self.password = make_password(raw)

class Route(models.Model):
    location_ids = models.JSONField(null=True)

    def __str__(self):
        return f"Route {self.id}: {self.location_ids}"
