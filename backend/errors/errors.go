package apperrors

import "errors"

var (

	
	ErrEmailAlreadyExists = errors.New("email already exists")

	ErrInvalidCredentials = errors.New("invalid email or password")

	ErrUserNotFound = errors.New("user not found")

	
	ErrUnauthorized = errors.New("unauthorized")

	ErrForbidden = errors.New("forbidden")

	
	ErrZoneNotFound = errors.New("parking zone not found")

	ErrZoneFull = errors.New("parking zone is full")

	
	ErrReservationNotFound = errors.New("reservation not found")

	ErrReservationAlreadyCancelled = errors.New("reservation already cancelled")

	ErrDuplicateLicensePlate = errors.New("license plate already exists")

	
	ErrInvalidInput = errors.New("invalid input")
)