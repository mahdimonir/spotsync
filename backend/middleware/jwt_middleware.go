package middleware

import (
	"net/http"
	"strings"

	"spotsync/config"
	utils "spotsync/pkg"
	"spotsync/response"

	"github.com/labstack/echo/v4"
)

func JWTMiddleware(cfg *config.Config) echo.MiddlewareFunc {

	return func(next echo.HandlerFunc) echo.HandlerFunc {

		return func(c echo.Context) error {

			authHeader := c.Request().Header.Get("Authorization")

			if authHeader == "" {

				return response.Error(
					c,
					http.StatusUnauthorized,
					"Authorization header is required",
					nil,
				)

			}

			headerParts := strings.Split(authHeader, " ")

			if len(headerParts) != 2 || headerParts[0] != "Bearer" {

				return response.Error(
					c,
					http.StatusUnauthorized,
					"Invalid authorization format",
					nil,
				)

			}

			claims, err := utils.ValidateJWT(headerParts[1], cfg)

			if err != nil {

				return response.Error(
					c,
					http.StatusUnauthorized,
					"Invalid or expired token",
					nil,
				)

			}

			c.Set("user", claims)

			return next(c)

		}

	}

}