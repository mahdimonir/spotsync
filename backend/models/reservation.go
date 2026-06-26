package models

import "time"

type Reservation struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"not null" json:"user_id"`
	ZoneID        uint      `gorm:"not null" json:"zone_id"`
	LicensePlate  string    `gorm:"size:15;not null" json:"license_plate"`
	Status        string    `gorm:"type:varchar(20);default:active" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Zone ParkingZone `gorm:"foreignKey:ZoneID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}