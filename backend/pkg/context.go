package utils

import (
	"errors"

	"github.com/labstack/echo/v4"
)

func GetClaims(c echo.Context) *JWTClaims {

	return c.Get("user").(*JWTClaims)

}

func GetUserID(c echo.Context) (uint, error) {
	claims, ok := c.Get("user").(*JWTClaims)
	if !ok || claims == nil {
		return 0, errors.New("user claims not found in context")
	}
	return claims.UserID, nil
}