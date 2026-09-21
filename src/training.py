"""
One-shot training script — Random Forest for road-block prediction.
Target: 'blocked'
Note: This script ONLY trains the model on the full dataset.
No train/test split, no validation, no evaluation metrics — as requested.
Do that in a separate step later before trusting this model for anything real.
"""

import time
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

t0 = time.time()

# 1. Load data ----------------------------------------------------------
df = pd.read_csv("data/filtered_training_dataset.csv")

TARGET = "blocked"
CAT_COLS = ["state", "nearest_river", "river_danger_level_is_official"]
NUM_COLS = [c for c in df.columns if c not in CAT_COLS + [TARGET,"blocked_original"]]

X = df[CAT_COLS + NUM_COLS]
y = df[TARGET]

# 2. Preprocessing + model in a single pipeline --------------------------
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), CAT_COLS),
    ],
    remainder="passthrough",  # numeric columns pass through unchanged
)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_leaf=1,
    n_jobs=-1,          # use all CPU cores
    random_state=42,
    class_weight="balanced",  # target is ~60/40, this helps a bit
)

pipe = Pipeline(steps=[
    ("preprocess", preprocessor),
    ("rf", model),
])

# 3. Train on the FULL dataset (no split, as requested) ------------------
pipe.fit(X, y)

# 4. Save the trained pipeline (preprocessing + model bundled together) --
joblib.dump(pipe, "models/rf_blocked_model.joblib")

elapsed = time.time() - t0
print(f"Training complete in {elapsed:.2f} seconds")
print(f"Rows trained on: {len(df)}")
print(f"Features used: {CAT_COLS + NUM_COLS}")
