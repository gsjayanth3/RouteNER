from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

# Load trained model pipeline
model = joblib.load("models/rf_blocked_model.joblib")

app = FastAPI(title="Road Blockage Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionInput(BaseModel):
    state: str
    nearest_river: str
    river_danger_level_is_official: bool
    rainfall_24h_mm: float
    rain_3d_mm: float
    rain_7d_mm: float
    slope_deg: float
    historical_incidents_90d: int
    river_danger_level_m: float
    present_river_level_m: float
    river_level_ratio: float
    month: int


@app.get("/")
def home():
    return {"message": "Road Blockage Prediction API is running"}


@app.post("/predict")
def predict(data: PredictionInput):

    input_data = pd.DataFrame([data.model_dump()])

    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0, 1]

    return {
        "blocked": int(prediction),
        "probability": round(float(probability), 4)
    }