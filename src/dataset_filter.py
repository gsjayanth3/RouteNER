import pandas as pd

#Test dataset filtering and preprocessing

# Read the test dataset
test_dataset = pd.read_csv("data/Test_dataset.csv")

# Get info and header details 

test_ = test_dataset[['state','rainfall_24h_mm','rain_3d_mm','rain_7d_mm','slope_deg','historical_incidents_90d','nearest_river','river_danger_level_m','river_danger_level_is_official','present_river_level_m','river_level_ratio','blocked']]
test_['month'] = pd.to_datetime(test_dataset['date']).dt.month

test_.to_csv("data/filtered_test_dataset.csv", index=False)

