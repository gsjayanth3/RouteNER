"""
Quick sanity check — NOT a real evaluation.
Loads the trained model and runs it on a handful of samples pulled
straight from the training CSV, just to eyeball predicted vs actual.

Since these rows were part of training, the model has already "seen"
them — don't read too much into how well it does here. This is only
to catch obvious bugs (wrong columns, crashes, all-one-class output,
etc.) before you do a proper train/test split later.
"""

import pandas as pd
import joblib

MODEL_PATH = "rf_blocked_model.joblib"          # adjust path if needed
DATA_PATH = "filtered_training_dataset.csv"      # adjust path if needed
N_SAMPLES = 8

# 1. Load the trained pipeline (encoder + model bundled together) -------
pipe = joblib.load('models/rf_blocked_model.joblib')

# 2. Grab a few random rows to eyeball --------------------------------
df = pd.read_csv("data/filtered_test_dataset.csv")
sample = df.sample(n= 5 , random_state=1)   # change random_state to see different rows

X_sample = sample.drop(columns=["blocked"])
y_actual = sample["blocked"]

# 3. Predict -------------------------------------------------------------
y_pred = pipe.predict(X_sample)
y_proba = pipe.predict_proba(X_sample)[:, 1]   # probability of class "1" (blocked)

# 4. Show a clean comparison table ---------------------------------------
result = sample.copy()
result["predicted"] = y_pred
result["prob_blocked"] = y_proba.round(3)
result["correct"] = result["blocked"] == result["predicted"]

cols_to_show = ["state", "rainfall_24h_mm", "river_level_ratio", "blocked", "predicted", "prob_blocked", "correct"]
print(result[cols_to_show].to_string(index=False))

print(f"\n{result['correct'].sum()}/{N_SAMPLES} correct on this quick sample")


# ---------------------------------------------------------------------
# Optional: test one manually-made-up sample (edit values as you like)
# ---------------------------------------------------------------------
manual_sample = pd.DataFrame([{
    "state": "Assam",
    "rainfall_24h_mm": 120.0,
    "rain_3d_mm": 200.0,
    "rain_7d_mm": 300.0,
    "slope_deg": 10.5,
    "historical_incidents_90d": 2,
    "nearest_river": "Brahmaputra (Dibrugarh gauge)",
    "river_danger_level_m": 105.7,
    "river_danger_level_is_official": True,
    "present_river_level_m": 98.0,
    "river_level_ratio": 0.93,
    "month": 7,
}])

manual_pred = pipe.predict(manual_sample)[0]
manual_proba = pipe.predict_proba(manual_sample)[0, 1]
print(f"\nManual sample -> predicted: {manual_pred}, prob_blocked: {manual_proba:.3f}")
