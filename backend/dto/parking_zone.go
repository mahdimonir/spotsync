package dto

import "time"

type CreateZoneRequest struct {
	Name          string  `json:"name" validate:"required,min=3,max=100" example:"Downtown A"`
	Type          string  `json:"type" validate:"required,oneof=general covered ev_charging" example:"general"`
	TotalCapacity int     `json:"total_capacity" validate:"required,gt=0" example:"50"`
	PricePerHour  float64 `json:"price_per_hour" validate:"required,gt=0" example:"5.50"`
}

type UpdateZoneRequest struct {
	Name          string  `json:"name" validate:"omitempty,min=3,max=100" example:"Downtown A - Updated"`
	Type          string  `json:"type" validate:"omitempty,oneof=general covered ev_charging" example:"covered"`
	TotalCapacity int     `json:"total_capacity" validate:"omitempty,gt=0" example:"60"`
	PricePerHour  float64 `json:"price_per_hour" validate:"omitempty,gt=0" example:"6.00"`
}

type ZoneResponse struct {
	ID             uint      `json:"id"`
	Name           string    `json:"name"`
	Type           string    `json:"type"`
	TotalCapacity  int       `json:"total_capacity"`
	AvailableSpots int       `json:"available_spots"`
	PricePerHour   float64   `json:"price_per_hour"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}