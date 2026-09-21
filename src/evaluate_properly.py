import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    roc_curve
)

# ==========================================
# 1. LOAD DATA
# ==========================================

df = pd.read_csv("data/filtered_training_dataset.csv")

TARGET = "blocked"

CAT_COLS = [
    "state",
    "nearest_river",
    "river_danger_level_is_official"
]

NUM_COLS = [
    c for c in df.columns
    if c not in CAT_COLS + [TARGET]
]

X = df[CAT_COLS + NUM_COLS]
y = df[TARGET]


# ==========================================
# 2. TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ==========================================
# 3. PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            CAT_COLS
        )
    ],
    remainder="passthrough"
)


# ==========================================
# 4. RANDOM FOREST
# ==========================================

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_leaf=1,
    n_jobs=-1,
    random_state=42,
    class_weight="balanced"
)


pipe = Pipeline([
    ("preprocess", preprocessor),
    ("rf", model)
])


# ==========================================
# 5. TRAIN
# ==========================================

pipe.fit(X_train, y_train)


# ==========================================
# 6. PREDICTIONS
# ==========================================

y_pred = pipe.predict(X_test)

# Probability of BLOCKED = 1
y_proba = pipe.predict_proba(X_test)[:, 1]


# ==========================================
# 7. METRICS
# ==========================================

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_proba)


print("\n================================")
print("   RANDOM FOREST PERFORMANCE")
print("================================")

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC-AUC   : {auc:.4f}")


# ==========================================
# 8. CLASSIFICATION REPORT
# ==========================================

print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# ==========================================
# 9. CONFUSION MATRIX
# ==========================================

cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:")
print(cm)

disp = ConfusionMatrixDisplay(confusion_matrix=cm)
disp.plot()

plt.title("Random Forest - Confusion Matrix")
plt.tight_layout()
plt.show()


# ==========================================
# 10. ROC CURVE
# ==========================================

fpr, tpr, thresholds = roc_curve(y_test, y_proba)

plt.figure(figsize=(7, 6))

plt.plot(
    fpr,
    tpr,
    label=f"Random Forest (AUC = {auc:.3f})"
)

plt.plot(
    [0, 1],
    [0, 1],
    linestyle="--",
    label="Random Guess"
)

plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")

plt.title("Random Forest - ROC Curve")

plt.legend()
plt.grid()

plt.tight_layout()
plt.show()