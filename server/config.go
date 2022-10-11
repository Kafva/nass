package server

type Config struct {
	BindAddress string
	Port int
	Debug bool
	// Color in log messages
	Color bool
}

func DefaultConfig() Config {
	return Config {
		BindAddress: "0.0.0.0",
		Port: 5678,
		Debug: false,
		Color: true,
	}
}


var CONFIG = DefaultConfig()
