package handler

import (
	"log"
	"net/http"
	"os"

	"spotsync/config"
	"spotsync/database"
	"spotsync/handler"
	"spotsync/repository"
	"spotsync/routes"
	"spotsync/service"
	customValidator "spotsync/validator"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"

	_ "spotsync/docs"

	echoSwagger "github.com/swaggo/echo-swagger"
)

var e *echo.Echo

func init() {
	cfg := config.LoadConfig()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	if os.Getenv("SEED_DB") == "true" {
		if err := database.Seed(db); err != nil {
			log.Printf("Seeding database failed: %v", err)
		}
	}

	e = echo.New()

	e.Validator = customValidator.New()

	e.GET("/swagger/*", echoSwagger.WrapHandler)

	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORS())

	authRepo := repository.NewAuthRepository(db)
	authService := service.NewAuthService(authRepo, cfg)
	authHandler := handler.NewAuthHandler(authService)

	zoneRepo := repository.NewParkingZoneRepository(db)
	zoneService := service.NewParkingZoneService(zoneRepo)
	zoneHandler := handler.NewParkingZoneHandler(zoneService)

	reservationRepo := repository.NewReservationRepository(db)
	reservationService := service.NewReservationService(reservationRepo, zoneRepo)
	reservationHandler := handler.NewReservationHandler(reservationService)

	routes.RegisterRoutes(e, authHandler, zoneHandler, reservationHandler, cfg)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	e.ServeHTTP(w, r)
}
