package apperrors

import "errors"

var (

	// Authentication
	ErrEmailAlreadyExists = errors.New("email already exists")

	ErrInvalidCredentials = errors.New("invalid email or password")

	ErrUserNotFound = errors.New("user not found")

	// Authorization
	ErrUnauthorized = errors.New("unauthorized")

	ErrForbidden = errors.New("forbidden")

	// Parking Zone
	ErrZoneNotFound = errors.New("parking zone not found")

	ErrZoneFull = errors.New("parking zone is full")

	// Reservation
	ErrReservationNotFound = errors.New("reservation not found")

	ErrReservationAlreadyCancelled = errors.New("reservation already cancelled")

	ErrDuplicateLicensePlate = errors.New("license plate already exists")

	// Validation
	ErrInvalidInput = errors.New("invalid input")
)