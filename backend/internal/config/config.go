package config

type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	JWT       JWTConfig
	Cookie    CookieConfig
	CORS      CORSConfig
	RateLimit RateLimitConfig
	Media     MediaConfig
}

type ServerConfig struct {
	Host string
	Port string
	Env  string
}

type DatabaseConfig struct {
	DSN         string
	MaxConns    int32
	IdleTimeout string
	MaxLifetime string
}

type JWTConfig struct {
	Secret     string
	AccessTTL  string
	RefreshTTL string
}

type CookieConfig struct {
	Domain   string
	Secure   bool
	SameSite string
}

type CORSConfig struct {
	AllowedOrigins []string
}

type RateLimitConfig struct {
	Login    int
	Upload   int
	Evidence int
}

type MediaConfig struct {
	R2Bucket             string
	R2Endpoint           string
	R2AccessKeyID        string
	R2SecretAccessKey    string
	CDNBaseURL           string
	MaxImageSizeBytes    int64
	MaxEvidenceSizeBytes int64
}
