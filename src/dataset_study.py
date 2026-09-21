import pandas as pd

dataset = pd.read_csv("data/RAW_Dataset.csv")

blocked_count = dataset[dataset["road_blocked"] == 1].shape[0]
most_blocked_state = dataset[dataset["road_blocked"] == 1]["state"].value_counts().idxmax()
most_blocked_state_count = dataset[dataset["road_blocked"] == 1]["state"].value_counts().max()

print(blocked_count)
print(most_blocked_state)
print(most_blocked_state_count)
