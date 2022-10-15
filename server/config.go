package server

import (
	"os"
)

// Name of the environement variable that contains the pre-shared key
// for the application. All users utilise the same PSK and are identified
// based on their source IP.
const PSK_ENV = "NASS_KEY"

// HTTP header to use for the PSK
const PSK_HEADER = "x-creds"

// Server configuration object
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


var USERS  = []User{}
var CONFIG = DefaultConfig()
