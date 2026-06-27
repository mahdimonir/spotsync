package routes

import (
	"spotsync/config"
	"spotsync/handler"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(
	e *echo.Echo,
	authHandler *handler.AuthHandler,
	zoneHandler *handler.ParkingZoneHandler,
	reservationHandler *handler.ReservationHandler,
	cfg *config.Config,
) {

	api := e.Group("/api/v1")

	RegisterAuthRoutes(api, authHandler)
	RegisterParkingZoneRoutes(api, zoneHandler, cfg)
	RegisterReservationRoutes(api, reservationHandler, cfg)

	api.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"status": "ok",
		})
	})

}