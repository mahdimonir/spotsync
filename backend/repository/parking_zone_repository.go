package repository

import (
	"spotsync/models"
	repoInterfaces "spotsync/repository/interfaces"

	"gorm.io/gorm"
)

type ParkingZoneRepository struct {
	db *gorm.DB
}

var _ repoInterfaces.ParkingZoneRepository = (*ParkingZoneRepository)(nil)

func NewParkingZoneRepository(db *gorm.DB) *ParkingZoneRepository {
	return &ParkingZoneRepository{
		db: db,
	}
}

func (r *ParkingZoneRepository) CreateZone(zone *models.ParkingZone) error {
	return r.db.Create(zone).Error
}

func (r *ParkingZoneRepository) GetZoneByID(id uint) (*models.ParkingZone, error) {
	var zone models.ParkingZone

	err := r.db.First(&zone, id).Error

	if err != nil {
		return nil, err
	}

	return &zone, nil
}

func (r *ParkingZoneRepository) GetAllZones() ([]models.ParkingZone, error) {
	var zones []models.ParkingZone

	err := r.db.Find(&zones).Error

	if err != nil {
		return nil, err
	}

	return zones, nil
}

func (r *ParkingZoneRepository) UpdateZone(id uint, zone *models.ParkingZone) error {
	return r.db.Model(&models.ParkingZone{}).Where("id = ?", id).Updates(zone).Error
}

func (r *ParkingZoneRepository) DeleteZone(id uint) error {
	return r.db.Delete(&models.ParkingZone{}, id).Error
}

func (r *ParkingZoneRepository) GetActiveReservationCount(zoneID uint) (int64, error) {
	var count int64

	err := r.db.
		Model(&models.Reservation{}).
		Where("zone_id = ? AND status = ?", zoneID, "active").
		Count(&count).Error

	if err != nil {
		return 0, err
	}

	return count, nil
}
