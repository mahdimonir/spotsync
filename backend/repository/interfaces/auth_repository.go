package interfaces

import "spotsync/models"

type AuthRepository interface {
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id uint) (*models.User, error)

	ExistsByEmail(email string) (bool, error)
}