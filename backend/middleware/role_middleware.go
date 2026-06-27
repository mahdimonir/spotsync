package middleware

import (
	"net/http"

	"spotsync/constants"
	utils "spotsync/pkg"
	"spotsync/response"

	"github.com/labstack/echo/v4"
)

func RequireRoles(roles ...string) echo.MiddlewareFunc {

	return func(next echo.HandlerFunc) echo.HandlerFunc {

		return func(c echo.Context) error {

			claims, ok := c.Get("user").(*utils.JWTClaims)

			if !ok {

				return response.Error(
					c,
					http.StatusUnauthorized,
					"Unauthorized",
					nil,
				)

			}

			for _, role := range roles {

				if claims.Role == role {
					return next(c)
				}

			}

			return response.Error(
				c,
				http.StatusForbidden,
				"Permission denied",
				nil,
			)

		}

	}

}

func AdminMiddleware() echo.MiddlewareFunc {
	return RequireRoles(constants.RoleAdmin)
}