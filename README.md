# RouteNER

RouteNER is a smart logistics and road-risk platform for the North Eastern Region (NER) of India.

The project combines a GIS-based web interface with a machine-learning road blockage prediction API to visualize environmental conditions, assess route risks, and identify potentially vulnerable road sections.

## Project Structure

```text
RouteNER/
|-- api/
|   `-- api.py
|-- data/
|   |-- RAW_Dataset.csv
|   |-- Test_dataset.csv
|   |-- Validation_dataset.csv
|   |-- filtered_training_dataset.csv
|   `-- training_dataset.csv
|-- models/
|   `-- rf_blocked_model.joblib
|-- src/
|   `-- ML training and evaluation scripts
|-- website/
|   |-- backend/
|   |   `-- main.py
|   |-- data/
|   |-- frontend/
|   |   |-- index.html
|   |   |-- style.css
|   |   `-- app.js
|   `-- requirements.txt
|-- requirements.txt
`-- README.md
```

## Requirements

* Python 3.x
* Git
* Git LFS
* Internet connection for map tiles and OSRM routing

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/gsjayanth3/RouteNER.git
cd RouteNER
```

### 2. Pull the trained model

The trained model is stored using Git LFS.

```bash
git lfs install
git lfs pull
```

### 3. Install ML API dependencies

From the project root:

```bash
pip install -r requirements.txt
```

### 4. Install website dependencies

```bash
pip install -r website/requirements.txt
```

## Running RouteNER

The application uses two FastAPI services.

### Terminal 1 — ML Prediction API

From the project root:

```bash
python -m uvicorn api.api:app --reload --port 8001
```

ML API:

```text
http://127.0.0.1:8001
```

### Terminal 2 — Website

From the project root:

```bash
cd website/backend
python -m uvicorn main:app --reload --port 8000
```

Open the application:

```text
http://127.0.0.1:8000
```

## System Flow

```text
RouteNER Website (Port 8000)
          |
          | Prediction requests
          v
ML Prediction API (Port 8001)
          |
          v
Random Forest Model
(models/rf_blocked_model.joblib)
```

The website also uses route information and map services to display and assess routes.

## ML Prediction API

Prediction endpoint:

```text
POST /predict
```

The API accepts environmental and historical road-risk features including:

* State
* Nearest river
* Official river danger-level indicator
* 24-hour rainfall
* 3-day rainfall
* 7-day rainfall
* Slope
* Historical incidents
* River danger level
* Present river level
* River level ratio
* Month

Example response:

```json
{
  "blocked": 0,
  "probability": 0.1234
}
```

## Notes

* The trained model is managed through Git LFS.
* Both the ML API and website backend must be running for the complete application flow.
* Map routing uses OSRM.
* Map tiles use OpenStreetMap.
* GPS functionality requires browser location permission.
