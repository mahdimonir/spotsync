package dto

type RegisterRequest struct {
	Name string `json:"name" validate:"required,min=3,max=100" example:"John Doe"`

	Email string `json:"email" validate:"required,email" example:"john.doe@example.com"`

	Password string `json:"password" validate:"required,min=6" example:"securepassword123"`

	Role string `json:"role" validate:"omitempty,oneof=driver admin" example:"driver"`
}

type LoginRequest struct {
	Email string `json:"email" validate:"required,email" example:"john.doe@example.com"`

	Password string `json:"password" validate:"required" example:"securepassword123"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type UserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}