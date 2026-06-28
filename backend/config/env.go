package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string

	DatabaseURL string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string

	JWTSecret string
	JWTExpire string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println(".env file not found, using system environment")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("POSTGRES_URL")
	}
	if databaseURL == "" {
		databaseURL = os.Getenv("POSTGRES_URL_NON_POOLING")
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = os.Getenv("POSTGRES_HOST")
		if dbHost == "" {
			dbHost = os.Getenv("PGHOST")
			if dbHost == "" {
				dbHost = os.Getenv("DATABASE_HOST")
			}
		}
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = os.Getenv("POSTGRES_PORT")
		if dbPort == "" {
			dbPort = os.Getenv("PGPORT")
			if dbPort == "" {
				dbPort = "5432"
			}
		}
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = os.Getenv("POSTGRES_USER")
		if dbUser == "" {
			dbUser = os.Getenv("PGUSER")
			if dbUser == "" {
				dbUser = os.Getenv("DATABASE_USER")
			}
		}
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = os.Getenv("POSTGRES_PASSWORD")
		if dbPassword == "" {
			dbPassword = os.Getenv("PGPASSWORD")
			if dbPassword == "" {
				dbPassword = os.Getenv("DATABASE_PASSWORD")
			}
		}
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = os.Getenv("POSTGRES_DATABASE")
		if dbName == "" {
			dbName = os.Getenv("PGDATABASE")
			if dbName == "" {
				dbName = os.Getenv("DATABASE_NAME")
			}
		}
	}

	dbSSLMode := os.Getenv("DB_SSLMODE")
	if dbSSLMode == "" {
		dbSSLMode = os.Getenv("POSTGRES_SSLMODE")
		if dbSSLMode == "" {
			dbSSLMode = os.Getenv("PGSSLMODE")
			if dbSSLMode == "" {
				dbSSLMode = "require"
			}
		}
	}

	return &Config{
		Port: port,

		DatabaseURL: databaseURL,
		DBHost:      dbHost,
		DBPort:      dbPort,
		DBUser:      dbUser,
		DBPassword:  dbPassword,
		DBName:      dbName,
		DBSSLMode:   dbSSLMode,

		JWTSecret: os.Getenv("JWT_SECRET"),
		JWTExpire: os.Getenv("JWT_EXPIRE"),
	}
}