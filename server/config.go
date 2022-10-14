package server

import (
	"os"
)

type Config struct {
	BindAddress string
	Port int
	Debug bool
	// Color in log messages
	Color bool
	// Root folder for encrypted passwords
	// Each user will have their resources stored
	// under a top-level folder that matches their name (UID)
	Passwordstore string
}


func DefaultConfig() Config {
	home, _ := os.UserHomeDir()
	return Config {
		BindAddress: "0.0.0.0",
		Passwordstore: home+"/.password-store",
		Port: 5678,
		Debug: false,
		Color: true,
	}
}


var CONFIG = DefaultConfig()
