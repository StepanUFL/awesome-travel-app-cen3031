# Use Google maps API to find driving time and distance between places


import googlemaps
import numpy as np
import itertools

API = open("Google Maps Platform API Key.txt", "r")
# after getting your API key, put it into a text document and change the txt used here to that file

APIKey = API.read()

Maps = googlemaps.Client(key = APIKey)

places = []
print("Please provide where you want to visit (type 'end' when Done):")

while True:
    location = input("> ")
    if location == "end":
        break
    places.append(location)

if len(places) < 2:
    print("you must enter at least two destinations.")
    exit()

matrix = Maps.distance_matrix(places, places, mode="driving")

num_places = len(places)
distances = []
for i in range(num_places):
    row = []
    for j in range(num_places):
        row.append(0)  # initialize all distances to 0
    distances.append(row)

# Step 2: Fill the matrix with actual distances from the API
for i in range(num_places):
    for j in range(num_places):
        if i != j:  # skip distance from a place to itself
            element = matrix['rows'][i]['elements'][j]
            distances[i][j] = element['distance']['value']

min_distance = float('inf')
best_routes = []

for perm in itertools.permutations(range(len(places))):
    total_distance = 0
    for i in range(len(perm) - 1):
        total_distance += distances[perm[i]][perm[i + 1]]

    # compare route distances
    if total_distance < min_distance:
        min_distance = total_distance
        best_routes = [perm]
    elif total_distance == min_distance:
        best_routes.append(perm)

#  display results
print("\nShortest route(s):")
for route in best_routes:
    ordered_places = [places[i] for i in route]
    print(" -> ".join(ordered_places))



# source used for this implementation https://youtu.be/bgl0QHfIeko
