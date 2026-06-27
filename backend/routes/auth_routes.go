package routes

import (
	"spotsync/handler"

	"github.com/labstack/echo/v4"
)

func RegisterAuthRoutes(
	api *echo.Group,
	authHandler *handler.AuthHandler,
) {
	auth := api.Group("/auth")

	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)
}