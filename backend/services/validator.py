import io
import pandas as pd
import numpy as np
from datetime import datetime

REQUIRED_COLUMNS = ['observation_date', 'location', 'temperature', 'humidity', 'rainfall']

class WeatherDataValidator:
    def __init__(self, existing_records_lookup=None):
        """
        existing_records_lookup: optional set of (location, date_str) tuples already in the DB
        """
        self.existing_records_lookup = existing_records_lookup or set()

    def validate_csv(self, file_content_or_path, is_bytes=True):
        """
        Validates CSV content thoroughly according to all meteorological constraints.
        Does NOT silently replace missing values with zero.
        """
        issues = []
        valid_records = []
        preview_rows = []
        
        try:
            if is_bytes:
                df_raw = pd.read_csv(io.BytesIO(file_content_or_path), dtype=str, skip_blank_lines=True)
            else:
                df_raw = pd.read_csv(file_content_or_path, dtype=str, skip_blank_lines=True)
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to parse CSV file: {str(e)}",
                "total_rows": 0,
                "valid_rows": 0,
                "invalid_rows": 0,
                "duplicate_rows": 0,
                "issues": [{"row_number": 0, "column_name": "file", "issue_type": "MALFORMED_FILE", "raw_value": "", "error_message": str(e), "severity": "error"}],
                "preview": []
            }

        # Normalize column headers (strip spaces, lowercase)
        column_mapping = {col: col.strip().lower().replace(" ", "_") for col in df_raw.columns}
        df_raw.rename(columns=column_mapping, inplace=True)

        # Check for required columns
        missing_columns = [col for col in REQUIRED_COLUMNS if col not in df_raw.columns]
        if missing_columns:
            return {
                "success": False,
                "error": f"Missing required column(s): {', '.join(missing_columns)}. Expected: {', '.join(REQUIRED_COLUMNS)}",
                "total_rows": len(df_raw),
                "valid_rows": 0,
                "invalid_rows": len(df_raw),
                "duplicate_rows": 0,
                "issues": [{"row_number": 0, "column_name": "header", "issue_type": "MISSING_COLUMNS", "raw_value": str(list(df_raw.columns)), "error_message": f"Expected columns: {', '.join(REQUIRED_COLUMNS)}", "severity": "error"}],
                "preview": []
            }

        seen_in_batch = set()
        missing_counts = {"observation_date": 0, "location": 0, "temperature": 0, "humidity": 0, "rainfall": 0}
        issue_counts = {
            "MISSING_VALUE": 0,
            "OUT_OF_RANGE": 0,
            "NEGATIVE_RAINFALL": 0,
            "INVALID_DATE": 0,
            "DUPLICATE_ENTRY": 0,
            "NON_NUMERIC": 0
        }
        duplicate_count = 0
        invalid_count = 0

        total_rows = len(df_raw)

        for idx, row in df_raw.iterrows():
            row_num = idx + 2 # 1-indexed including CSV header
            row_issues = []
            has_fatal_error = False
            
            raw_date = str(row.get('observation_date', '')).strip()
            raw_loc = str(row.get('location', '')).strip()
            raw_temp = str(row.get('temperature', '')).strip()
            raw_hum = str(row.get('humidity', '')).strip()
            raw_rain = str(row.get('rainfall', '')).strip()

            # 1. Location Validation
            clean_loc = None
            if not raw_loc or raw_loc.lower() in ('nan', 'none', 'null', ''):
                missing_counts["location"] += 1
                issue_counts["MISSING_VALUE"] += 1
                row_issues.append({
                    "row_number": row_num,
                    "column_name": "location",
                    "issue_type": "MISSING_VALUE",
                    "raw_value": raw_loc,
                    "error_message": "Location name is missing or empty.",
                    "severity": "error"
                })
                has_fatal_error = True
            else:
                clean_loc = raw_loc

            # 2. Date Validation
            clean_date = None
            if not raw_date or raw_date.lower() in ('nan', 'none', 'null', ''):
                missing_counts["observation_date"] += 1
                issue_counts["MISSING_VALUE"] += 1
                row_issues.append({
                    "row_number": row_num,
                    "column_name": "observation_date",
                    "issue_type": "MISSING_VALUE",
                    "raw_value": raw_date,
                    "error_message": "Observation date is missing.",
                    "severity": "error"
                })
                has_fatal_error = True
            else:
                try:
                    parsed_dt = pd.to_datetime(raw_date, errors='raise')
                    clean_date = parsed_dt.strftime('%Y-%m-%d')
                except Exception:
                    issue_counts["INVALID_DATE"] += 1
                    row_issues.append({
                        "row_number": row_num,
                        "column_name": "observation_date",
                        "issue_type": "INVALID_DATE",
                        "raw_value": raw_date,
                        "error_message": f"Unable to parse date '{raw_date}'. Use ISO format YYYY-MM-DD or standard date format.",
                        "severity": "error"
                    })
                    has_fatal_error = True

            # 3. Duplicate Detection (within batch & in existing DB)
            if clean_loc and clean_date:
                key = (clean_loc.lower(), clean_date)
                if key in seen_in_batch:
                    duplicate_count += 1
                    issue_counts["DUPLICATE_ENTRY"] += 1
                    row_issues.append({
                        "row_number": row_num,
                        "column_name": "observation_date",
                        "issue_type": "DUPLICATE_ENTRY",
                        "raw_value": f"{clean_loc} on {clean_date}",
                        "error_message": f"Duplicate observation for location '{clean_loc}' on date '{clean_date}' within this file.",
                        "severity": "error"
                    })
                    has_fatal_error = True
                elif key in self.existing_records_lookup:
                    duplicate_count += 1
                    issue_counts["DUPLICATE_ENTRY"] += 1
                    row_issues.append({
                        "row_number": row_num,
                        "column_name": "observation_date",
                        "issue_type": "DUPLICATE_ENTRY",
                        "raw_value": f"{clean_loc} on {clean_date}",
                        "error_message": f"Record for '{clean_loc}' on {clean_date} already exists in database.",
                        "severity": "error"
                    })
                    has_fatal_error = True
                else:
                    seen_in_batch.add(key)

            # 4. Temperature Validation (°C)
            clean_temp = None
            if not raw_temp or raw_temp.lower() in ('nan', 'none', 'null', ''):
                missing_counts["temperature"] += 1
                issue_counts["MISSING_VALUE"] += 1
                row_issues.append({
                    "row_number": row_num,
                    "column_name": "temperature",
                    "issue_type": "MISSING_VALUE",
                    "raw_value": raw_temp,
                    "error_message": "Temperature measurement is missing (not assumed to be 0°C).",
                    "severity": "warning"
                })
            else:
                try:
                    clean_temp = float(raw_temp)
                    if clean_temp < -90.0 or clean_temp > 65.0:
                        issue_counts["OUT_OF_RANGE"] += 1
                        row_issues.append({
                            "row_number": row_num,
                            "column_name": "temperature",
                            "issue_type": "OUT_OF_RANGE",
                            "raw_value": raw_temp,
                            "error_message": f"Temperature {clean_temp}°C is outside realistic terrestrial limits (-90°C to 65°C).",
                            "severity": "warning"
                        })
                except ValueError:
                    issue_counts["NON_NUMERIC"] += 1
                    row_issues.append({
                        "row_number": row_num,
                        "column_name": "temperature",
                        "issue_type": "NON_NUMERIC",
                        "raw_value": raw_temp,
                        "error_message": f"Temperature '{raw_temp}' is not a valid decimal number.",
                        "severity": "error"
                    })
                    has_fatal_error = True

            # 5. Humidity Validation (%)
            clean_hum = None
            if not raw_hum or raw_hum.lower() in ('nan', 'none', 'null', ''):
                missing_counts["humidity"] += 1
                issue_counts["MISSING_VALUE"] += 1
                row_issues.append({
                    "row_number": row_num,
                    "column_name": "humidity",
                    "issue_type": "MISSING_VALUE",
                    "raw_value": raw_hum,
                    "error_message": "Humidity measurement is missing.",
                    "severity": "warning"
                })
            else:
                try:
                    clean_hum = float(raw_hum)
                    if clean_hum < 0.0 or clean_hum > 100.0:
                        issue_counts["OUT_OF_RANGE"] += 1
                        row_issues.append({
                            "row_number": row_num,
                            "column_name": "humidity",
                            "issue_type": "OUT_OF_RANGE",
                            "raw_value": raw_hum,
                            "error_message": f"Humidity {clean_hum}% must be between 0% and 100%.",
                            "severity": "error"
                        })
                        has_fatal_error = True
                except ValueError:
                    issue_counts["NON_NUMERIC"] += 1
                    row_issues.append({
                        "row_number": row_num,
                        "column_name": "humidity",
                        "issue_type": "NON_NUMERIC",
                        "raw_value": raw_hum,
                        "error_message": f"Humidity '{raw_hum}' is not a valid number.",
                        "severity": "error"
                    })
                    has_fatal_error = True

            # 6. Rainfall Validation (mm)
            clean_rain = None
            if not raw_rain or raw_rain.lower() in ('nan', 'none', 'null', ''):
                missing_counts["rainfall"] += 1
                issue_counts["MISSING_VALUE"] += 1
                row_issues.append({
                    "row_number": row_num,
                    "column_name": "rainfall",
                    "issue_type": "MISSING_VALUE",
                    "raw_value": raw_rain,
                    "error_message": "Rainfall measurement is missing (distinguished from 0 mm dry day).",
                    "severity": "warning"
                })
            else:
                try:
                    clean_rain = float(raw_rain)
                    if clean_rain < 0.0:
                        issue_counts["NEGATIVE_RAINFALL"] += 1
                        row_issues.append({
                            "row_number": row_num,
                            "column_name": "rainfall",
                            "issue_type": "NEGATIVE_RAINFALL",
                            "raw_value": raw_rain,
                            "error_message": f"Negative rainfall ({clean_rain} mm) is physically impossible.",
                            "severity": "error"
                        })
                        has_fatal_error = True
                    elif clean_rain > 2000.0: # Extreme event warning
                        issue_counts["OUT_OF_RANGE"] += 1
                        row_issues.append({
                            "row_number": row_num,
                            "column_name": "rainfall",
                            "issue_type": "OUT_OF_RANGE",
                            "raw_value": raw_rain,
                            "error_message": f"Rainfall {clean_rain} mm exceeds maximum plausible daily rainfall.",
                            "severity": "warning"
                        })
                except ValueError:
                    issue_counts["NON_NUMERIC"] += 1
                    row_issues.append({
                        "row_number": row_num,
                        "column_name": "rainfall",
                        "issue_type": "NON_NUMERIC",
                        "raw_value": raw_rain,
                        "error_message": f"Rainfall '{raw_rain}' is not a valid number.",
                        "severity": "error"
                    })
                    has_fatal_error = True

            # At least one metric must be present
            if clean_temp is None and clean_hum is None and clean_rain is None:
                has_fatal_error = True
                row_issues.append({
                    "row_number": row_num,
                    "column_name": "general",
                    "issue_type": "MISSING_VALUE",
                    "raw_value": "All metrics empty",
                    "error_message": "Row has no weather observations at all.",
                    "severity": "error"
                })

            if has_fatal_error:
                invalid_count += 1
            else:
                valid_records.append({
                    "observation_date": clean_date,
                    "location": clean_loc,
                    "temperature": clean_temp,
                    "humidity": clean_hum,
                    "rainfall": clean_rain
                })

            # Record preview for first 20 rows
            if idx < 20:
                preview_rows.append({
                    "row_number": row_num,
                    "observation_date": raw_date,
                    "location": raw_loc,
                    "temperature": raw_temp,
                    "humidity": raw_hum,
                    "rainfall": raw_rain,
                    "status": "invalid" if has_fatal_error else ("warning" if len(row_issues) > 0 else "valid"),
                    "issues": [iss["error_message"] for iss in row_issues]
                })

            issues.extend(row_issues)

        valid_count = len(valid_records)

        # Generate cleaned CSV string
        cleaned_csv = ""
        if valid_records:
            df_clean = pd.DataFrame(valid_records)
            cleaned_csv = df_clean.to_csv(index=False)

        # Generate validation error report CSV string
        report_csv = ""
        if issues:
            df_issues = pd.DataFrame(issues)
            report_csv = df_issues.to_csv(index=False)

        return {
            "success": True,
            "total_rows": total_rows,
            "valid_rows": valid_count,
            "invalid_rows": invalid_count,
            "duplicate_rows": duplicate_count,
            "missing_values": missing_counts,
            "issues_by_type": issue_counts,
            "preview": preview_rows,
            "issues": issues[:200], # return first 200 issues to keep response fast
            "total_issues_count": len(issues),
            "valid_records": valid_records,
            "cleaned_csv": cleaned_csv,
            "report_csv": report_csv,
            "can_import": valid_count > 0
        }
