package server

import (
	"os"
)

// An application user
type User struct {
	// Display name of the user
  Name string
	// The IP addresses which this user can connect from
  Origins []string
	// The name of the GPG key file to use for password operations
  KeyFile string
}

func (u *User) HasOrigin(origin string) bool {
	for _,o := range u.Origins {
		if o == origin {
			return true
		}
	}
	return false
}

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
