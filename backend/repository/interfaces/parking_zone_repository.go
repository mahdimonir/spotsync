package interfaces

import "spotsync/models"

type ParkingZoneRepository interface {
	CreateZone(zone *models.ParkingZone) error
	GetZoneByID(id uint) (*models.ParkingZone, error)
	GetAllZones() ([]models.ParkingZone, error)
	UpdateZone(id uint, zone *models.ParkingZone) error
	DeleteZone(id uint) error
	GetActiveReservationCount(zoneID uint) (int64, error)
}
