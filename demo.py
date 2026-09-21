import pandas as pd

df = pd.read_csv("data/filtered_training_dataset.csv")

features = [
    "rainfall_24h_mm",
    "rain_3d_mm",
    "rain_7d_mm",
    "slope_deg",
    "river_level_ratio",
    "historical_incidents_90d"
]

print("\n========== FEATURE MEANS BY CLASS ==========\n")

print(
    df.groupby("blocked")[features]
      .mean()
      .round(2)
)

print("\n========== MEDIANS BY CLASS ==========\n")

print(
    df.groupby("blocked")[features]
      .median()
      .round(2)
)