package handler

import (
	"errors"
	"net/http"
	"strconv"

	"spotsync/dto"
	apperrors "spotsync/errors"
	utils "spotsync/pkg"
	"spotsync/response"
	serviceInterfaces "spotsync/service/interfaces"

	"github.com/labstack/echo/v4"
)

type ReservationHandler struct {
	service serviceInterfaces.ReservationService
}

func NewReservationHandler(service serviceInterfaces.ReservationService) *ReservationHandler {
	return &ReservationHandler{
		service: service,
	}
}

// CreateReservation godoc
//
// @Summary Create Reservation
// @Description Create a new parking spot reservation
// @Tags Reservations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateReservationRequest true "Create Reservation Request"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/reservations [post]
func (h *ReservationHandler) CreateReservation(c echo.Context) error {
	userID, err := utils.GetUserID(c)
	if err != nil {
		return response.Error(
			c,
			http.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	req, err := utils.BindAndValidate[dto.CreateReservationRequest](c)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid request body or validation failed",
			err.Error(),
		)
	}

	reservation, err := h.service.CreateReservation(userID, req)
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrZoneNotFound):
			return response.Error(
				c,
				http.StatusNotFound,
				err.Error(),
				nil,
			)
		case errors.Is(err, apperrors.ErrZoneFull):
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
				"Failed to create reservation",
				nil,
			)
		}
	}

	return response.Success(
		c,
		http.StatusCreated,
		"Reservation confirmed successfully",
		reservation,
	)
}

// GetMyReservations godoc
//
// @Summary Get My Reservations
// @Description Get all reservations for the authenticated user
// @Tags Reservations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/reservations/my-reservations [get]
func (h *ReservationHandler) GetMyReservations(c echo.Context) error {
	userID, err := utils.GetUserID(c)
	if err != nil {
		return response.Error(
			c,
			http.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	reservations, err := h.service.GetMyReservations(userID)
	if err != nil {
		return response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch reservations",
			nil,
		)
	}

	return response.Success(
		c,
		http.StatusOK,
		"My reservations retrieved successfully",
		reservations,
	)
}

// GetAllReservations godoc
//
// @Summary Get All Reservations
// @Description Get all reservations in the system (Admin only)
// @Tags Reservations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/reservations [get]
func (h *ReservationHandler) GetAllReservations(c echo.Context) error {
	reservations, err := h.service.GetAllReservations()
	if err != nil {
		return response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch reservations",
			nil,
		)
	}

	return response.Success(
		c,
		http.StatusOK,
		"All reservations retrieved successfully",
		reservations,
	)
}

// CancelReservation godoc
//
// @Summary Cancel Reservation
// @Description Cancel a reservation
// @Tags Reservations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Reservation ID"
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/reservations/{id} [delete]
func (h *ReservationHandler) CancelReservation(c echo.Context) error {
	userID, err := utils.GetUserID(c)
	if err != nil {
		return response.Error(
			c,
			http.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid reservation ID",
			nil,
		)
	}

	err = h.service.CancelReservation(userID, uint(id))
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrReservationNotFound):
			return response.Error(
				c,
				http.StatusNotFound,
				err.Error(),
				nil,
			)
		case errors.Is(err, apperrors.ErrForbidden):
			return response.Error(
				c,
				http.StatusForbidden,
				"You can only cancel your own reservations",
				nil,
			)
		case errors.Is(err, apperrors.ErrReservationAlreadyCancelled):
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
				"Failed to cancel reservation",
				nil,
			)
		}
	}

	return response.Success(
		c,
		http.StatusOK,
		"Reservation cancelled successfully",
		nil,
	)
}
