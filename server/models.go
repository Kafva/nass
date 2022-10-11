package server

// An application user
type User struct {
	// Display name of the user
  Name string
	// The IP addresses which this user can connect from
  Origins []string
	// The name of the GPG key file to use for password operations
  KeyFile string
}
