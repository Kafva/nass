package server

import (
	"os"
)

const WEBROOT = "./dist"

// 1-20 alpha numeric characters including '-' and '_'
// '/' is only allowed up to MAX_PASS_DEPTH times, checked separately
const PASSENTRY_REGEX = "^[-_a-zA-Z0-9/]{1,255}$"

// Maximum allowed folder depth in the password store
const MAX_PASS_DEPTH = 6

// The expected output if PIN entry is required to fetch a secret
const GPG_FAIL_STRING = "gpg: decryption failed: No secret key"

// Only allow content from the current domain
// to be loaded by the client
var CSP_VALUES = [...]string{
  "default-src 'self';",
}

// Server configuration object
type Config struct {
  BindAddress string `yaml:"bind_address"`
	Port int
	Debug bool
	// Color in log messages
	Color bool
	// Root folder for encrypted passwords
	// Each user will have their resources stored
	// under a top-level folder that matches their name (UID)
	Passwordstore string `yaml:"passwordstore"`
  // Disable multi-user support (consider the `Passwordstore`
  // as the only root for a single user)
  SingleUser bool `yaml:"single_user"`
  PassBinary string

  TlsEnabled bool `yaml:"tls_enabled"`
  TlsCert string `yaml:"tls_cert"`
  TlsKey string `yaml:"tls_key"`
}

func DefaultConfig() Config {
	home, _ := os.UserHomeDir()
	return Config {
		BindAddress: "0.0.0.0",
		Passwordstore: home+"/.password-store",
		Port: 5678,
		Debug: false,
		Color: true,
    PassBinary: "/usr/bin/pass",
    SingleUser: false,
    TlsEnabled: false,
    TlsCert: "",
    TlsKey: "",
	}
}


var USERS  = []User{}
var CONFIG = DefaultConfig()
