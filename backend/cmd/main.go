package main

import (
	"log"

	"spotsync/config"
	"spotsync/database"
	"spotsync/routes"
	customValidator "spotsync/validator"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	routes.RegisterRoutes(e)

	log.Fatal(e.Start(":" + cfg.Port))
}