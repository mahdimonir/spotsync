package repository

import (
	"spotsync/models"
	repoInterfaces "spotsync/repository/interfaces"

	"gorm.io/gorm"
)

type AuthRepository struct {
	db *gorm.DB
}

var _ repoInterfaces.AuthRepository = (*AuthRepository)(nil)

func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{
		db: db,
	}
}

func (r *AuthRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *AuthRepository) GetUserByEmail(email string) (*models.User, error) {

	var user models.User

	err := r.db.
		Where("email = ?", email).
		First(&user).Error

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *AuthRepository) GetUserByID(id uint) (*models.User, error) {

	var user models.User

	err := r.db.First(&user, id).Error

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *AuthRepository) ExistsByEmail(email string) (bool, error) {
	var count int64

	err := r.db.
		Model(&models.User{}).
		Where("email = ?", email).
		Count(&count).Error

	return count > 0, err
}