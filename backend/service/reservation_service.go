package service

import (
	"errors"

	"spotsync/constants"
	"spotsync/dto"
	apperrors "spotsync/errors"
	repoInterfaces "spotsync/repository/interfaces"
	serviceInterfaces "spotsync/service/interfaces"

	"gorm.io/gorm"
)

type reservationService struct {
	reservationRepo repoInterfaces.ReservationRepository
	zoneRepo        repoInterfaces.ParkingZoneRepository
}

var _ serviceInterfaces.ReservationService = (*reservationService)(nil)

func NewReservationService(
	reservationRepo repoInterfaces.ReservationRepository,
	zoneRepo repoInterfaces.ParkingZoneRepository,
) serviceInterfaces.ReservationService {
	return &reservationService{
		reservationRepo: reservationRepo,
		zoneRepo:        zoneRepo,
	}
}

func (s *reservationService) CreateReservation(userID uint, req *dto.CreateReservationRequest) (*dto.ReservationResponse, error) {
	
	reservation, err := s.reservationRepo.CreateReservationWithTransaction(req.ZoneID, userID, req.LicensePlate)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.ErrZoneNotFound
		}
		return nil, err
	}

	return &dto.ReservationResponse{
		ID:           reservation.ID,
		UserID:       reservation.UserID,
		ZoneID:       reservation.ZoneID,
		LicensePlate: reservation.LicensePlate,
		Status:       reservation.Status,
		CreatedAt:    reservation.CreatedAt,
		UpdatedAt:    reservation.UpdatedAt,
	}, nil
}

func (s *reservationService) GetMyReservations(userID uint) ([]dto.ReservationDetailResponse, error) {
	reservations, err := s.reservationRepo.GetReservationsByUserID(userID)
	if err != nil {
		return nil, err
	}

	var response []dto.ReservationDetailResponse

	for _, res := range reservations {
		response = append(response, dto.ReservationDetailResponse{
			ID:           res.ID,
			LicensePlate: res.LicensePlate,
			Status:       res.Status,
			Zone: dto.ZoneDetailResponse{
				ID:   res.Zone.ID,
				Name: res.Zone.Name,
				Type: res.Zone.Type,
			},
			CreatedAt: res.CreatedAt,
		})
	}

	return response, nil
}

func (s *reservationService) GetAllReservations() ([]dto.ReservationDetailResponse, error) {
	reservations, err := s.reservationRepo.GetAllReservations()
	if err != nil {
		return nil, err
	}

	var response []dto.ReservationDetailResponse

	for _, res := range reservations {
		response = append(response, dto.ReservationDetailResponse{
			ID:           res.ID,
			LicensePlate: res.LicensePlate,
			Status:       res.Status,
			Zone: dto.ZoneDetailResponse{
				ID:   res.Zone.ID,
				Name: res.Zone.Name,
				Type: res.Zone.Type,
			},
			CreatedAt: res.CreatedAt,
		})
	}

	return response, nil
}

func (s *reservationService) CancelReservation(userID uint, reservationID uint) error {
	reservation, err := s.reservationRepo.GetReservationByID(reservationID)
	if err != nil {
		return apperrors.ErrReservationNotFound
	}

	
	if reservation.UserID != userID {
		return apperrors.ErrForbidden
	}

	
	if reservation.Status == constants.ReservationCancelled {
		return apperrors.ErrReservationAlreadyCancelled
	}

	return s.reservationRepo.CancelReservation(reservationID)
}
