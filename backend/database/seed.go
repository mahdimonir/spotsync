package database

import (
	"errors"
	"log"
	"spotsync/constants"
	"spotsync/models"
	utils "spotsync/pkg"

	"gorm.io/gorm"
)


func Seed(db *gorm.DB) error {
	log.Println("Seeding database...")

	
	seedUser := func(name, email, plainPassword, role string) error {
		var existing models.User
		err := db.Where("email = ?", email).First(&existing).Error
		if err == nil {
			log.Printf("User %s already exists, skipping seeding.", email)
			return nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		hashedPassword, err := utils.HashPassword(plainPassword)
		if err != nil {
			return err
		}

		user := models.User{
			Name:     name,
			Email:    email,
			Password: hashedPassword,
			Role:     role,
		}
		if err := db.Create(&user).Error; err != nil {
			return err
		}
		log.Printf("User %s seeded successfully.", email)
		return nil
	}

	if err := seedUser("Admin User", "admin@spotsync.com", "adminPassword123", constants.RoleAdmin); err != nil {
		return err
	}
	if err := seedUser("Driver User", "driver@spotsync.com", "driverPassword123", constants.RoleDriver); err != nil {
		return err
	}

	
	seedZone := func(name, zoneType string, capacity int, price float64) error {
		var existing models.ParkingZone
		err := db.Where("name = ?", name).First(&existing).Error
		if err == nil {
			log.Printf("Zone %s already exists, skipping seeding.", name)
			return nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		zone := models.ParkingZone{
			Name:          name,
			Type:          zoneType,
			TotalCapacity: capacity,
			PricePerHour:  price,
		}
		if err := db.Create(&zone).Error; err != nil {
			return err
		}
		log.Printf("Zone %s seeded successfully.", name)
		return nil
	}

	if err := seedZone("Terminal 1 EV Charging", constants.ZoneEVCharging, 5, 5.50); err != nil {
		return err
	}
	if err := seedZone("Main Parking Structure", constants.ZoneCovered, 50, 3.00); err != nil {
		return err
	}
	if err := seedZone("Open Lot A", constants.ZoneGeneral, 100, 1.50); err != nil {
		return err
	}

	
	var driver models.User
	var zone models.ParkingZone
	if err := db.Where("email = ?", "driver@spotsync.com").First(&driver).Error; err == nil {
		if err := db.Where("name = ?", "Terminal 1 EV Charging").First(&zone).Error; err == nil {
			var existingRes models.Reservation
			err := db.Where("user_id = ? AND zone_id = ? AND status = ?", driver.ID, zone.ID, constants.ReservationActive).First(&existingRes).Error
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					log.Println("Seeding active reservation...")
					res := models.Reservation{
						UserID:       driver.ID,
						ZoneID:       zone.ID,
						LicensePlate: "EV-SEED-999",
						Status:       constants.ReservationActive,
					}
					if err := db.Create(&res).Error; err != nil {
						return err
					}
					log.Println("Active reservation seeded successfully.")
				} else {
					return err
				}
			} else {
				log.Println("Active reservation already exists, skipping seeding.")
			}
		}
	}

	log.Println("Database seeding completed.")
	return nil
}
