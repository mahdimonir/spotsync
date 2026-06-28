package main

import (
	"flag"
	"log"
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

func main() {
	
	seedFlag := flag.Bool("seed", false, "Seed the database and exit")
	flag.Parse()

	cfg := config.LoadConfig()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatal(err)
	}

	
	if *seedFlag {
		if err := database.Seed(db); err != nil {
			log.Fatal(err)
		}
		log.Println("Database seeding completed. Exiting...")
		return
	}

	if os.Getenv("SEED_DB") == "true" {
		if err := database.Seed(db); err != nil {
			log.Printf("Seeding database failed: %v", err)
		}
	}

	e := echo.New()

	e.Validator = customValidator.New()

	e.GET("/swagger/*", echoSwagger.WrapHandler)
	e.GET("/", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"message": "Welcome to SpotSync API",
			"docs":    "/swagger/index.html",
			"status":  "healthy",
		})
	})
	e.GET("/swagger", func(c echo.Context) error {
		return c.Redirect(302, "/swagger/index.html")
	})

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

	log.Println("SpotSync API running on :" + cfg.Port)

	log.Fatal(e.Start(":" + cfg.Port))
}