# Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases

A complete modular full-stack application for detecting, monitoring, and predicting water-borne disease outbreaks using:
- community symptom reports,
- water quality sensor inputs,
- AI-based risk prediction,
- real-time streams and alerts.

## Tech Stack

- Mobile App: React Native (Expo)
- Web Dashboard: React.js (Vite)
- Backend API: FastAPI (Python)
- Database: PostgreSQL
- ML/AI: Scikit-learn + TensorFlow (bonus models)
- Visualization: Recharts
- Maps: Leaflet (React Leaflet)
- Deployment: Docker + Kubernetes-ready manifests

## Monorepo Structure

```text
/backend
  main.py
  routes/
  models/
  database/
  schemas/
  ml_model/
  utils/
/frontend-web
  src/
    dashboard/
    charts/
    maps/
    components/
    services/
/mobile-app
  screens/
  components/
  api/
  locales/
  utils/
/infra/k8s
/docker-compose.yml
/README.md
```

## System Modules Implemented

### 1) Community Reporting App (React Native)
- User registration/login with backend JWT.
- Symptom reporting form fields:
  - `user_id` (from auth token)
  - GPS location (`latitude`, `longitude`)
  - `date`
  - `symptoms`
  - `water_source_type`
  - `household_size`
  - `recent_travel`
  - optional `photo_url`, `notes`
- Features:
  - location auto-detection (`expo-location`)
  - image upload picker (`expo-image-picker`)
  - offline report queue with automatic sync on reconnect
  - multilingual UI (`en`, `hi`)
  - alert view and local notification trigger

### 2) Water Quality Monitoring
- API endpoint: `POST /waterdata`, `GET /waterdata`
- Ingests:
  - `ph`, `turbidity`, `temperature`, `dissolved_oxygen`, `ecoli_presence`, `tds`, `chlorine_level`
  - timestamp and coordinates

### 3) Disease Risk Prediction Model
- RandomForestClassifier pipeline with:
  - dataset simulation script
  - model training script
  - metric generation (accuracy, precision, recall, f1-score)
  - saved model artifact
- API endpoint: `POST /predict-risk`
- Risk output levels: `LOW`, `MEDIUM`, `HIGH`

### 4) Early Warning Alert System
- On high-risk predictions, system creates alerts and triggers notification channels:
  - email
  - push (stub for FCM/APNS)
  - SMS (stub for provider integration)
  - dashboard alerts
- API endpoint: `GET /alerts`

### 5) Health Authority Dashboard (React)
- Real-time disease and sensor monitoring (WebSocket stream)
- Components:
  - stats cards
  - symptom trend chart
  - water quality trend chart
  - outbreak probability chart
  - risk distribution chart
  - map for risk zones and contaminated sources
  - alert panel
  - CSV export for reports and alerts

### 6) Database Tables
- `users`
- `symptom_reports`
- `water_quality`
- `predictions`
- `alerts`

### 7) API Endpoints

#### Auth
- `POST /register`
- `POST /login`

#### Reports
- `POST /report-symptom`
- `GET /reports`
- `GET /reports/export/csv`

#### Water Data
- `POST /waterdata`
- `GET /waterdata`

#### Prediction
- `POST /predict-risk`
- `GET /risk-map`

#### Alerts
- `GET /alerts`
- `POST /alerts/{alert_id}/read`
- `GET /alerts/export/csv`

#### Monitoring
- `GET /health`
- `WS /ws/monitor`

### 8) ML Pipeline Steps
1. Data collection (simulated dataset + incoming sensor/report data)
2. Preprocessing
3. Feature engineering
4. Model training (RandomForest)
5. Evaluation (accuracy/precision/recall/f1-score)
6. Deployment (model artifact loaded by API)

### 9) Visualization
- Symptom trend over time
- Water quality trends
- Outbreak probability trends
- Risk distribution

### 10) Map Visualization
- Outbreak clusters/risk points
- Contaminated sources markers (`ecoli_presence=true`)
- High-risk zones by color and radius

### 11) Security
- JWT authentication
- Password hashing (`bcrypt` via passlib)
- Request validation with Pydantic schemas

### 12) Additional Features
- SMS alert integration stub
- Offline symptom reporting queue + background sync
- Multilingual mobile support
- Admin analytics in dashboard cards/charts

### 13) Bonus AI Features
- TensorFlow LSTM script for outbreak time-series forecasting
- IsolationForest anomaly detection for water quality
- DBSCAN hotspot clustering utility

## Local Setup (Option A: Docker)

### Prerequisites
- Docker + Docker Compose

### Run
```bash
docker compose up --build
```

Services:
- Backend API: `http://localhost:8000`
- Web Dashboard: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

Default admin account auto-created at backend startup:
- Email: `admin@healthmonitor.org`
- Password: `ChangeMe123!`

## Local Setup (Option B: Manual)

### 1) Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 ml_model/simulate_dataset.py
python3 ml_model/train_random_forest.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Optional demo dataset for dashboard:
```bash
python3 utils/seed_demo_data.py
```

### 2) Web Dashboard
```bash
cd frontend-web
npm install
cp .env.example .env
npm run dev
```
Open: `http://localhost:5173`

### 3) Mobile App
```bash
cd mobile-app
npm install
npm run start
```
- Open in Expo Go (Android/iOS) or emulator.
- For real devices, set `mobile-app/app.json -> expo.extra.apiBaseUrl` to your machine LAN IP, e.g. `http://192.168.1.10:8000`.

## ML Scripts

From `/backend`:

### Dataset Simulation
```bash
python3 ml_model/simulate_dataset.py
```

### RandomForest Training
```bash
python3 ml_model/train_random_forest.py
```
Outputs:
- `backend/ml_model/models/rf_risk_model.joblib`
- `backend/ml_model/models/rf_metrics.json`

### Bonus Models
```bash
pip install -r requirements-ml.txt
python3 ml_model/lstm_timeseries.py
python3 ml_model/anomaly_detection.py
python3 ml_model/hotspot_clustering.py
```

## Example Prediction Request

```bash
curl -X POST http://localhost:8000/predict-risk \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "ph": 6.2,
    "turbidity": 12.5,
    "temperature": 31.2,
    "ecoli": 1,
    "number_of_symptom_reports": 19,
    "population_density": 8600,
    "rainfall": 140
  }'
```

## AWS/GCP Readiness

- Containerized services (`backend`, `frontend`, `db`)
- Kubernetes manifests in `infra/k8s` for deployment bootstrap
- Stateless backend/frontend and externalized environment variables
- PostgreSQL can be replaced with managed RDS/Cloud SQL without code changes

## Next Production Hardening Steps

1. Add Alembic migrations and migration CI checks.
2. Replace notification stubs with SNS/Twilio/FCM integrations.
3. Add object storage for photos (S3/GCS) and signed URL upload flow.
4. Add role-based authorization policies per endpoint.
5. Add test suites (API unit/integration, UI E2E, mobile flows).
6. Add observability: OpenTelemetry traces, metrics, centralized logs.
7. Add background workers for scheduled retraining and alert dispatching.
