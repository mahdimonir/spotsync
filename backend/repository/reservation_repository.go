package repository

import (
	"spotsync/constants"
	apperrors "spotsync/errors"
	"spotsync/models"
	repoInterfaces "spotsync/repository/interfaces"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ReservationRepository struct {
	db *gorm.DB
}

var _ repoInterfaces.ReservationRepository = (*ReservationRepository)(nil)

func NewReservationRepository(db *gorm.DB) *ReservationRepository {
	return &ReservationRepository{
		db: db,
	}
}

func (r *ReservationRepository) CreateReservation(reservation *models.Reservation) error {
	return r.db.Create(reservation).Error
}

func (r *ReservationRepository) GetReservationByID(id uint) (*models.Reservation, error) {
	var reservation models.Reservation

	err := r.db.
		Preload("Zone").
		Preload("User").
		First(&reservation, id).Error

	if err != nil {
		return nil, err
	}

	return &reservation, nil
}

func (r *ReservationRepository) GetReservationsByUserID(userID uint) ([]models.Reservation, error) {
	var reservations []models.Reservation

	err := r.db.
		Preload("Zone").
		Where("user_id = ?", userID).
		Find(&reservations).Error

	if err != nil {
		return nil, err
	}

	return reservations, nil
}

func (r *ReservationRepository) GetAllReservations() ([]models.Reservation, error) {
	var reservations []models.Reservation

	err := r.db.
		Preload("Zone").
		Preload("User").
		Find(&reservations).Error

	if err != nil {
		return nil, err
	}

	return reservations, nil
}

func (r *ReservationRepository) CancelReservation(id uint) error {
	return r.db.
		Model(&models.Reservation{}).
		Where("id = ?", id).
		Update("status", constants.ReservationCancelled).Error
}

func (r *ReservationRepository) GetActiveReservationCountForZone(zoneID uint) (int64, error) {
	var count int64

	err := r.db.
		Model(&models.Reservation{}).
		Where("zone_id = ? AND status = ?", zoneID, constants.ReservationActive).
		Count(&count).Error

	if err != nil {
		return 0, err
	}

	return count, nil
}


func (r *ReservationRepository) CreateReservationWithTransaction(
	zoneID uint,
	userID uint,
	licensePlate string,
) (*models.Reservation, error) {
	var reservation *models.Reservation

	err := r.db.Transaction(func(tx *gorm.DB) error {
		
		var zone models.ParkingZone
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&zone, zoneID).Error; err != nil {
			return err
		}

		
		var count int64
		if err := tx.Model(&models.Reservation{}).
			Where("zone_id = ? AND status = ?", zoneID, constants.ReservationActive).
			Count(&count).Error; err != nil {
			return err
		}

		
		if count >= int64(zone.TotalCapacity) {
			return apperrors.ErrZoneFull 
		}

		
		reservation = &models.Reservation{
			UserID:       userID,
			ZoneID:       zoneID,
			LicensePlate: licensePlate,
			Status:       constants.ReservationActive,
		}

		if err := tx.Create(reservation).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return reservation, nil
}
