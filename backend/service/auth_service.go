package service

import (
	"spotsync/config"
	"spotsync/constants"
	"spotsync/dto"
	apperrors "spotsync/errors"
	"spotsync/models"
	utils "spotsync/pkg"
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

func (s *authService) Register(req *dto.RegisterRequest) (*dto.UserResponse, error) {

	exists, err := s.repo.ExistsByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, apperrors.ErrEmailAlreadyExists
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	role := req.Role
	if role == "" {
		role = constants.RoleDriver
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     role,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	}, nil
}

func (s *authService) Login(req *dto.LoginRequest) (*dto.LoginResponse, error) {

	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, apperrors.ErrInvalidCredentials
	}

	if err := utils.CheckPassword(req.Password, user.Password); err != nil {
		return nil, apperrors.ErrInvalidCredentials
	}

	token, err := utils.GenerateJWT(
		user.ID,
		user.Role,
		s.cfg,
	)

	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
			Role:  user.Role,
		},
	}, nil
}