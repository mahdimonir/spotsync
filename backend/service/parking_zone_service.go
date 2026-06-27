package service

import (
	"spotsync/dto"
	apperrors "spotsync/errors"
	"spotsync/models"
	repoInterfaces "spotsync/repository/interfaces"
	serviceInterfaces "spotsync/service/interfaces"
)

type parkingZoneService struct {
	repo repoInterfaces.ParkingZoneRepository
}

var _ serviceInterfaces.ParkingZoneService = (*parkingZoneService)(nil)

func NewParkingZoneService(repo repoInterfaces.ParkingZoneRepository) serviceInterfaces.ParkingZoneService {
	return &parkingZoneService{
		repo: repo,
	}
}

func (s *parkingZoneService) CreateZone(req *dto.CreateZoneRequest) (*dto.ZoneResponse, error) {
	zone := &models.ParkingZone{
		Name:          req.Name,
		Type:          req.Type,
		TotalCapacity: req.TotalCapacity,
		PricePerHour:  req.PricePerHour,
	}

	if err := s.repo.CreateZone(zone); err != nil {
		return nil, err
	}

	return &dto.ZoneResponse{
		ID:             zone.ID,
		Name:           zone.Name,
		Type:           zone.Type,
		TotalCapacity:  zone.TotalCapacity,
		AvailableSpots: zone.TotalCapacity,
		PricePerHour:   zone.PricePerHour,
		CreatedAt:      zone.CreatedAt,
		UpdatedAt:      zone.UpdatedAt,
	}, nil
}

func (s *parkingZoneService) GetZoneByID(id uint) (*dto.ZoneResponse, error) {
	zone, err := s.repo.GetZoneByID(id)
	if err != nil {
		return nil, apperrors.ErrZoneNotFound
	}

	activeCount, err := s.repo.GetActiveReservationCount(id)
	if err != nil {
		return nil, err
	}

	availableSpots := int64(zone.TotalCapacity) - activeCount

	return &dto.ZoneResponse{
		ID:             zone.ID,
		Name:           zone.Name,
		Type:           zone.Type,
		TotalCapacity:  zone.TotalCapacity,
		AvailableSpots: int(availableSpots),
		PricePerHour:   zone.PricePerHour,
		CreatedAt:      zone.CreatedAt,
		UpdatedAt:      zone.UpdatedAt,
	}, nil
}

func (s *parkingZoneService) GetAllZones() ([]dto.ZoneResponse, error) {
	zones, err := s.repo.GetAllZones()
	if err != nil {
		return nil, err
	}

	var response []dto.ZoneResponse

	for _, zone := range zones {
		activeCount, err := s.repo.GetActiveReservationCount(zone.ID)
		if err != nil {
			return nil, err
		}

		availableSpots := int64(zone.TotalCapacity) - activeCount

		response = append(response, dto.ZoneResponse{
			ID:             zone.ID,
			Name:           zone.Name,
			Type:           zone.Type,
			TotalCapacity:  zone.TotalCapacity,
			AvailableSpots: int(availableSpots),
			PricePerHour:   zone.PricePerHour,
			CreatedAt:      zone.CreatedAt,
			UpdatedAt:      zone.UpdatedAt,
		})
	}

	return response, nil
}

func (s *parkingZoneService) UpdateZone(id uint, req *dto.UpdateZoneRequest) (*dto.ZoneResponse, error) {
	zone, err := s.repo.GetZoneByID(id)
	if err != nil {
		return nil, apperrors.ErrZoneNotFound
	}

	
	updates := &models.ParkingZone{}

	if req.Name != "" {
		updates.Name = req.Name
	}
	if req.Type != "" {
		updates.Type = req.Type
	}
	if req.TotalCapacity > 0 {
		updates.TotalCapacity = req.TotalCapacity
	}
	if req.PricePerHour > 0 {
		updates.PricePerHour = req.PricePerHour
	}

	if err := s.repo.UpdateZone(id, updates); err != nil {
		return nil, err
	}

	
	zone, err = s.repo.GetZoneByID(id)
	if err != nil {
		return nil, err
	}

	activeCount, err := s.repo.GetActiveReservationCount(id)
	if err != nil {
		return nil, err
	}

	availableSpots := int64(zone.TotalCapacity) - activeCount

	return &dto.ZoneResponse{
		ID:             zone.ID,
		Name:           zone.Name,
		Type:           zone.Type,
		TotalCapacity:  zone.TotalCapacity,
		AvailableSpots: int(availableSpots),
		PricePerHour:   zone.PricePerHour,
		CreatedAt:      zone.CreatedAt,
		UpdatedAt:      zone.UpdatedAt,
	}, nil
}

func (s *parkingZoneService) DeleteZone(id uint) error {
	_, err := s.repo.GetZoneByID(id)
	if err != nil {
		return apperrors.ErrZoneNotFound
	}

	return s.repo.DeleteZone(id)
}
