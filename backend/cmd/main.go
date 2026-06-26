package main

import (
	"log"

	"spotsync/config"
	"spotsync/database"
)

func main() {

	cfg := config.LoadConfig()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatal(err)
	}

	log.Println("SpotSync API Started")
}