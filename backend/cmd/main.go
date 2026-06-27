package main

import (
	"log"

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

	cfg := config.LoadConfig()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatal(err)
	}

	e := echo.New()

	e.Validator = customValidator.New()

	e.GET("/swagger/*", echoSwagger.WrapHandler)

	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORS())

	// Dependency Injection
	authRepo := repository.NewAuthRepository(db)
	authService := service.NewAuthService(authRepo, cfg)
	authHandler := handler.NewAuthHandler(authService)

	routes.RegisterRoutes(e, authHandler)

	log.Println("SpotSync API running on :" + cfg.Port)

	log.Fatal(e.Start(":" + cfg.Port))
}