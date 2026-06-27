package routes

import (
	"spotsync/handler"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(
	e *echo.Echo,
	authHandler *handler.AuthHandler,
) {

	api := e.Group("/api/v1")

	RegisterAuthRoutes(api, authHandler)

	api.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"status": "ok",
		})
	})

}