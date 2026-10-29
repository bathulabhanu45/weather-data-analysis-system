import os
import io
import csv
from datetime import datetime
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from backend.config import Config
from backend.database import db
from backend.services.validator import WeatherDataValidator
from backend.services.analytics import WeatherAnalyticsService
from backend.services.sample_data import generate_sample_weather_csv

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend requests
CORS(app, resources={r"/api/*": {"origins": "*"}})

analytics = WeatherAnalyticsService(db)

# Ensure sample data exists on disk
if not Config.SAMPLE_DATA_PATH.exists():
    Config.SAMPLE_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    generate_sample_weather_csv(str(Config.SAMPLE_DATA_PATH), days=180)

# ----------------- Database & Meta Endpoints -----------------

@app.route('/api/database/status', methods=['GET'])
def get_db_status():
    """Returns the current database engine, connection state, and settings."""
    status = db.get_status()
    counts = db.execute_query("SELECT COUNT(*) as total FROM weather_records", fetchone=True)
    status["total_records"] = counts['total'] if counts else 0
    return jsonify({"success": True, "database": status})

@app.route('/api/meta/filters', methods=['GET'])
def get_filter_options():
    """Returns available locations and date boundaries for dashboard filtering."""
    try:
        data = analytics.get_locations_and_dates()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ----------------- Dashboard & Analytics Endpoints -----------------

@app.route('/api/dashboard/overview', methods=['GET'])
def get_overview():
    """Returns KPI cards, daily trend summaries, and recent records."""
    loc = request.args.get('location')
    start = request.args.get('start_date')
    end = request.args.get('end_date')

    try:
        data = analytics.get_overview_analytics(loc, start, end)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/temperature', methods=['GET'])
def get_temperature_analytics():
    """Returns temperature trends, monthly averages, extremes, and distribution histogram."""
    loc = request.args.get('location')
    start = request.args.get('start_date')
    end = request.args.get('end_date')

    try:
        data = analytics.get_temperature_analytics(loc, start, end)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/humidity', methods=['GET'])
def get_humidity_analytics():
    """Returns daily and monthly humidity trends, statistics, and location comparison."""
    loc = request.args.get('location')
    start = request.args.get('start_date')
    end = request.args.get('end_date')

    try:
        data = analytics.get_humidity_analytics(loc, start, end)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/rainfall', methods=['GET'])
def get_rainfall_analytics():
    """Returns rainfall metrics, daily trends, monthly totals, and zero-rain analysis."""
    loc = request.args.get('location')
    start = request.args.get('start_date')
    end = request.args.get('end_date')

    try:
        data = analytics.get_rainfall_analytics(loc, start, end)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/combined', methods=['GET'])
def get_combined_analytics():
    """Returns synchronized temperature, humidity, and rainfall on separate axes."""
    loc = request.args.get('location')
    start = request.args.get('start_date')
    end = request.args.get('end_date')

    try:
        data = analytics.get_combined_weather_analysis(loc, start, end)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/reports/monthly', methods=['GET'])
def get_monthly_report():
    """Generates monthly report with completeness information."""
    now = datetime.now()
    year = request.args.get('year', default=now.year, type=int)
    month = request.args.get('month', default=now.month, type=int)
    loc = request.args.get('location')

    try:
        report = analytics.get_monthly_report(year, month, loc)
        return jsonify({"success": True, "data": report})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/quality/dashboard', methods=['GET'])
def get_quality_dashboard():
    """Returns quality dashboard stats and issue breakdown."""
    try:
        data = analytics.get_quality_dashboard()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ----------------- Weather Records Table with Search, Filter & Pagination -----------------

@app.route('/api/records', methods=['GET'])
def get_records():
    """Fetches paginated, sorted, and filtered weather records."""
    search = request.args.get('search', '').strip()
    loc = request.args.get('location')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    min_temp = request.args.get('min_temp', type=float)
    max_temp = request.args.get('max_temp', type=float)
    min_hum = request.args.get('min_hum', type=float)
    max_hum = request.args.get('max_hum', type=float)
    min_rain = request.args.get('min_rain', type=float)
    max_rain = request.args.get('max_rain', type=float)

    sort_by = request.args.get('sort_by', 'observation_date')
    sort_order = request.args.get('sort_order', 'DESC').upper()
    if sort_order not in ('ASC', 'DESC'):
        sort_order = 'DESC'
    
    allowed_sort_fields = {
        'record_id': 'record_id',
        'observation_date': 'observation_date',
        'location': 'location',
        'temperature': 'temperature',
        'humidity': 'humidity',
        'rainfall': 'rainfall'
    }
    sort_column = allowed_sort_fields.get(sort_by, 'observation_date')

    page = max(1, request.args.get('page', default=1, type=int))
    page_size = min(100, max(5, request.args.get('page_size', default=15, type=int)))
    offset = (page - 1) * page_size

    # Build SQL
    base_where = " WHERE 1=1"
    params = []

    if search:
        base_where += " AND (location LIKE %s OR observation_date LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    if loc and loc.lower() != 'all':
        base_where += " AND location = %s"
        params.append(loc)

    if start_date:
        base_where += " AND observation_date >= %s"
        params.append(start_date)

    if end_date:
        base_where += " AND observation_date <= %s"
        params.append(end_date)

    if min_temp is not None:
        base_where += " AND temperature >= %s"
        params.append(min_temp)
    if max_temp is not None:
        base_where += " AND temperature <= %s"
        params.append(max_temp)

    if min_hum is not None:
        base_where += " AND humidity >= %s"
        params.append(min_hum)
    if max_hum is not None:
        base_where += " AND humidity <= %s"
        params.append(max_hum)

    if min_rain is not None:
        base_where += " AND rainfall >= %s"
        params.append(min_rain)
    if max_rain is not None:
        base_where += " AND rainfall <= %s"
        params.append(max_rain)

    # Count total
    count_sql = f"SELECT COUNT(*) as total FROM weather_records {base_where}"
    count_res = db.execute_query(count_sql, params, fetchone=True)
    total_records = count_res['total'] if count_res else 0

    # Query records with limit & offset
    query_sql = f"SELECT record_id, observation_date, location, temperature, humidity, rainfall FROM weather_records {base_where} ORDER BY {sort_column} {sort_order} LIMIT %s OFFSET %s"
    query_params = list(params) + [page_size, offset]
    rows = db.execute_query(query_sql, query_params, fetchall=True)

    records = []
    for r in rows:
        records.append({
            "record_id": r['record_id'],
            "observation_date": str(r['observation_date']),
            "location": r['location'],
            "temperature": float(r['temperature']) if r['temperature'] is not None else None,
            "humidity": float(r['humidity']) if r['humidity'] is not None else None,
            "rainfall": float(r['rainfall']) if r['rainfall'] is not None else None
        })

    total_pages = (total_records + page_size - 1) // page_size if total_records > 0 else 1

    return jsonify({
        "success": True,
        "data": {
            "records": records,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_records": total_records,
                "total_pages": total_pages
            }
        }
    })

# ----------------- Data Import & Validation Endpoints -----------------

@app.route('/api/upload-validate', methods=['POST'])
def upload_and_validate():
    """
    Validates uploaded CSV file without modifying database.
    Returns preview, validation summary, errors, and downloadable clean CSV data.
    """
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded."}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    if not file.filename.lower().endswith('.csv'):
        return jsonify({"success": False, "error": "Invalid format. Only CSV files are supported."}), 400

    try:
        content = file.read()
        file_size = len(content)

        # Build existing records lookup to flag duplicates against already stored observations
        existing_rows = db.execute_query("SELECT LOWER(location) as loc, observation_date FROM weather_records", fetchall=True)
        existing_lookup = set((r['loc'], str(r['observation_date'])) for r in existing_rows) if existing_rows else set()

        validator = WeatherDataValidator(existing_records_lookup=existing_lookup)
        result = validator.validate_csv(content, is_bytes=True)

        result["filename"] = file.filename
        result["file_size_bytes"] = file_size
        return jsonify({"success": True, "validation": result})
    except Exception as e:
        return jsonify({"success": False, "error": f"Validation failed: {str(e)}"}), 500

@app.route('/api/confirm-import', methods=['POST'])
def confirm_import():
    """
    Imports validated records and logs issues into database upon user confirmation.
    """
    data = request.get_json()
    if not data or 'records' not in data:
        return jsonify({"success": False, "error": "No valid records provided for import."}), 400

    filename = data.get('filename', 'uploaded_dataset.csv')
    file_size = data.get('file_size_bytes', 0)
    total_rows = data.get('total_rows', len(data['records']))
    invalid_rows = data.get('invalid_rows', 0)
    duplicate_rows = data.get('duplicate_rows', 0)
    records = data.get('records', [])
    issues = data.get('issues', [])

    if not records:
        return jsonify({"success": False, "error": "No valid records to import."}), 400

    try:
        conn, engine = db.get_connection()
        cur = conn.cursor()

        # 1. Insert into dataset_imports
        import_sql = """
        INSERT INTO dataset_imports (filename, file_size_bytes, total_rows, valid_rows, invalid_rows, duplicate_rows, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        if engine == "sqlite":
            import_sql = import_sql.replace("%s", "?")

        cur.execute(import_sql, (filename, file_size, total_rows, len(records), invalid_rows, duplicate_rows, "COMPLETED"))
        import_id = cur.lastrowid

        # 2. Bulk insert valid weather records
        insert_record_sql = """
        INSERT OR IGNORE INTO weather_records (import_id, observation_date, location, temperature, humidity, rainfall)
        VALUES (?, ?, ?, ?, ?, ?)
        """ if engine == "sqlite" else """
        INSERT IGNORE INTO weather_records (import_id, observation_date, location, temperature, humidity, rainfall)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        record_tuples = [
            (
                import_id,
                r['observation_date'],
                r['location'],
                r['temperature'],
                r['humidity'],
                r['rainfall']
            )
            for r in records
        ]

        cur.executemany(insert_record_sql, record_tuples)

        # 3. Log quality issues
        if issues:
            insert_log_sql = """
            INSERT INTO data_quality_logs (import_id, row_number, column_name, issue_type, raw_value, error_message)
            VALUES (?, ?, ?, ?, ?, ?)
            """ if engine == "sqlite" else """
            INSERT INTO data_quality_logs (import_id, row_number, column_name, issue_type, raw_value, error_message)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            log_tuples = [
                (
                    import_id,
                    iss.get('row_number', 0),
                    iss.get('column_name', 'general'),
                    iss.get('issue_type', 'UNKNOWN'),
                    str(iss.get('raw_value', ''))[:200],
                    str(iss.get('error_message', ''))[:500]
                )
                for iss in issues[:300]
            ]
            cur.executemany(insert_log_sql, log_tuples)

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Successfully imported {len(records)} records from {filename}.",
            "import_id": import_id,
            "imported_count": len(records)
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Database import failed: {str(e)}"}), 500

# ----------------- Sample Data & Reset Endpoints -----------------

@app.route('/api/data/seed-sample', methods=['POST'])
def seed_sample():
    """Generates and directly loads the official sample dataset into the database."""
    try:
        # Load sample csv
        df = generate_sample_weather_csv(str(Config.SAMPLE_DATA_PATH), days=210)
        
        # Read from file bytes into validator
        with open(Config.SAMPLE_DATA_PATH, 'rb') as f:
            content = f.read()

        validator = WeatherDataValidator()
        result = validator.validate_csv(content, is_bytes=True)

        if not result['valid_records']:
            return jsonify({"success": False, "error": "Sample data generation produced no valid records."}), 500

        # Import into DB
        conn, engine = db.get_connection()
        cur = conn.cursor()

        import_sql = "INSERT INTO dataset_imports (filename, file_size_bytes, total_rows, valid_rows, invalid_rows, duplicate_rows, status, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        if engine == "sqlite":
            import_sql = import_sql.replace("%s", "?")

        cur.execute(import_sql, ("sample_weather_data.csv", len(content), result['total_rows'], result['valid_rows'], result['invalid_rows'], result['duplicate_rows'], "COMPLETED", "Built-in realistic multi-location sample data"))
        import_id = cur.lastrowid

        insert_record_sql = "INSERT OR IGNORE INTO weather_records (import_id, observation_date, location, temperature, humidity, rainfall) VALUES (?, ?, ?, ?, ?, ?)" if engine == "sqlite" else "INSERT IGNORE INTO weather_records (import_id, observation_date, location, temperature, humidity, rainfall) VALUES (%s, %s, %s, %s, %s, %s)"

        record_tuples = [
            (import_id, r['observation_date'], r['location'], r['temperature'], r['humidity'], r['rainfall'])
            for r in result['valid_records']
        ]
        cur.executemany(insert_record_sql, record_tuples)

        # Log issues
        if result['issues']:
            insert_log_sql = "INSERT INTO data_quality_logs (import_id, row_number, column_name, issue_type, raw_value, error_message) VALUES (?, ?, ?, ?, ?, ?)" if engine == "sqlite" else "INSERT INTO data_quality_logs (import_id, row_number, column_name, issue_type, raw_value, error_message) VALUES (%s, %s, %s, %s, %s, %s)"
            log_tuples = [
                (import_id, iss['row_number'], iss['column_name'], iss['issue_type'], str(iss['raw_value'])[:200], str(iss['error_message'])[:500])
                for iss in result['issues'][:200]
            ]
            cur.executemany(insert_log_sql, log_tuples)

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Successfully loaded sample dataset ({len(result['valid_records'])} records across 6 locations).",
            "imported_count": len(result['valid_records'])
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to seed sample data: {str(e)}"}), 500

@app.route('/api/data/clear', methods=['POST'])
def clear_all_data():
    """Wipes all weather records, imports, and logs (for fresh start / testing)."""
    try:
        conn, engine = db.get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM weather_records")
        cur.execute("DELETE FROM data_quality_logs")
        cur.execute("DELETE FROM dataset_imports")
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "message": "All weather records and logs cleared."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ----------------- File Export Endpoints -----------------

@app.route('/api/export/sample', methods=['GET'])
def download_sample_csv():
    """Allows downloading the realistic multi-location sample CSV file."""
    if not Config.SAMPLE_DATA_PATH.exists():
        generate_sample_weather_csv(str(Config.SAMPLE_DATA_PATH), days=210)
    return send_file(Config.SAMPLE_DATA_PATH, as_attachment=True, download_name="sample_weather_data.csv", mimetype="text/csv")

@app.route('/api/export/records', methods=['GET'])
def export_records_csv():
    """Exports currently filtered records as a CSV stream."""
    search = request.args.get('search', '').strip()
    loc = request.args.get('location')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    base_where = " WHERE 1=1"
    params = []
    if search:
        base_where += " AND (location LIKE %s OR observation_date LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    if loc and loc.lower() != 'all':
        base_where += " AND location = %s"
        params.append(loc)
    if start_date:
        base_where += " AND observation_date >= %s"
        params.append(start_date)
    if end_date:
        base_where += " AND observation_date <= %s"
        params.append(end_date)

    query = f"SELECT record_id, observation_date, location, temperature, humidity, rainfall FROM weather_records {base_where} ORDER BY observation_date ASC"
    rows = db.execute_query(query, params, fetchall=True)

    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['record_id', 'observation_date', 'location', 'temperature_celsius', 'humidity_percent', 'rainfall_mm'])

    for r in rows:
        cw.writerow([
            r['record_id'],
            r['observation_date'],
            r['location'],
            r['temperature'] if r['temperature'] is not None else '',
            r['humidity'] if r['humidity'] is not None else '',
            r['rainfall'] if r['rainfall'] is not None else ''
        ])

    output = io.BytesIO(si.getvalue().encode('utf-8'))
    return send_file(
        output,
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"weather_records_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )

@app.route('/api/export/report-csv', methods=['GET'])
def export_monthly_report_csv():
    """Exports monthly report daily breakdown as CSV."""
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    loc = request.args.get('location')

    report = analytics.get_monthly_report(year, month, loc)
    if not report.get('has_data'):
        return jsonify({"success": False, "error": "No data available to export for this month."}), 404

    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow([f"Monthly Weather Report: {report['month_name']} - {report['location']}"])
    cw.writerow(["Generated At", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    cw.writerow(["Total Observations", report['observation_count']])
    cw.writerow(["Data Completeness", f"{report['completeness_percentage']}%"])
    cw.writerow([])
    cw.writerow(["Date", "Avg Temperature (°C)", "Avg Humidity (%)", "Total Rainfall (mm)"])

    for d in report['daily_trend']:
        cw.writerow([
            d['date'],
            d['temperature'] if d['temperature'] is not None else '',
            d['humidity'] if d['humidity'] is not None else '',
            d['rainfall'] if d['rainfall'] is not None else ''
        ])

    output = io.BytesIO(si.getvalue().encode('utf-8'))
    return send_file(
        output,
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"monthly_report_{year}_{month:02d}_{report['location'].replace(' ', '_')}.csv"
    )

if __name__ == '__main__':
    port = Config.PORT
    print(f"🚀 Starting Aetheria Weather Analysis API on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
