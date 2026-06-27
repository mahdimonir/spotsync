package routes

import (
	"spotsync/config"
	"spotsync/handler"
	"spotsync/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterParkingZoneRoutes(
	api *echo.Group,
	zoneHandler *handler.ParkingZoneHandler,
	cfg *config.Config,
) {
	zones := api.Group("/zones")

	
	zones.GET("", zoneHandler.GetAllZones)
	zones.GET("/:id", zoneHandler.GetZoneByID)

	
	zones.POST("", zoneHandler.CreateZone, middleware.JWTMiddleware(cfg), middleware.AdminMiddleware())
	zones.PUT("/:id", zoneHandler.UpdateZone, middleware.JWTMiddleware(cfg), middleware.AdminMiddleware())
	zones.DELETE("/:id", zoneHandler.DeleteZone, middleware.JWTMiddleware(cfg), middleware.AdminMiddleware())
}
