import pandas as pd
import numpy as np
from datetime import datetime

class WeatherAnalyticsService:
    def __init__(self, db_manager):
        self.db = db_manager

    def _get_dataframe(self, location=None, start_date=None, end_date=None):
        """Fetches records from the database and returns a sanitized Pandas DataFrame."""
        query = "SELECT record_id, observation_date, location, temperature, humidity, rainfall FROM weather_records WHERE 1=1"
        params = []

        if location and location.lower() != 'all':
            query += " AND location = %s"
            params.append(location)

        if start_date:
            query += " AND observation_date >= %s"
            params.append(start_date)

        if end_date:
            query += " AND observation_date <= %s"
            params.append(end_date)

        query += " ORDER BY observation_date ASC, location ASC"
        records = self.db.execute_query(query, params, fetchall=True)

        if not records:
            return pd.DataFrame(columns=['record_id', 'observation_date', 'location', 'temperature', 'humidity', 'rainfall'])

        df = pd.DataFrame(records)
        df['observation_date'] = pd.to_datetime(df['observation_date'])
        df['temperature'] = pd.to_numeric(df['temperature'], errors='coerce')
        df['humidity'] = pd.to_numeric(df['humidity'], errors='coerce')
        df['rainfall'] = pd.to_numeric(df['rainfall'], errors='coerce')
        return df

    def get_locations_and_dates(self):
        """Returns all distinct locations and min/max available dates."""
        loc_rows = self.db.execute_query("SELECT DISTINCT location FROM weather_records ORDER BY location ASC", fetchall=True)
        date_row = self.db.execute_query("SELECT MIN(observation_date) as min_date, MAX(observation_date) as max_date, COUNT(*) as total FROM weather_records", fetchone=True)
        
        locations = [r['location'] for r in loc_rows] if loc_rows else []
        min_date = str(date_row['min_date']) if date_row and date_row['min_date'] else None
        max_date = str(date_row['max_date']) if date_row and date_row['max_date'] else None
        total = date_row['total'] if date_row and date_row['total'] else 0

        return {
            "locations": locations,
            "min_date": min_date,
            "max_date": max_date,
            "total_records": total
        }

    def get_kpis(self, location=None, start_date=None, end_date=None):
        """Calculates dynamic KPI cards values."""
        df = self._get_dataframe(location, start_date, end_date)
        if df.empty:
            return {
                "total_observations": 0,
                "avg_temperature": None,
                "max_temperature": None,
                "min_temperature": None,
                "avg_humidity": None,
                "total_rainfall": 0.0,
                "avg_rainfall": 0.0,
                "locations_count": 0,
                "date_range": {"start": None, "end": None}
            }

        temp_series = df['temperature'].dropna()
        hum_series = df['humidity'].dropna()
        rain_series = df['rainfall'].dropna()

        return {
            "total_observations": int(len(df)),
            "avg_temperature": round(float(temp_series.mean()), 1) if not temp_series.empty else None,
            "max_temperature": round(float(temp_series.max()), 1) if not temp_series.empty else None,
            "min_temperature": round(float(temp_series.min()), 1) if not temp_series.empty else None,
            "avg_humidity": round(float(hum_series.mean()), 1) if not hum_series.empty else None,
            "total_rainfall": round(float(rain_series.sum()), 1) if not rain_series.empty else 0.0,
            "avg_rainfall": round(float(rain_series.mean()), 2) if not rain_series.empty else 0.0,
            "locations_count": int(df['location'].nunique()),
            "date_range": {
                "start": df['observation_date'].min().strftime('%Y-%m-%d'),
                "end": df['observation_date'].max().strftime('%Y-%m-%d')
            }
        }

    def get_overview_analytics(self, location=None, start_date=None, end_date=None):
        """Returns consolidated data for the main overview dashboard."""
        df = self._get_dataframe(location, start_date, end_date)
        kpis = self.get_kpis(location, start_date, end_date)
        if df.empty:
            return {"kpis": kpis, "daily_trends": [], "recent_records": []}

        # Daily aggregate for trend preview
        daily = df.groupby(df['observation_date'].dt.strftime('%Y-%m-%d')).agg({
            'temperature': 'mean',
            'humidity': 'mean',
            'rainfall': 'sum'
        }).reset_index()

        daily_trends = []
        for _, row in daily.iterrows():
            daily_trends.append({
                "date": row['observation_date'],
                "avg_temp": round(row['temperature'], 1) if pd.notna(row['temperature']) else None,
                "avg_humidity": round(row['humidity'], 1) if pd.notna(row['humidity']) else None,
                "total_rainfall": round(row['rainfall'], 1) if pd.notna(row['rainfall']) else 0.0
            })

        # Recent 10 records
        recent_df = df.sort_values(by='observation_date', ascending=False).head(10)
        recent_records = []
        for _, r in recent_df.iterrows():
            recent_records.append({
                "record_id": int(r['record_id']),
                "date": r['observation_date'].strftime('%Y-%m-%d'),
                "location": r['location'],
                "temperature": round(r['temperature'], 1) if pd.notna(r['temperature']) else None,
                "humidity": round(r['humidity'], 1) if pd.notna(r['humidity']) else None,
                "rainfall": round(r['rainfall'], 1) if pd.notna(r['rainfall']) else None
            })

        return {
            "kpis": kpis,
            "daily_trends": daily_trends,
            "recent_records": recent_records
        }

    def get_temperature_analytics(self, location=None, start_date=None, end_date=None):
        """Calculates temperature analytics: trend, monthly, stats, extremes, distribution."""
        df = self._get_dataframe(location, start_date, end_date)
        if df.empty or df['temperature'].dropna().empty:
            return {"stats": {}, "daily_trend": [], "monthly_avg": [], "location_comparison": [], "histogram": [], "extremes": {}}

        temp_valid = df.dropna(subset=['temperature']).copy()

        # Stats
        stats = {
            "mean": round(float(temp_valid['temperature'].mean()), 2),
            "median": round(float(temp_valid['temperature'].median()), 2),
            "std": round(float(temp_valid['temperature'].std()), 2) if len(temp_valid) > 1 else 0.0,
            "min": round(float(temp_valid['temperature'].min()), 2),
            "max": round(float(temp_valid['temperature'].max()), 2),
            "count": int(len(temp_valid))
        }

        # Extremes
        hottest_row = temp_valid.loc[temp_valid['temperature'].idxmax()]
        coldest_row = temp_valid.loc[temp_valid['temperature'].idxmin()]

        extremes = {
            "hottest": {
                "temperature": round(float(hottest_row['temperature']), 1),
                "date": hottest_row['observation_date'].strftime('%Y-%m-%d'),
                "location": hottest_row['location']
            },
            "coldest": {
                "temperature": round(float(coldest_row['temperature']), 1),
                "date": coldest_row['observation_date'].strftime('%Y-%m-%d'),
                "location": coldest_row['location']
            }
        }

        # Daily Trend
        daily = temp_valid.groupby(temp_valid['observation_date'].dt.strftime('%Y-%m-%d')).agg({
            'temperature': ['mean', 'min', 'max']
        }).reset_index()
        daily.columns = ['date', 'avg_temp', 'min_temp', 'max_temp']
        daily_trend = [
            {
                "date": r['date'],
                "avg_temp": round(r['avg_temp'], 1),
                "min_temp": round(r['min_temp'], 1),
                "max_temp": round(r['max_temp'], 1)
            } for _, r in daily.iterrows()
        ]

        # Monthly Average
        temp_valid['month'] = temp_valid['observation_date'].dt.strftime('%Y-%m')
        monthly = temp_valid.groupby('month').agg({
            'temperature': ['mean', 'min', 'max', 'count']
        }).reset_index()
        monthly.columns = ['month', 'avg_temp', 'min_temp', 'max_temp', 'count']
        monthly_avg = [
            {
                "month": r['month'],
                "avg_temp": round(r['avg_temp'], 1),
                "min_temp": round(r['min_temp'], 1),
                "max_temp": round(r['max_temp'], 1),
                "count": int(r['count'])
            } for _, r in monthly.iterrows()
        ]

        # Location comparison
        loc_group = temp_valid.groupby('location').agg({
            'temperature': ['mean', 'min', 'max', 'count']
        }).reset_index()
        loc_group.columns = ['location', 'avg_temp', 'min_temp', 'max_temp', 'count']
        loc_comparison = [
            {
                "location": r['location'],
                "avg_temp": round(r['avg_temp'], 1),
                "min_temp": round(r['min_temp'], 1),
                "max_temp": round(r['max_temp'], 1),
                "count": int(r['count'])
            } for _, r in loc_group.iterrows()
        ]

        # Temperature distribution histogram using NumPy
        counts, bin_edges = np.histogram(temp_valid['temperature'], bins=8)
        histogram = []
        for i in range(len(counts)):
            histogram.append({
                "range": f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}°C",
                "count": int(counts[i]),
                "bin_start": round(bin_edges[i], 1),
                "bin_end": round(bin_edges[i+1], 1)
            })

        return {
            "stats": stats,
            "extremes": extremes,
            "daily_trend": daily_trend,
            "monthly_avg": monthly_avg,
            "location_comparison": loc_comparison,
            "histogram": histogram
        }

    def get_humidity_analytics(self, location=None, start_date=None, end_date=None):
        """Calculates humidity analytics: daily trend, monthly average, min/max/avg, location comparison."""
        df = self._get_dataframe(location, start_date, end_date)
        if df.empty or df['humidity'].dropna().empty:
            return {"stats": {}, "daily_trend": [], "monthly_avg": [], "location_comparison": []}

        hum_valid = df.dropna(subset=['humidity']).copy()

        stats = {
            "mean": round(float(hum_valid['humidity'].mean()), 2),
            "median": round(float(hum_valid['humidity'].median()), 2),
            "min": round(float(hum_valid['humidity'].min()), 2),
            "max": round(float(hum_valid['humidity'].max()), 2),
            "std": round(float(hum_valid['humidity'].std()), 2) if len(hum_valid) > 1 else 0.0,
            "count": int(len(hum_valid))
        }

        # Daily Trend
        daily = hum_valid.groupby(hum_valid['observation_date'].dt.strftime('%Y-%m-%d')).agg({
            'humidity': ['mean', 'min', 'max']
        }).reset_index()
        daily.columns = ['date', 'avg_humidity', 'min_humidity', 'max_humidity']
        daily_trend = [
            {
                "date": r['date'],
                "avg_humidity": round(r['avg_humidity'], 1),
                "min_humidity": round(r['min_humidity'], 1),
                "max_humidity": round(r['max_humidity'], 1)
            } for _, r in daily.iterrows()
        ]

        # Monthly Average
        hum_valid['month'] = hum_valid['observation_date'].dt.strftime('%Y-%m')
        monthly = hum_valid.groupby('month').agg({
            'humidity': ['mean', 'min', 'max']
        }).reset_index()
        monthly.columns = ['month', 'avg_humidity', 'min_humidity', 'max_humidity']
        monthly_avg = [
            {
                "month": r['month'],
                "avg_humidity": round(r['avg_humidity'], 1),
                "min_humidity": round(r['min_humidity'], 1),
                "max_humidity": round(r['max_humidity'], 1)
            } for _, r in monthly.iterrows()
        ]

        # Location comparison
        loc_group = hum_valid.groupby('location').agg({
            'humidity': ['mean', 'min', 'max', 'count']
        }).reset_index()
        loc_group.columns = ['location', 'avg_humidity', 'min_humidity', 'max_humidity', 'count']
        loc_comparison = [
            {
                "location": r['location'],
                "avg_humidity": round(r['avg_humidity'], 1),
                "min_humidity": round(r['min_humidity'], 1),
                "max_humidity": round(r['max_humidity'], 1),
                "count": int(r['count'])
            } for _, r in loc_group.iterrows()
        ]

        return {
            "stats": stats,
            "daily_trend": daily_trend,
            "monthly_avg": monthly_avg,
            "location_comparison": loc_comparison
        }

    def get_rainfall_analytics(self, location=None, start_date=None, end_date=None):
        """Calculates rainfall analytics: totals, averages, daily trend, highest rain, zero-rain count."""
        df = self._get_dataframe(location, start_date, end_date)
        if df.empty or df['rainfall'].dropna().empty:
            return {"stats": {}, "daily_trend": [], "monthly_totals": [], "location_comparison": [], "extremes": {}}

        rain_valid = df.dropna(subset=['rainfall']).copy()
        
        # Zero rainfall vs positive rainfall count
        zero_rain_count = int((rain_valid['rainfall'] == 0.0).sum())
        rainy_days_count = int((rain_valid['rainfall'] > 0.0).sum())
        total_recorded = int(len(rain_valid))

        stats = {
            "total_rainfall": round(float(rain_valid['rainfall'].sum()), 1),
            "avg_rainfall": round(float(rain_valid['rainfall'].mean()), 2),
            "rainy_days_count": rainy_days_count,
            "zero_rainfall_count": zero_rain_count,
            "total_recorded_observations": total_recorded,
            "rainy_day_percentage": round((rainy_days_count / total_recorded) * 100, 1) if total_recorded > 0 else 0.0
        }

        # Highest rainfall observation
        highest_row = rain_valid.loc[rain_valid['rainfall'].idxmax()]
        extremes = {
            "highest": {
                "rainfall": round(float(highest_row['rainfall']), 1),
                "date": highest_row['observation_date'].strftime('%Y-%m-%d'),
                "location": highest_row['location']
            }
        }

        # Daily Trend
        daily = rain_valid.groupby(rain_valid['observation_date'].dt.strftime('%Y-%m-%d')).agg({
            'rainfall': 'sum'
        }).reset_index()
        daily_trend = [
            {
                "date": r['observation_date'],
                "rainfall": round(r['rainfall'], 1)
            } for _, r in daily.iterrows()
        ]

        # Monthly Totals
        rain_valid['month'] = rain_valid['observation_date'].dt.strftime('%Y-%m')
        monthly = rain_valid.groupby('month').agg({
            'rainfall': ['sum', 'mean', 'max']
        }).reset_index()
        monthly.columns = ['month', 'total_rainfall', 'avg_rainfall', 'max_rainfall']
        monthly_totals = [
            {
                "month": r['month'],
                "total_rainfall": round(r['total_rainfall'], 1),
                "avg_rainfall": round(r['avg_rainfall'], 2),
                "max_rainfall": round(r['max_rainfall'], 1)
            } for _, r in monthly.iterrows()
        ]

        # Location comparison
        loc_group = rain_valid.groupby('location').agg({
            'rainfall': ['sum', 'mean', 'max', lambda x: (x > 0).sum()]
        }).reset_index()
        loc_group.columns = ['location', 'total_rainfall', 'avg_rainfall', 'max_rainfall', 'rainy_days']
        loc_comparison = [
            {
                "location": r['location'],
                "total_rainfall": round(r['total_rainfall'], 1),
                "avg_rainfall": round(r['avg_rainfall'], 2),
                "max_rainfall": round(r['max_rainfall'], 1),
                "rainy_days": int(r['rainy_days'])
            } for _, r in loc_group.iterrows()
        ]

        return {
            "stats": stats,
            "extremes": extremes,
            "daily_trend": daily_trend,
            "monthly_totals": monthly_totals,
            "location_comparison": loc_comparison
        }

    def get_combined_weather_analysis(self, location=None, start_date=None, end_date=None):
        """Returns synchronized temperature, humidity, and rainfall on the same date timeline with separate axes."""
        df = self._get_dataframe(location, start_date, end_date)
        if df.empty:
            return {"timeline": [], "correlation": {}}

        daily = df.groupby(df['observation_date'].dt.strftime('%Y-%m-%d')).agg({
            'temperature': 'mean',
            'humidity': 'mean',
            'rainfall': 'sum'
        }).reset_index()

        timeline = []
        for _, r in daily.iterrows():
            timeline.append({
                "date": r['observation_date'],
                "temperature": round(r['temperature'], 1) if pd.notna(r['temperature']) else None,
                "humidity": round(r['humidity'], 1) if pd.notna(r['humidity']) else None,
                "rainfall": round(r['rainfall'], 1) if pd.notna(r['rainfall']) else 0.0
            })

        # Calculate Pearson correlations if sufficient valid data
        corr_matrix = {}
        valid_cols = df[['temperature', 'humidity', 'rainfall']].dropna()
        if len(valid_cols) > 3:
            corr = valid_cols.corr()
            corr_matrix = {
                "temp_humidity": round(float(corr.loc['temperature', 'humidity']), 2) if not np.isnan(corr.loc['temperature', 'humidity']) else 0.0,
                "temp_rainfall": round(float(corr.loc['temperature', 'rainfall']), 2) if not np.isnan(corr.loc['temperature', 'rainfall']) else 0.0,
                "humidity_rainfall": round(float(corr.loc['humidity', 'rainfall']), 2) if not np.isnan(corr.loc['humidity', 'rainfall']) else 0.0
            }

        return {
            "timeline": timeline,
            "correlation": corr_matrix
        }

    def get_monthly_report(self, year, month, location=None):
        """Generates a detailed monthly report with completeness and meteorology metrics."""
        month_str = f"{int(month):02d}"
        prefix = f"{year}-{month_str}"
        
        query = "SELECT record_id, observation_date, location, temperature, humidity, rainfall FROM weather_records WHERE observation_date LIKE %s"
        params = [f"{prefix}%"]
        
        if location and location.lower() != 'all':
            query += " AND location = %s"
            params.append(location)

        query += " ORDER BY observation_date ASC, location ASC"
        records = self.db.execute_query(query, params, fetchall=True)

        if not records:
            return {
                "year": year,
                "month": month_str,
                "location": location or "All Locations",
                "has_data": False,
                "message": f"No observations found for {year}-{month_str} ({location or 'All Locations'})."
            }

        df = pd.DataFrame(records)
        df['observation_date'] = pd.to_datetime(df['observation_date'])
        df['temperature'] = pd.to_numeric(df['temperature'], errors='coerce')
        df['humidity'] = pd.to_numeric(df['humidity'], errors='coerce')
        df['rainfall'] = pd.to_numeric(df['rainfall'], errors='coerce')

        total_obs = len(df)
        days_in_month = pd.Period(f"{year}-{month_str}").days_in_month
        unique_dates_observed = df['observation_date'].dt.day.nunique()
        completeness_pct = round((unique_dates_observed / days_in_month) * 100, 1)

        temp_clean = df['temperature'].dropna()
        hum_clean = df['humidity'].dropna()
        rain_clean = df['rainfall'].dropna()

        # Rainiest recorded day
        rainiest_day = None
        if not rain_clean.empty and rain_clean.max() > 0:
            max_rain_row = df.loc[df['rainfall'].idxmax()]
            rainiest_day = {
                "date": max_rain_row['observation_date'].strftime('%Y-%m-%d'),
                "rainfall": round(float(max_rain_row['rainfall']), 1),
                "location": max_rain_row['location']
            }

        # Daily Trend within the month
        daily = df.groupby(df['observation_date'].dt.strftime('%Y-%m-%d')).agg({
            'temperature': 'mean',
            'humidity': 'mean',
            'rainfall': 'sum'
        }).reset_index()

        daily_series = [
            {
                "date": r['observation_date'],
                "temperature": round(r['temperature'], 1) if pd.notna(r['temperature']) else None,
                "humidity": round(r['humidity'], 1) if pd.notna(r['humidity']) else None,
                "rainfall": round(r['rainfall'], 1) if pd.notna(r['rainfall']) else 0.0
            } for _, r in daily.iterrows()
        ]

        # Monthly comparison against other months in the same year
        year_query = "SELECT observation_date, temperature, humidity, rainfall FROM weather_records WHERE observation_date LIKE %s"
        year_records = self.db.execute_query(year_query, [f"{year}%"], fetchall=True)
        monthly_comparison = []
        if year_records:
            df_year = pd.DataFrame(year_records)
            df_year['month'] = pd.to_datetime(df_year['observation_date']).dt.strftime('%b')
            df_year['rainfall'] = pd.to_numeric(df_year['rainfall'], errors='coerce')
            df_year['temperature'] = pd.to_numeric(df_year['temperature'], errors='coerce')
            
            agg_year = df_year.groupby('month', sort=False).agg({
                'rainfall': 'sum',
                'temperature': 'mean'
            }).reset_index()

            for _, r in agg_year.iterrows():
                monthly_comparison.append({
                    "month": r['month'],
                    "rainfall": round(r['rainfall'], 1) if pd.notna(r['rainfall']) else 0.0,
                    "avg_temp": round(r['temperature'], 1) if pd.notna(r['temperature']) else None
                })

        return {
            "has_data": True,
            "year": year,
            "month": month_str,
            "month_name": datetime.strptime(f"{year}-{month_str}-01", "%Y-%m-%d").strftime("%B %Y"),
            "location": location or "All Locations",
            "observation_count": total_obs,
            "days_observed": unique_dates_observed,
            "days_in_month": days_in_month,
            "completeness_percentage": completeness_pct,
            "temperature": {
                "min": round(float(temp_clean.min()), 1) if not temp_clean.empty else None,
                "max": round(float(temp_clean.max()), 1) if not temp_clean.empty else None,
                "avg": round(float(temp_clean.mean()), 1) if not temp_clean.empty else None,
                "count": len(temp_clean)
            },
            "humidity": {
                "avg": round(float(hum_clean.mean()), 1) if not hum_clean.empty else None,
                "min": round(float(hum_clean.min()), 1) if not hum_clean.empty else None,
                "max": round(float(hum_clean.max()), 1) if not hum_clean.empty else None,
                "count": len(hum_clean)
            },
            "rainfall": {
                "total": round(float(rain_clean.sum()), 1) if not rain_clean.empty else 0.0,
                "avg_per_obs": round(float(rain_clean.mean()), 2) if not rain_clean.empty else 0.0,
                "rainiest_day": rainiest_day,
                "count": len(rain_clean)
            },
            "daily_trend": daily_series,
            "monthly_comparison": monthly_comparison,
            "completeness_info": {
                "temp_completeness": round((len(temp_clean) / total_obs) * 100, 1) if total_obs else 0.0,
                "humidity_completeness": round((len(hum_clean) / total_obs) * 100, 1) if total_obs else 0.0,
                "rainfall_completeness": round((len(rain_clean) / total_obs) * 100, 1) if total_obs else 0.0,
            }
        }

    def get_quality_dashboard(self):
        """Returns metrics for Data Quality Center."""
        # Query total imports
        imports = self.db.execute_query("SELECT * FROM dataset_imports ORDER BY imported_at DESC", fetchall=True)
        total_imported_rows = sum([imp.get('total_rows', 0) for imp in imports]) if imports else 0
        total_valid_rows = sum([imp.get('valid_rows', 0) for imp in imports]) if imports else 0
        total_invalid_rows = sum([imp.get('invalid_rows', 0) for imp in imports]) if imports else 0
        total_duplicate_rows = sum([imp.get('duplicate_rows', 0) for imp in imports]) if imports else 0

        # Query total active records in weather_records
        records_count = self.db.execute_query("SELECT COUNT(*) as count FROM weather_records", fetchone=True)
        current_active_records = records_count['count'] if records_count else 0

        # Query quality logs
        logs = self.db.execute_query("SELECT * FROM data_quality_logs ORDER BY created_at DESC LIMIT 300", fetchall=True)

        # Issue count by type from logs table
        issue_counts = {
            "MISSING_VALUE": 0,
            "OUT_OF_RANGE": 0,
            "NEGATIVE_RAINFALL": 0,
            "INVALID_DATE": 0,
            "DUPLICATE_ENTRY": 0,
            "NON_NUMERIC": 0
        }
        missing_by_field = {
            "temperature": 0,
            "humidity": 0,
            "rainfall": 0,
            "location": 0,
            "observation_date": 0
        }

        for log in logs:
            itype = log.get('issue_type')
            col = log.get('column_name')
            if itype in issue_counts:
                issue_counts[itype] += 1
            if itype == 'MISSING_VALUE' and col in missing_by_field:
                missing_by_field[col] += 1

        # Also inspect missing values currently stored as NULL in weather_records
        null_counts = self.db.execute_query("""
            SELECT 
                COUNT(*) - COUNT(temperature) as missing_temp,
                COUNT(*) - COUNT(humidity) as missing_hum,
                COUNT(*) - COUNT(rainfall) as missing_rain
            FROM weather_records
        """, fetchone=True)

        if null_counts:
            missing_by_field["temperature"] = max(missing_by_field["temperature"], null_counts.get("missing_temp", 0))
            missing_by_field["humidity"] = max(missing_by_field["humidity"], null_counts.get("missing_hum", 0))
            missing_by_field["rainfall"] = max(missing_by_field["rainfall"], null_counts.get("missing_rain", 0))

        # Health score calculation
        total_issues = sum(issue_counts.values())
        eval_base = max(total_imported_rows, current_active_records, 1)
        health_score = max(0, min(100, round(100 - (total_issues / (eval_base * 3)) * 100, 1)))

        return {
            "total_imports": len(imports) if imports else 0,
            "total_imported_rows": total_imported_rows,
            "valid_records": current_active_records,
            "invalid_records": total_invalid_rows,
            "duplicate_records": total_duplicate_rows,
            "missing_values_by_field": missing_by_field,
            "issue_counts": issue_counts,
            "health_score": health_score,
            "recent_logs": logs[:100],
            "import_history": imports[:10] if imports else []
        }
