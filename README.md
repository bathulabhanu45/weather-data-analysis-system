# 🌦️ Aetheria — Weather Data Analysis System

> **Enterprise-grade Weather Data Analysis & Quality Intelligence Platform** built with **React + Vite**, **Tailwind CSS**, **Recharts**, **Python Flask**, **Pandas**, **NumPy**, and **MySQL**.

---

## 🌟 Key Features

1. **Enterprise Midnight Aesthetics**:
   - Deep midnight navy palette (`#0B0F19`, `#0D1527`) with electric cyan & aqua glow accents (`#00f2fe`, `#38bdf8`).
   - Frosted-glass morphism cards with subtle borders and micro-interactions.
   - Clean dark-mode interface inspired by modern cloud analytics consoles.

2. **Meteorological Data Ingestion & Quality Gate**:
   - Drag-and-drop CSV uploader with upload progress and file analytics.
   - 20-row preview with validation status badges (`valid`, `warning`, `error`).
   - Physical bounds validation:
     - Humidity strictly validated between `0%` and `100%`.
     - Negative rainfall rejected as physically impossible.
     - Terrestrial temperature limits validated (-90°C to 65°C).
     - Missing measurements are explicitly preserved as `NULL` (never silently replaced with zero).
     - Duplicate observations for the same location and date prevented.
   - Download cleaned CSV and row-level error audit reports.
   - Safety confirmation modal before inserting into the database.

3. **Interactive Analytics Dashboards**:
   - **Overview Dashboard**: Dynamic KPI cards, multi-axis meteorological trend chart, recent observations.
   - **Temperature Analytics**: Daily envelope lines (Min/Max/Avg), monthly bar chart, distribution histogram, hottest and coldest observations.
   - **Humidity Analytics**: Daily humidity trend, monthly averages, location-wise relative humidity comparison.
   - **Rainfall Analytics**: Monthly totals, daily precipitation timelines, dry days (`0.0 mm`) vs rainy days count, highest rainfall observation.
   - **Combined Weather Analysis**: Simultaneous temperature, humidity, and rainfall plotted on separate independent axes to prevent unit distortion, with Pearson correlation analysis.

4. **Monthly Reports**:
   - Filter by year, month, and station.
   - Observation count, min/max/avg temperature, average humidity, total rainfall, and rainiest day.
   - **Data Completeness Meter**: Clearly warns when observations are partial to avoid misleading claims of complete monthly conditions.
   - Instant **CSV Export** and **Print / PDF Dossier generation**.

5. **Data Quality Center**:
   - Real-time **Data Health Index** score.
   - Sensor parameter missing-value breakdown.
   - Audit trail table reading from `data_quality_logs`.

6. **Weather Records Archive**:
   - High-performance data table with search, multi-column sorting, pagination, and range filters (temperature, humidity, rainfall).
   - CSV export of filtered records.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Recharts | Glassmorphic, responsive, high-performance UI |
| **Backend** | Python 3.13, Flask 3.1, Flask-CORS, PyMySQL | High-speed REST API & validation server |
| **Data Engine** | Pandas 3.1, NumPy 2.5 | Vectorized date parsing, cleaning, aggregation, histograms, correlation |
| **Database** | MySQL (with automatic embedded SQLite dev fallback) | Relational storage with foreign keys, indexes, and unique constraints |

---

## 🗄️ Database Schema (`schema.sql`)

The database is named `weather_analysis` and includes:

### 1. `weather_records`
- `record_id`: `INT PRIMARY KEY AUTO_INCREMENT`
- `import_id`: `INT NULL` (Foreign Key to `dataset_imports`)
- `observation_date`: `DATE NOT NULL`
- `location`: `VARCHAR(150) NOT NULL`
- `temperature`: `DECIMAL(6,2) NULL` (°C)
- `humidity`: `DECIMAL(5,2) NULL` (% RH)
- `rainfall`: `DECIMAL(8,2) NULL` (mm)
- `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- **Constraint**: `UNIQUE (location, observation_date)`

### 2. `dataset_imports`
- Tracks batch imports, filenames, row counts, valid/invalid/duplicate tallies, and timestamps.

### 3. `data_quality_logs`
- Detailed row-by-row audit trail recording `row_number`, `column_name`, `issue_type`, `raw_value`, and `error_message`.

> **Note on Database Connection**: The application connects to MySQL using standard parameters in `.env`. If MySQL is not running on your local machine, the backend seamlessly falls back to a local SQLite database (`backend/weather_analysis.db`) with identical tables and queries so the system works immediately out of the box with zero setup hurdles!

---

## 🚀 Quick Start Guide

### 1. Clone & Setup Python Virtual Environment

```bash
cd /Users/bhanu/Documents/weather

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

If you have MySQL running:
```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=weather_analysis
```

You can execute `backend/schema.sql` in MySQL, or let Flask initialize tables automatically on first startup.

### 3. Start the Backend API

```bash
./venv/bin/python3 -m backend.app
```
*API will run on [http://localhost:5001](http://localhost:5001).*

### 4. Start the React Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
*Frontend will open on [http://localhost:5173](http://localhost:5173).*

---

## 📊 Sample Data & Testing

- When the application starts, you can click **"Load Sample Weather Data"** on the Overview screen or in the Header to instantly populate 1,200+ realistic observations across 6 global stations (Seattle, Miami, Denver, Phoenix, London, Tokyo) covering 7 months.
- You can also download the sample CSV file from the **Import Weather Data** page to inspect the schema or upload your own datasets.

---

## 🛡️ Physical Bounds & Meteorological Logic

- **Physical Bounds**:
  - Humidity: `0 <= humidity <= 100` (values < 0 or > 100 are rejected).
  - Rainfall: `rainfall >= 0` (negative rainfall values are rejected).
  - Temperature: Terrestrial bounds -90°C to 65°C.
- **Strict NULL Handling**:
  - Missing measurements are retained as `NULL` and not assumed to be `0` (e.g. 0 mm rainfall indicates an explicit dry day, whereas a missing value indicates an unrecorded measurement).
- **Scope Notice**:
  - This system analyzes historical weather records only. It does not predict future weather.
