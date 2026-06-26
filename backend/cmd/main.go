package main

import (
	"log"

	"spotsync/config"
	"spotsync/database"
)

func main() {

	cfg := config.LoadConfig()

	_, err := database.Connect(cfg)

	if err != nil {
		log.Fatal(err)
	}

	log.Println("Server Started")
}