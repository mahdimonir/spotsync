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

type ParkingZoneHandler struct {
	service serviceInterfaces.ParkingZoneService
}

func NewParkingZoneHandler(service serviceInterfaces.ParkingZoneService) *ParkingZoneHandler {
	return &ParkingZoneHandler{
		service: service,
	}
}

// CreateZone godoc
//
// @Summary Create Parking Zone
// @Description Create a new parking zone (Admin only)
// @Tags Parking Zones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateZoneRequest true "Create Zone Request"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/zones [post]
func (h *ParkingZoneHandler) CreateZone(c echo.Context) error {
	req, err := utils.BindAndValidate[dto.CreateZoneRequest](c)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid request body or validation failed",
			err.Error(),
		)
	}

	zone, err := h.service.CreateZone(req)
	if err != nil {
		return response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to create parking zone",
			nil,
		)
	}

	return response.Success(
		c,
		http.StatusCreated,
		"Parking zone created successfully",
		zone,
	)
}

// GetAllZones godoc
//
// @Summary Get All Parking Zones
// @Description Get all parking zones with available spots
// @Tags Parking Zones
// @Accept json
// @Produce json
// @Success 200 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/zones [get]
func (h *ParkingZoneHandler) GetAllZones(c echo.Context) error {
	zones, err := h.service.GetAllZones()
	if err != nil {
		return response.Error(
			c,
			http.StatusInternalServerError,
			"Failed to fetch parking zones",
			nil,
		)
	}

	return response.Success(
		c,
		http.StatusOK,
		"Parking zones retrieved successfully",
		zones,
	)
}

// GetZoneByID godoc
//
// @Summary Get Parking Zone
// @Description Get a single parking zone by ID
// @Tags Parking Zones
// @Accept json
// @Produce json
// @Param id path int true "Zone ID"
// @Success 200 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/zones/{id} [get]
func (h *ParkingZoneHandler) GetZoneByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid zone ID",
			nil,
		)
	}

	zone, err := h.service.GetZoneByID(uint(id))
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrZoneNotFound):
			return response.Error(
				c,
				http.StatusNotFound,
				err.Error(),
				nil,
			)
		default:
			return response.Error(
				c,
				http.StatusInternalServerError,
				"Failed to fetch parking zone",
				nil,
			)
		}
	}

	return response.Success(
		c,
		http.StatusOK,
		"Parking zone retrieved successfully",
		zone,
	)
}

// UpdateZone godoc
//
// @Summary Update Parking Zone
// @Description Update a parking zone (Admin only)
// @Tags Parking Zones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID"
// @Param request body dto.UpdateZoneRequest true "Update Zone Request"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/zones/{id} [put]
func (h *ParkingZoneHandler) UpdateZone(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid zone ID",
			nil,
		)
	}

	req, err := utils.BindAndValidate[dto.UpdateZoneRequest](c)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid request body or validation failed",
			err.Error(),
		)
	}

	zone, err := h.service.UpdateZone(uint(id), req)
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrZoneNotFound):
			return response.Error(
				c,
				http.StatusNotFound,
				err.Error(),
				nil,
			)
		default:
			return response.Error(
				c,
				http.StatusInternalServerError,
				"Failed to update parking zone",
				nil,
			)
		}
	}

	return response.Success(
		c,
		http.StatusOK,
		"Parking zone updated successfully",
		zone,
	)
}

// DeleteZone godoc
//
// @Summary Delete Parking Zone
// @Description Delete a parking zone (Admin only)
// @Tags Parking Zones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID"
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/zones/{id} [delete]
func (h *ParkingZoneHandler) DeleteZone(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return response.Error(
			c,
			http.StatusBadRequest,
			"Invalid zone ID",
			nil,
		)
	}

	err = h.service.DeleteZone(uint(id))
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrZoneNotFound):
			return response.Error(
				c,
				http.StatusNotFound,
				err.Error(),
				nil,
			)
		default:
			return response.Error(
				c,
				http.StatusInternalServerError,
				"Failed to delete parking zone",
				nil,
			)
		}
	}

	return response.Success(
		c,
		http.StatusOK,
		"Parking zone deleted successfully",
		nil,
	)
}
