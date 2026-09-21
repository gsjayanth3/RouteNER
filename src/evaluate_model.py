import pandas as pd
import joblib
import matplotlib.pyplot as plt

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

# --------------------------------------------------
# 1. Load trained model and test dataset
# --------------------------------------------------

MODEL_PATH = "models/rf_blocked_model.joblib"
TEST_DATA_PATH = "data/filtered_test_dataset_improved.csv"

pipe = joblib.load(MODEL_PATH)
df = pd.read_csv(TEST_DATA_PATH)

# --------------------------------------------------
# 2. Separate features and target
# --------------------------------------------------

X_test = df.drop(columns=["blocked","blocked_original"])
y_test = df["blocked"]

# --------------------------------------------------
# 3. Make predictions
# --------------------------------------------------

y_pred = pipe.predict(X_test)

# Probability that road is BLOCKED
y_proba = pipe.predict_proba(X_test)[:, 1]

# --------------------------------------------------
# 4. Calculate performance metrics
# --------------------------------------------------

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_proba)

print("\n========== MODEL PERFORMANCE ==========")

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC-AUC   : {auc:.4f}")

# --------------------------------------------------
# 5. Detailed classification report
# --------------------------------------------------

print("\n========== CLASSIFICATION REPORT ==========")
print(classification_report(y_test, y_pred))

# --------------------------------------------------
# 6. Confusion Matrix
# --------------------------------------------------

cm = confusion_matrix(y_test, y_pred)

print("\n========== CONFUSION MATRIX ==========")
print(cm)

disp = ConfusionMatrixDisplay(confusion_matrix=cm)
disp.plot()
plt.title("Confusion Matrix")
plt.show()

# --------------------------------------------------
# 7. ROC Curve
# --------------------------------------------------

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
plt.title("ROC Curve")
plt.legend()
plt.grid()

plt.show()
