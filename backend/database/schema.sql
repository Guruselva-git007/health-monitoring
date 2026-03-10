CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS symptom_reports (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    symptoms JSONB NOT NULL,
    water_source_type VARCHAR(100) NOT NULL,
    household_size INTEGER NOT NULL,
    recent_travel BOOLEAN DEFAULT FALSE,
    photo_url VARCHAR(500),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS water_quality (
    id VARCHAR(36) PRIMARY KEY,
    collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ph DOUBLE PRECISION NOT NULL,
    turbidity DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    dissolved_oxygen DOUBLE PRECISION NOT NULL,
    ecoli_presence BOOLEAN NOT NULL,
    tds DOUBLE PRECISION NOT NULL,
    chlorine_level DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(36) PRIMARY KEY,
    predicted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ph DOUBLE PRECISION NOT NULL,
    turbidity DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    ecoli INTEGER NOT NULL,
    number_of_symptom_reports INTEGER NOT NULL,
    population_density DOUBLE PRECISION NOT NULL,
    rainfall DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(10) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    model_version VARCHAR(50) DEFAULT 'rf_v1',
    triggered_alert BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    channel VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    target_user_id VARCHAR(36) REFERENCES users(id),
    risk_prediction_id VARCHAR(36) REFERENCES predictions(id)
);

CREATE INDEX IF NOT EXISTS idx_symptom_reports_reported_at ON symptom_reports(reported_at);
CREATE INDEX IF NOT EXISTS idx_water_quality_collected_at ON water_quality(collected_at);
CREATE INDEX IF NOT EXISTS idx_predictions_predicted_at ON predictions(predicted_at);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
