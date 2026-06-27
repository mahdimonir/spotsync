package handler

import (
	"errors"
	"net/http"

	"spotsync/dto"
	apperrors "spotsync/errors"
	utils "spotsync/pkg"
	"spotsync/response"
	serviceInterfaces "spotsync/service/interfaces"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	service serviceInterfaces.AuthService
}

func NewAuthHandler(service serviceInterfaces.AuthService) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

// Register godoc
//
// @Summary Register User
// @Description Register a new SpotSync user
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Register Request"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c echo.Context) error {
	req, err := utils.BindAndValidate[dto.RegisterRequest](c)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid request body or validation failed",
			err.Error(),
		)
	}

	user, err := h.service.Register(req)
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrEmailAlreadyExists):
			return response.Error(
				c,
				http.StatusConflict,
				err.Error(),
				nil,
			)

		default:
			return response.Error(
				c,
				http.StatusInternalServerError,
				"Internal server error",
				nil,
			)
		}
	}

	return response.Success(
		c,
		http.StatusCreated,
		"User registered successfully",
		user,
	)
}

// @Summary Login User
// @Description Login to SpotSync
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login Request"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c echo.Context) error {
	req, err := utils.BindAndValidate[dto.LoginRequest](c)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid request body or validation failed",
			err.Error(),
		)
	}

	loginResponse, err := h.service.Login(req)
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrInvalidCredentials):
			return response.Error(
				c,
				http.StatusUnauthorized,
				err.Error(),
				nil,
			)

		default:
			return response.Error(
				c,
				http.StatusInternalServerError,
				"Internal server error",
				nil,
			)
		}
	}

	return response.Success(
		c,
		http.StatusOK,
		"Login successful",
		loginResponse,
	)
}