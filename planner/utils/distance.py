# new version of distance.py that uses the place IDs from the user instead of earlier terminal version (I miss when life was simpler)
#refactored by chatgpt

import itertools
from googlemaps import Client

def optimal_route(place_ids: list[str], api_key: str):
    
    # want to check if more than 2 places are in the list, or else there's nothing to optimize
    if len(place_ids) < 2:
        return {"route_ids": place_ids, "route_names": [], "distance_meters": 0}

    gm = Client(key=api_key)

    # same logic as before for calculation
    origins = [f"place_id:{pid}" for pid in place_ids]
    destinations = [f"place_id:{pid}" for pid in place_ids]
    matrix = gm.distance_matrix(origins, destinations, mode="driving")

    n = len(place_ids)

    distances = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            el = matrix["rows"][i]["elements"][j]
            if el.get("status") == "OK":
                distances[i][j] = el["distance"]["value"]  
            else:
                distances[i][j] = float("inf")

    #  n! calculation time! wow!
    best_perm, best_total = None, float("inf")
    for perm in itertools.permutations(range(n)):
        total = sum(distances[perm[k]][perm[k+1]] for k in range(n - 1))
        if total < best_total:
            best_perm, best_total = perm, total

    ordered_ids = [place_ids[i] for i in best_perm]

    # work on display, need to get names from place IDs
    names = []
    for pid in ordered_ids:
        det = gm.place(place_id=pid, fields=["name"])
        names.append(det.get("result", {}).get("name") or pid)

    return {"route_ids": ordered_ids, "route_names": names, "distance_meters": best_total}