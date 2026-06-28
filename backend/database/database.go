package database

import (
	"log"
	"strings"
	"time"

	"spotsync/config"
	"spotsync/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	var dsn string
	if cfg.DatabaseURL != "" {
		dsn = cfg.DatabaseURL
		log.Println("Connecting to database using DATABASE_URL")
	} else {
		var parts []string
		if cfg.DBHost != "" {
			parts = append(parts, "host="+cfg.DBHost)
		}
		if cfg.DBUser != "" {
			parts = append(parts, "user="+cfg.DBUser)
		}
		if cfg.DBPassword != "" {
			parts = append(parts, "password="+cfg.DBPassword)
		}
		if cfg.DBName != "" {
			parts = append(parts, "dbname="+cfg.DBName)
		}
		if cfg.DBPort != "" {
			parts = append(parts, "port="+cfg.DBPort)
		}
		if cfg.DBSSLMode != "" {
			parts = append(parts, "sslmode="+cfg.DBSSLMode)
		}
		parts = append(parts, "TimeZone=UTC")
		dsn = strings.Join(parts, " ")

		log.Printf("Connecting to database: host=%s user=%s dbname=%s port=%s sslmode=%s",
			cfg.DBHost, cfg.DBUser, cfg.DBName, cfg.DBPort, cfg.DBSSLMode)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()

	if err != nil {
		return nil, err
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v", err)
		return nil, err
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Connected to PostgreSQL")

	return db, nil
}

func Migrate(db *gorm.DB) error {

	err := db.AutoMigrate(
		&models.User{},
		&models.ParkingZone{},
		&models.Reservation{},
	)

	if err != nil {
		return err
	}

	log.Println("Database migrated successfully")

	return nil
}