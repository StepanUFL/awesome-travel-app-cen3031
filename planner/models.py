from django.db import models
from django.contrib.auth.hashers import make_password


class Route(models.Model):
    location_ids = models.JSONField(null=True)

    def __str__(self):
        return f"Route {self.id}: {self.location_ids}"
