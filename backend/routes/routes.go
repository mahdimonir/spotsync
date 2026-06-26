package routes

import "github.com/labstack/echo/v4"

func RegisterRoutes(e *echo.Echo) {

	e.GET("/", func(c echo.Context) error {
		return c.JSON(200, map[string]string{
			"message": "SpotSync API Running",
		})
	})

}