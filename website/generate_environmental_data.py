import json
import random
import math
from pathlib import Path

# -----------------------------
# Configuration
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent

GEOJSON_FILE = BASE_DIR / "data" / "ner_states.geojson"
OUTPUT_FILE = BASE_DIR / "data" / "environmental_data.json"

random.seed(42)

POINTS_PER_STATE = 700

# -----------------------------
# Load NER boundaries
# -----------------------------

with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
    geojson = json.load(f)


# -----------------------------
# Point-in-polygon
# -----------------------------

def point_in_polygon(lat, lon, polygon):

    inside = False

    for i in range(len(polygon)):

        j = (i - 1) % len(polygon)

        lon_i, lat_i = polygon[i]
        lon_j, lat_j = polygon[j]

        intersects = (
            ((lat_i > lat) != (lat_j > lat))
            and
            (
                lon
                <
                (lon_j - lon_i)
                * (lat - lat_i)
                / (lat_j - lat_i)
                + lon_i
            )
        )

        if intersects:
            inside = not inside

    return inside


# -----------------------------
# Extract polygons
# -----------------------------

def get_polygons(feature):

    geometry = feature["geometry"]

    if geometry["type"] == "Polygon":
        return geometry["coordinates"]

    if geometry["type"] == "MultiPolygon":

        polygons = []

        for polygon in geometry["coordinates"]:
            polygons.extend(polygon)

        return polygons

    return []


# -----------------------------
# Get state name
# -----------------------------

def get_state_name(feature):

    properties = feature.get("properties", {})

    possible_names = [
        "name",
        "NAME",
        "state",
        "STATE",
        "State",
        "st_nm"
    ]

    for key in possible_names:

        if key in properties:
            return properties[key]

    return "Unknown"


# -----------------------------
# Generate environmental point
# -----------------------------

def generate_environment(lat, lon):

    # =========================================================
    # RISK ZONE
    # =========================================================
    #
    # Instead of making every location rainy, create spatial
    # pockets of:
    #
    # SAFE       ~50%
    # MODERATE   ~30%
    # HIGH       ~15%
    # EXTREME     ~5%
    #
    # The model still decides the final probability.
    # =========================================================

    spatial_wave = (
        math.sin(lat * 1.35)
        +
        math.cos(lon * 1.15)
        +
        math.sin((lat + lon) * 0.7)
    ) / 3

    random_factor = random.random()

    if random_factor < 0.50:

        zone = "safe"

    elif random_factor < 0.80:

        zone = "moderate"

    elif random_factor < 0.95:

        zone = "high"

    else:

        zone = "extreme"


    # =========================================================
    # RAINFALL
    # =========================================================

    if zone == "safe":

        # Training data has many zero/very-low rainfall values.
        rainfall_24h = random.choice([
            0,
            0,
            0,
            random.uniform(0, 3),
            random.uniform(1, 8),
            random.uniform(3, 15)
        ])

    elif zone == "moderate":

        rainfall_24h = random.uniform(
            8,
            45
        )

    elif zone == "high":

        rainfall_24h = random.uniform(
            45,
            120
        )

    else:

        rainfall_24h = random.uniform(
            120,
            250
        )


    # Add small spatial effect
    rainfall_24h += max(
        0,
        spatial_wave * 5
    )

    rainfall_24h = max(
        0,
        min(
            rainfall_24h,
            300
        )
    )


    # =========================================================
    # ACCUMULATED RAINFALL
    # =========================================================

    if zone == "safe":

        rain_3d = rainfall_24h * random.uniform(
            1.0,
            2.5
        )

        rain_7d = rain_3d * random.uniform(
            1.0,
            2.0
        )

    elif zone == "moderate":

        rain_3d = rainfall_24h * random.uniform(
            1.5,
            3.0
        )

        rain_7d = rain_3d * random.uniform(
            1.4,
            2.2
        )

    elif zone == "high":

        rain_3d = rainfall_24h * random.uniform(
            1.8,
            3.5
        )

        rain_7d = rain_3d * random.uniform(
            1.5,
            2.5
        )

    else:

        rain_3d = rainfall_24h * random.uniform(
            2.0,
            3.5
        )

        rain_7d = rain_3d * random.uniform(
            1.7,
            2.7
        )


    rain_3d = max(
        rainfall_24h,
        rain_3d
    )

    rain_7d = max(
        rain_3d,
        rain_7d
    )


    rain_3d = min(
        rain_3d,
        1200
    )

    rain_7d = min(
        rain_7d,
        2200
    )


    # =========================================================
    # SLOPE
    # =========================================================
    #
    # Training data median is around 18 degrees.
    # Keep normal terrain around that value, with some
    # genuinely gentle areas and some steep areas.
    # =========================================================

    if zone == "safe":

        slope_deg = random.uniform(
            3,
            18
        )

    elif zone == "moderate":

        slope_deg = random.uniform(
            10,
            23
        )

    elif zone == "high":

        slope_deg = random.uniform(
            18,
            30
        )

    else:

        slope_deg = random.uniform(
            25,
            35
        )


    # Small spatial variation
    slope_deg += (
        spatial_wave * 2
    )

    slope_deg = max(
        1,
        min(
            slope_deg,
            35.6
        )
    )


    # =========================================================
    # RIVER DANGER LEVEL
    # =========================================================

    river_danger_level = random.choice([

        random.uniform(8, 20),

        random.uniform(15, 35),

        random.uniform(25, 55),

        random.uniform(45, 80),

        random.uniform(70, 105)

    ])


    # =========================================================
    # RIVER LEVEL RATIO
    # =========================================================
    #
    # This is VERY important.
    #
    # Training data:
    #
    # Safe median      ~0.57
    # Blocked median   ~0.77
    #
    # So safe points need plenty of ratios around 0.4-0.65.
    # =========================================================

    if zone == "safe":

        river_ratio = random.uniform(
            0.40,
            0.65
        )

    elif zone == "moderate":

        river_ratio = random.uniform(
            0.55,
            0.82
        )

    elif zone == "high":

        river_ratio = random.uniform(
            0.75,
            1.00
        )

    else:

        river_ratio = random.uniform(
            0.92,
            1.15
        )


    # Slight rainfall influence
    river_ratio += (
        min(
            rainfall_24h,
            150
        ) / 150
    ) * 0.04

    river_ratio = max(
        0.35,
        min(
            river_ratio,
            1.30
        )
    )


    present_river_level = (
        river_danger_level
        * river_ratio
    )


    # =========================================================
    # HISTORICAL INCIDENTS
    # =========================================================

    if zone == "safe":

        historical_incidents = random.choices(
            [0, 1, 2],
            weights=[0.70, 0.25, 0.05]
        )[0]

    elif zone == "moderate":

        historical_incidents = random.choices(
            [0, 1, 2, 3],
            weights=[0.35, 0.40, 0.20, 0.05]
        )[0]

    elif zone == "high":

        historical_incidents = random.choices(
            [1, 2, 3, 4],
            weights=[0.15, 0.40, 0.35, 0.10]
        )[0]

    else:

        historical_incidents = random.choices(
            [2, 3, 4, 5, 6],
            weights=[0.10, 0.25, 0.35, 0.20, 0.10]
        )[0]


    # =========================================================
    # RIVER
    # =========================================================

    rivers = [
        "Brahmaputra",
        "Subansiri",
        "Siang",
        "Dibang",
        "Barak",
        "Teesta",
        "Manas"
    ]

    nearest_river = random.choice(
        rivers
    )


    # =========================================================
    # OFFICIAL WARNING
    # =========================================================

    if zone in ["high", "extreme"]:

        river_danger_level_is_official = (
            random.random() < 0.65
        )

    else:

        river_danger_level_is_official = (
            random.random() < 0.15
        )


    # =========================================================
    # RETURN
    # =========================================================

    return {

        "rainfall_24h_mm": round(
            rainfall_24h,
            2
        ),

        "rain_3d_mm": round(
            rain_3d,
            2
        ),

        "rain_7d_mm": round(
            rain_7d,
            2
        ),

        "slope_deg": round(
            slope_deg,
            2
        ),

        "historical_incidents_90d":
            historical_incidents,

        "river_danger_level_m": round(
            river_danger_level,
            2
        ),

        "present_river_level_m": round(
            present_river_level,
            2
        ),

        "river_level_ratio": round(
            river_ratio,
            3
        ),

        "nearest_river":
            nearest_river,

        "river_danger_level_is_official":
            river_danger_level_is_official,

        "month": 7
    }


# =============================================================
# Generate spatial points
# =============================================================

locations = []


for feature in geojson["features"]:

    state = get_state_name(feature)

    polygons = get_polygons(feature)

    if not polygons:
        continue

    outer_ring = polygons[0]

    lons = [p[0] for p in outer_ring]
    lats = [p[1] for p in outer_ring]

    min_lon = min(lons)
    max_lon = max(lons)

    min_lat = min(lats)
    max_lat = max(lats)

    generated = 0
    attempts = 0

    while generated < POINTS_PER_STATE and attempts < 10000:

        attempts += 1

        lon = random.uniform(
            min_lon,
            max_lon
        )

        lat = random.uniform(
            min_lat,
            max_lat
        )

        if not point_in_polygon(
            lat,
            lon,
            outer_ring
        ):
            continue

        environment = generate_environment(
            lat,
            lon
        )

        locations.append({

            "lat": round(
                lat,
                6
            ),

            "lon": round(
                lon,
                6
            ),

            "state":
                state,

            "nearest_river":
                environment["nearest_river"],

            "river_danger_level_is_official":
                environment[
                    "river_danger_level_is_official"
                ],

            "rainfall_24h_mm":
                environment[
                    "rainfall_24h_mm"
                ],

            "rain_3d_mm":
                environment[
                    "rain_3d_mm"
                ],

            "rain_7d_mm":
                environment[
                    "rain_7d_mm"
                ],

            "slope_deg":
                environment[
                    "slope_deg"
                ],

            "historical_incidents_90d":
                environment[
                    "historical_incidents_90d"
                ],

            "river_danger_level_m":
                environment[
                    "river_danger_level_m"
                ],

            "present_river_level_m":
                environment[
                    "present_river_level_m"
                ],

            "river_level_ratio":
                environment[
                    "river_level_ratio"
                ],

            "month":
                7
        })

        generated += 1


# =============================================================
# Save dataset
# =============================================================

output = {

    "source":
        "SIMULATED_SPATIAL_ENVIRONMENTAL_FEED",

    "description":
        "Synthetic spatially correlated environmental "
        "reference points for NER prototype with balanced "
        "safe, moderate, high and extreme conditions.",

    "point_count":
        len(locations),

    "locations":
        locations
}


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        output,
        f,
        indent=2
    )


# =============================================================
# Final output
# =============================================================

print(
    f"Generated {len(locations)} "
    f"environmental points."
)

print(
    f"Saved to: {OUTPUT_FILE}"
)

print()
print("Spatial environmental feed generated.")
print("Risk conditions:")
print("  SAFE       ~50%")
print("  MODERATE   ~30%")
print("  HIGH       ~15%")
print("  EXTREME     ~5%")