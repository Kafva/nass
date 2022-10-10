package server

type Config struct {
	Port int
	Debug bool
	// Color in log messages
	Color bool
}

func DefaultConfig() Config {
	return Config {
		Port: 5678,
		Debug: false,
		Color: true,
	}
}


var CONFIG = DefaultConfig()
