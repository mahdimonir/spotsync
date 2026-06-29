package dto

import "time"

type CreateReservationRequest struct {
	ZoneID       uint   `json:"zone_id" validate:"required" example:"1"`
	LicensePlate string `json:"license_plate" validate:"required,max=15" example:"KAZ-789-XY"`
}

type ReservationResponse struct {
	ID           uint         `json:"id"`
	UserID       uint         `json:"user_id"`
	ZoneID       uint         `json:"zone_id"`
	LicensePlate string       `json:"license_plate"`
	Status       string       `json:"status"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
}

type ReservationDetailResponse struct {
	ID           uint              `json:"id"`
	LicensePlate string            `json:"license_plate"`
	Status       string            `json:"status"`
	Zone         ZoneDetailResponse `json:"zone"`
	CreatedAt    time.Time         `json:"created_at"`
}

type ZoneDetailResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}