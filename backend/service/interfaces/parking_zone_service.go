package interfaces

import "spotsync/dto"

type ParkingZoneService interface {
	CreateZone(req *dto.CreateZoneRequest) (*dto.ZoneResponse, error)
	GetZoneByID(id uint) (*dto.ZoneResponse, error)
	GetAllZones() ([]dto.ZoneResponse, error)
	UpdateZone(id uint, req *dto.UpdateZoneRequest) (*dto.ZoneResponse, error)
	DeleteZone(id uint) error
}
