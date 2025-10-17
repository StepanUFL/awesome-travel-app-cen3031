# Use Google maps API to find driving time and distance between places


import googlemaps

API = open("Google Maps Platform API Key.txt", "r")
# after getting your API key, put it into a text document and change the txt used here to that file

APIKey = API.read()

Maps = googlemaps.Client(key=APIKey)

StartDestination = input("Where will you begin your drive?\n")
EndDestination = input("Where will you end your drive?\n")

Distance = Maps.directions(StartDestination, EndDestination)

KMDistance = Distance[0]["legs"][0]["distance"]["text"]
HrsMinsDuration = Distance[0]["legs"][0]["duration"]["text"]

print(
    "your drive will cover a total distance of "
    + KMDistance
    + ", taking a total time of "
    + HrsMinsDuration
    + "."
)

# source used for this implementation https://youtu.be/bgl0QHfIeko
