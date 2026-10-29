-- Weather Data Analysis System Schema
-- Database: weather_analysis

CREATE DATABASE IF NOT EXISTS weather_analysis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE weather_analysis;

-- 1. Dataset Imports Tracking Table
CREATE TABLE IF NOT EXISTS dataset_imports (
    import_id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    invalid_rows INT NOT NULL DEFAULT 0,
    duplicate_rows INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    notes TEXT NULL,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Weather Records Main Table
CREATE TABLE IF NOT EXISTS weather_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    import_id INT NULL,
    observation_date DATE NOT NULL,
    location VARCHAR(150) NOT NULL,
    temperature DECIMAL(6,2) NULL, -- in °C
    humidity DECIMAL(5,2) NULL,    -- in % (0 - 100)
    rainfall DECIMAL(8,2) NULL,    -- in mm (>= 0)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_records_import FOREIGN KEY (import_id) 
        REFERENCES dataset_imports(import_id) ON DELETE SET NULL,
    CONSTRAINT uq_record_loc_date UNIQUE (location, observation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Data Quality Issues Log Table
CREATE TABLE IF NOT EXISTS data_quality_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    import_id INT NULL,
    row_number INT NOT NULL,
    column_name VARCHAR(100) NULL,
    issue_type VARCHAR(100) NOT NULL, 
    -- e.g. MISSING_VALUE, OUT_OF_RANGE, NEGATIVE_RAINFALL, INVALID_DATE, DUPLICATE_ENTRY, NON_NUMERIC
    raw_value TEXT NULL,
    error_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_import FOREIGN KEY (import_id) 
        REFERENCES dataset_imports(import_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance Indexes
CREATE INDEX idx_weather_date ON weather_records(observation_date);
CREATE INDEX idx_weather_location ON weather_records(location);
CREATE INDEX idx_weather_loc_date ON weather_records(location, observation_date);
CREATE INDEX idx_quality_import_issue ON data_quality_logs(import_id, issue_type);
