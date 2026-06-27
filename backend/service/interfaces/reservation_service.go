package interfaces

import "spotsync/dto"

type ReservationService interface {
	CreateReservation(userID uint, req *dto.CreateReservationRequest) (*dto.ReservationResponse, error)
	GetMyReservations(userID uint) ([]dto.ReservationDetailResponse, error)
	GetAllReservations() ([]dto.ReservationDetailResponse, error)
	CancelReservation(userID uint, reservationID uint) error
}
