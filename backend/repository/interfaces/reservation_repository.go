package interfaces

import "spotsync/models"

type ReservationRepository interface {
	CreateReservation(reservation *models.Reservation) error
	GetReservationByID(id uint) (*models.Reservation, error)
	GetReservationsByUserID(userID uint) ([]models.Reservation, error)
	GetAllReservations() ([]models.Reservation, error)
	CancelReservation(id uint) error
	GetActiveReservationCountForZone(zoneID uint) (int64, error)
	CreateReservationWithTransaction(zoneID uint, userID uint, licensePlate string) (*models.Reservation, error)
}
