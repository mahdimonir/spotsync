package service

import (
	"spotsync/config"
	"spotsync/dto"

	repoInterfaces "spotsync/repository/interfaces"
	serviceInterfaces "spotsync/service/interfaces"
)

type authService struct {
	repo repoInterfaces.AuthRepository
	cfg  *config.Config
}

var _ serviceInterfaces.AuthService = (*authService)(nil)

func NewAuthService(
	repo repoInterfaces.AuthRepository,
	cfg *config.Config,
) serviceInterfaces.AuthService {
	return &authService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *authService) Register(req *dto.RegisterRequest) error {
	return nil
}

func (s *authService) Login(req *dto.LoginRequest) (*dto.LoginResponse, error) {
	return nil, nil
}