package server

import (
    "os"
    "regexp"
)

const WEBROOT = "./dist"

// Length of auto-generated passwords
const GEN_PASS_LEN = 24

// Label for the [src='<...>'] of internal log messages
const INTERNAL_SRC = "internal"

// Possible characters for auto-generated passwords
const GEN_PASS_CHARS = "-_.@/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// The expected output if PIN entry is required to fetch a secret
const GPG_FAIL_STRING = "gpg: public key decryption failed: No pinentry\ngpg: decryption failed: No pinentry"

const INTERNAL_ERR_STRING = "internal error"

const CSP_VALUE = "default-src 'self';"

// Server configuration object
type Config struct {
    BindAddress string `yaml:"bind_address"`
    Port        int
    Debug       bool
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

    TlsEnabled bool   `yaml:"tls_enabled"`
    TlsCert    string `yaml:"tls_cert"`
    TlsKey     string `yaml:"tls_key"`
}

func DefaultConfig() Config {
    home, _ := os.UserHomeDir()
    return Config{
        BindAddress:   "0.0.0.0",
        Passwordstore: home + "/.password-store",
        Port:          5678,
        Debug:         false,
        Color:         true,
        PassBinary:    "/usr/bin/pass",
        SingleUser:    false,
        TlsEnabled:    false,
        TlsCert:       "",
        TlsKey:        "",
    }
}

var USERS = []User{}
var CONFIG = DefaultConfig()
var VERSION = "unknown"

// !! These settings should match those in client/config.ts !!

// Max length of passwords and paths in the tree
const TEXT_MAX_LEN = "255"

// Maximum allowed folder depth in the password store
const MAX_PASS_DEPTH = 6

// 1-`TEXT_MAX_LEN` alpha numeric characters including '-', '+', '_', '.' and '@'
// '/' is only allowed up to MAX_PASS_DEPTH times, checked separately
var PASSENTRY_REGEX = regexp.MustCompile(`^[-_.@/a-zA-Z0-9+]{1,` + TEXT_MAX_LEN + "}$")

// 1-`TEXT_MAX_LEN` alpha numeric characters including most ASCII symbols
var SYMBOLS = regexp.QuoteMeta(`- §$!"'#€%&(){}[\\]=:;|?*<>_.,+@/`)
var PASSWORD_REGEX = regexp.MustCompile("^[" + SYMBOLS + "a-zA-Z0-9åäöÅÄÖ]{1," + TEXT_MAX_LEN + "}$")
