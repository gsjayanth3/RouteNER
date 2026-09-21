import time
import pandas as pd
import joblib
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


# ============================================================
# 1. SETTINGS
# ============================================================

DATA_PATH = "data/filtered_training_dataset.csv"
MODEL_PATH = "models/rf_blocked_model_evaluated.joblib"

TARGET = "blocked"

CAT_COLS = [
    "state",
    "nearest_river",
    "river_danger_level_is_official"
]


# ============================================================
# 2. LOAD DATA
# ============================================================

print("\nLoading dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Total rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")

print("\nClass distribution:")
print(df[TARGET].value_counts())
print("\nClass percentages:")
print(df[TARGET].value_counts(normalize=True) * 100)


# ============================================================
# 3. SEPARATE FEATURES AND TARGET
# ============================================================

NUM_COLS = [
    c for c in df.columns
    if c not in CAT_COLS + [TARGET]
]

X = df[CAT_COLS + NUM_COLS]
y = df[TARGET]


print("\nCategorical features:")
print(CAT_COLS)

print("\nNumerical features:")
print(NUM_COLS)


# ============================================================
# 4. TRAIN / TEST SPLIT
# ============================================================

print("\nCreating 80/20 stratified split...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples : {len(X_test)}")


# ============================================================
# 5. PREPROCESSING
# ============================================================

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


# ============================================================
# 6. RANDOM FOREST MODEL
# ============================================================

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_leaf=1,
    n_jobs=-1,
    random_state=42,
    class_weight="balanced"
)


# ============================================================
# 7. CREATE PIPELINE
# ============================================================

pipe = Pipeline(
    steps=[
        ("preprocess", preprocessor),
        ("rf", model)
    ]
)


# ============================================================
# 8. TRAIN MODEL
# ============================================================

print("\nTraining Random Forest...")

t0 = time.time()

pipe.fit(X_train, y_train)

elapsed = time.time() - t0

print(f"Training completed in {elapsed:.2f} seconds")


# ============================================================
# 9. PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

# Predicted class
y_pred = pipe.predict(X_test)

# Probability of class 1 = BLOCKED
y_proba = pipe.predict_proba(X_test)[:, 1]


# ============================================================
# 10. PERFORMANCE METRICS
# ============================================================

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    y_proba
)


# ============================================================
# 11. PRINT PERFORMANCE
# ============================================================

print("\n")
print("=" * 50)
print("       RANDOM FOREST PERFORMANCE")
print("=" * 50)

print(f"\nAccuracy  : {accuracy:.4f}  ({accuracy * 100:.2f}%)")
print(f"Precision : {precision:.4f}  ({precision * 100:.2f}%)")
print(f"Recall    : {recall:.4f}  ({recall * 100:.2f}%)")
print(f"F1 Score  : {f1:.4f}  ({f1 * 100:.2f}%)")
print(f"ROC-AUC   : {roc_auc:.4f}")

print("=" * 50)


# ============================================================
# 12. CLASSIFICATION REPORT
# ============================================================

print("\n")
print("=" * 50)
print("          CLASSIFICATION REPORT")
print("=" * 50)

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "Accessible (0)",
            "Blocked (1)"
        ],
        zero_division=0
    )
)


# ============================================================
# 13. CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_test,
    y_pred
)

print("\n")
print("=" * 50)
print("            CONFUSION MATRIX")
print("=" * 50)

print(cm)

print("\nInterpretation:")

tn, fp, fn, tp = cm.ravel()

print(f"True Negatives  : {tn}")
print(f"False Positives : {fp}")
print(f"False Negatives : {fn}")
print(f"True Positives  : {tp}")


# ============================================================
# 14. PLOT CONFUSION MATRIX
# ============================================================

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=[
        "Accessible",
        "Blocked"
    ]
)

disp.plot()

plt.title("Random Forest - Confusion Matrix")

plt.tight_layout()

plt.show()


# ============================================================
# 15. ROC CURVE
# ============================================================

fpr, tpr, thresholds = roc_curve(
    y_test,
    y_proba
)


plt.figure(figsize=(7, 6))

plt.plot(
    fpr,
    tpr,
    label=f"Random Forest (AUC = {roc_auc:.3f})"
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


# ============================================================
# 16. SAVE MODEL
# ============================================================

print("\nSaving trained model...")

joblib.dump(
    pipe,
    MODEL_PATH
)

print(f"Model saved to: {MODEL_PATH}")


# ============================================================
# 17. FINAL SUMMARY
# ============================================================

print("\n")
print("=" * 50)
print("             FINAL SUMMARY")
print("=" * 50)

print(f"Dataset size       : {len(df)}")
print(f"Training samples   : {len(X_train)}")
print(f"Test samples       : {len(X_test)}")
print(f"Accuracy           : {accuracy * 100:.2f}%")
print(f"Precision          : {precision * 100:.2f}%")
print(f"Recall             : {recall * 100:.2f}%")
print(f"F1 Score           : {f1 * 100:.2f}%")
print(f"ROC-AUC            : {roc_auc:.4f}")

print("=" * 50)