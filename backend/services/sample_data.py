import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path

LOCATIONS_PROFILES = {
    "Seattle, WA": {"base_temp": 14, "temp_var": 7, "base_hum": 75, "hum_var": 15, "rain_prob": 0.45, "rain_max": 28.0},
    "Miami, FL": {"base_temp": 28, "temp_var": 4, "base_hum": 80, "hum_var": 12, "rain_prob": 0.40, "rain_max": 45.0},
    "Denver, CO": {"base_temp": 12, "temp_var": 12, "base_hum": 42, "hum_var": 18, "rain_prob": 0.20, "rain_max": 18.0},
    "Phoenix, AZ": {"base_temp": 32, "temp_var": 9, "base_hum": 25, "hum_var": 15, "rain_prob": 0.08, "rain_max": 12.0},
    "London, UK": {"base_temp": 13, "temp_var": 6, "base_hum": 78, "hum_var": 14, "rain_prob": 0.38, "rain_max": 22.0},
    "Tokyo, JP": {"base_temp": 19, "temp_var": 8, "base_hum": 68, "hum_var": 16, "rain_prob": 0.35, "rain_max": 38.0}
}

def generate_sample_weather_csv(output_path=None, days=210):
    """
    Generates realistic historical observations across 6 global locations over several months.
    Includes realistic dry days (0.0 mm) and occasional missing values to validate handling.
    """
    random.seed(42)
    np.random.seed(42)
    
    start_date = datetime(2026, 1, 1)
    records = []

    for day_offset in range(days):
        current_date = (start_date + timedelta(days=day_offset)).strftime('%Y-%m-%d')
        month = (start_date + timedelta(days=day_offset)).month
        
        # Seasonal sinusoidal modifier
        seasonal_temp_shift = 6 * np.sin((month - 4) / 12 * 2 * np.pi)

        for loc, profile in LOCATIONS_PROFILES.items():
            # Temperature
            temp = round(profile["base_temp"] + seasonal_temp_shift + random.gauss(0, profile["temp_var"]), 1)
            
            # Humidity (clamped 15% - 98%)
            hum = round(min(98.0, max(15.0, profile["base_hum"] + random.gauss(0, profile["hum_var"]))), 1)

            # Rainfall
            has_rain = random.random() < profile["rain_prob"]
            if has_rain:
                # Exponential distribution for realistic rainfall amounts
                rain = round(random.expovariate(1.0 / (profile["rain_max"] / 3)), 1)
                rain = min(rain, profile["rain_max"])
            else:
                rain = 0.0  # Explicit 0 mm recorded rainfall

            # Subtle real-world missing measurements (< 1.5% chance) to verify proper missing value handling
            temp_val = "" if random.random() < 0.012 else str(temp)
            hum_val = "" if random.random() < 0.015 else str(hum)
            rain_val = "" if random.random() < 0.010 else str(rain)

            records.append({
                "observation_date": current_date,
                "location": loc,
                "temperature": temp_val,
                "humidity": hum_val,
                "rainfall": rain_val
            })

    df = pd.DataFrame(records)
    
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)

    return df
