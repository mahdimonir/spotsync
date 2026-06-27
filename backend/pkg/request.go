package utils

import "github.com/labstack/echo/v4"

func BindAndValidate[T any](c echo.Context) (*T, error) {
	var req T

	if err := c.Bind(&req); err != nil {
		return nil, err
	}

	if err := c.Validate(&req); err != nil {
		return nil, err
	}

	return &req, nil
}