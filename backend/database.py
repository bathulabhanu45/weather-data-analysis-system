import sqlite3
import pymysql
import pymysql.cursors
import logging
from backend.config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Database")

class DatabaseManager:
    def __init__(self):
        self.engine_type = "unknown"
        self.is_connected = False
        self.connection_error = None
        self.init_db()

    def _test_mysql(self):
        """Attempts to connect to MySQL and initialize schema if available."""
        try:
            conn = pymysql.connect(
                host=Config.DB_HOST,
                port=Config.DB_PORT,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=3
            )
            with conn.cursor() as cur:
                cur.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            conn.select_db(Config.DB_NAME)
            
            # Create MySQL tables
            with conn.cursor() as cur:
                cur.execute("""
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                cur.execute("""
                CREATE TABLE IF NOT EXISTS weather_records (
                    record_id INT AUTO_INCREMENT PRIMARY KEY,
                    import_id INT NULL,
                    observation_date DATE NOT NULL,
                    location VARCHAR(150) NOT NULL,
                    temperature DECIMAL(6,2) NULL,
                    humidity DECIMAL(5,2) NULL,
                    rainfall DECIMAL(8,2) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_records_import FOREIGN KEY (import_id) 
                        REFERENCES dataset_imports(import_id) ON DELETE SET NULL,
                    CONSTRAINT uq_record_loc_date UNIQUE (location, observation_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                cur.execute("""
                CREATE TABLE IF NOT EXISTS data_quality_logs (
                    log_id INT AUTO_INCREMENT PRIMARY KEY,
                    import_id INT NULL,
                    row_number INT NOT NULL,
                    column_name VARCHAR(100) NULL,
                    issue_type VARCHAR(100) NOT NULL,
                    raw_value TEXT NULL,
                    error_message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_logs_import FOREIGN KEY (import_id) 
                        REFERENCES dataset_imports(import_id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # Indexes
                try:
                    cur.execute("CREATE INDEX idx_weather_date ON weather_records(observation_date);")
                    cur.execute("CREATE INDEX idx_weather_location ON weather_records(location);")
                    cur.execute("CREATE INDEX idx_weather_loc_date ON weather_records(location, observation_date);")
                except Exception:
                    pass # Index may already exist

            conn.commit()
            conn.close()
            return True, None
        except Exception as e:
            return False, str(e)

    def _init_sqlite(self):
        """Initializes SQLite fallback database."""
        Config.SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(Config.SQLITE_PATH)
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS dataset_imports (
            import_id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_size_bytes INTEGER NOT NULL DEFAULT 0,
            total_rows INTEGER NOT NULL DEFAULT 0,
            valid_rows INTEGER NOT NULL DEFAULT 0,
            invalid_rows INTEGER NOT NULL DEFAULT 0,
            duplicate_rows INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'COMPLETED',
            notes TEXT,
            imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS weather_records (
            record_id INTEGER PRIMARY KEY AUTOINCREMENT,
            import_id INTEGER,
            observation_date TEXT NOT NULL,
            location TEXT NOT NULL,
            temperature REAL,
            humidity REAL,
            rainfall REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (import_id) REFERENCES dataset_imports(import_id) ON DELETE SET NULL,
            UNIQUE(location, observation_date)
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS data_quality_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            import_id INTEGER,
            row_number INTEGER NOT NULL,
            column_name TEXT,
            issue_type TEXT NOT NULL,
            raw_value TEXT,
            error_message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (import_id) REFERENCES dataset_imports(import_id) ON DELETE CASCADE
        );
        """)

        cur.execute("CREATE INDEX IF NOT EXISTS idx_weather_date ON weather_records(observation_date);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_records(location);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_weather_loc_date ON weather_records(location, observation_date);")

        conn.commit()
        conn.close()

    def init_db(self):
        """Detects whether MySQL is available; otherwise initiates SQLite."""
        mysql_ok, err = self._test_mysql()
        if mysql_ok:
            self.engine_type = "mysql"
            self.is_connected = True
            self.connection_error = None
            logger.info("Connected successfully to MySQL database: %s", Config.DB_NAME)
        else:
            self.engine_type = "sqlite"
            self.is_connected = True
            self.connection_error = f"MySQL unavailable ({err}). Running on local SQLite database."
            logger.warning(self.connection_error)
            self._init_sqlite()

    def get_connection(self):
        """Returns an active DB connection and engine type."""
        if self.engine_type == "mysql":
            try:
                conn = pymysql.connect(
                    host=Config.DB_HOST,
                    port=Config.DB_PORT,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    database=Config.DB_NAME,
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=False
                )
                return conn, "mysql"
            except Exception as e:
                logger.error("MySQL connection lost: %s. Falling back to SQLite.", e)
                # Fallback to sqlite if mysql dropped
                self.engine_type = "sqlite"
                self._init_sqlite()

        conn = sqlite3.connect(Config.SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"

    def get_status(self):
        """Returns database status for frontend display."""
        return {
            "engine": self.engine_type,
            "connected": self.is_connected,
            "database_name": Config.DB_NAME if self.engine_type == "mysql" else str(Config.SQLITE_PATH.name),
            "host": f"{Config.DB_HOST}:{Config.DB_PORT}" if self.engine_type == "mysql" else "Local Embedded Storage",
            "info_note": "Production MySQL Active" if self.engine_type == "mysql" else "SQLite Mode (Automatic Local Dev Fallback - Zero Setup Needed)",
            "mysql_error": self.connection_error if self.engine_type != "mysql" else None
        }

    def execute_query(self, query, params=None, fetchone=False, fetchall=False, commit=False):
        """Executes a SQL query handling param substitution across MySQL and SQLite."""
        conn, engine = self.get_connection()
        params = params or ()
        
        # In SQLite, placeholders are ?, in PyMySQL they are %s.
        if engine == "sqlite":
            query = query.replace("%s", "?")
            cur = conn.cursor()
        else:
            cur = conn.cursor()

        try:
            cur.execute(query, params)
            if commit:
                conn.commit()

            if fetchone:
                row = cur.fetchone()
                return dict(row) if row else None
            elif fetchall:
                rows = cur.fetchall()
                return [dict(r) for r in rows] if rows else []
            else:
                last_id = cur.lastrowid
                return last_id
        finally:
            cur.close()
            conn.close()

db = DatabaseManager()
