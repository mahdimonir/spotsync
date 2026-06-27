package routes

import (
	"spotsync/config"
	"spotsync/handler"
	"spotsync/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterReservationRoutes(
	api *echo.Group,
	reservationHandler *handler.ReservationHandler,
	cfg *config.Config,
) {
	reservations := api.Group("/reservations")

	
	reservations.POST("", reservationHandler.CreateReservation, middleware.JWTMiddleware(cfg))
	reservations.GET("/my-reservations", reservationHandler.GetMyReservations, middleware.JWTMiddleware(cfg))
	reservations.DELETE("/:id", reservationHandler.CancelReservation, middleware.JWTMiddleware(cfg))

	
	reservations.GET("", reservationHandler.GetAllReservations, middleware.JWTMiddleware(cfg), middleware.AdminMiddleware())
}
