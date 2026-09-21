from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path


# ========================================
# CREATE FASTAPI APPLICATION
# ========================================

app = FastAPI(
    title="NER Smart Logistics GIS",
    description="AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region",
    version="1.0"
)


# ========================================
# API HEALTH CHECK
# ========================================

@app.get("/api/health")
def health():

    return {
        "status": "online",
        "service": "NER GIS Backend"
    }


# ========================================
# NER STATES API
# ========================================

@app.get("/api/ner/states")
def ner_states():

    states = [
        {
            "name": "Arunachal Pradesh",
            "capital": "Itanagar"
        },

        {
            "name": "Assam",
            "capital": "Dispur"
        },

        {
            "name": "Manipur",
            "capital": "Imphal"
        },

        {
            "name": "Meghalaya",
            "capital": "Shillong"
        },

        {
            "name": "Mizoram",
            "capital": "Aizawl"
        },

        {
            "name": "Nagaland",
            "capital": "Kohima"
        },

        {
            "name": "Sikkim",
            "capital": "Gangtok"
        },

        {
            "name": "Tripura",
            "capital": "Agartala"
        }
    ]

    return {
        "region": "North Eastern Region of India",
        "state_count": len(states),
        "states": states
    }


# ========================================
# FRONTEND LOCATION
# ========================================

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"

# ========================================
# SERVE GEOJSON DATA
# ========================================

DATA_DIR = BASE_DIR / "data"

app.mount(
    "/data",
    StaticFiles(
        directory=DATA_DIR
    ),
    name="data"
)

# ========================================
# SERVE FRONTEND WEBSITE
# ========================================

app.mount(
    "/",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)