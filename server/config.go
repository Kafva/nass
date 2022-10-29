package server

import (
	"os"
)

const WEBROOT = "./dist"

// Length of auto-generated passwords
const GEN_PASS_LEN = 24

// Possible characters for auto-generated passwords
const GEN_PASS_CHARS =
  "-_.@/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// 1-255 alpha numeric characters including '-', '_', '.' and '@'
// '/' is only allowed up to MAX_PASS_DEPTH times, checked separately
const PASSENTRY_REGEX = "^[-_.@/a-zA-Z0-9]{1,255}$"

// Maximum allowed folder depth in the password store
const MAX_PASS_DEPTH = 6

// The expected output if PIN entry is required to fetch a secret
const GPG_FAIL_STRING = "gpg: decryption failed: No secret key"

// FIXME
// Svelte's fly animations rely on creating an empty stylesheet, this 
// infers that either 'unsafe-inline' or a nonce for the empty string needs to 
// present as a 'style-src'.
//  https://github.com/sveltejs/svelte/issues/6662
var CSP_VALUE = "default-src 'self'; style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';"

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
