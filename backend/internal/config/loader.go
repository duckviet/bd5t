package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	cfg := &Config{
		Server: ServerConfig{
			Host: getEnv("APP_HOST", "0.0.0.0"),
			Port: getEnv("APP_PORT", "8080"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			DSN:         getEnvRequired("DATABASE_URL"),
			MaxConns:    int32(getEnvInt("DB_MAX_CONN", 10)),
			IdleTimeout: getEnv("DB_IDLE_TIMEOUT", "300s"),
			MaxLifetime: getEnv("DB_MAX_LIFETIME", "30m"),
		},
		JWT: JWTConfig{
			Secret:     getEnvRequired("JWT_SECRET"),
			AccessTTL:  getEnv("JWT_ACCESS_TTL", "1h"),
			RefreshTTL: getEnv("JWT_REFRESH_TTL", "7d"),
		},
		Cookie: CookieConfig{
			Domain:   os.Getenv("COOKIE_DOMAIN"),
			Secure:   getEnvBool("COOKIE_SECURE", false),
			SameSite: getEnv("COOKIE_SAME_SITE", "lax"),
		},
		CORS: CORSConfig{
			AllowedOrigins: parseCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
		},
		RateLimit: RateLimitConfig{
			Login:    getEnvInt("RATE_LIMIT_LOGIN", 5),
			Upload:   getEnvInt("RATE_LIMIT_UPLOAD", 10),
			Evidence: getEnvInt("RATE_LIMIT_EVIDENCE", 10),
			Profile:  getEnvInt("RATE_LIMIT_PROFILE", 10),
		},
		Media: MediaConfig{
			R2Bucket:             getEnvRequired("R2_BUCKET"),
			R2Endpoint:           getEnvRequired("R2_ENDPOINT"),
			R2AccessKeyID:        getEnvRequired("R2_ACCESS_KEY_ID"),
			R2SecretAccessKey:    getEnvRequired("R2_SECRET_ACCESS_KEY"),
			CDNBaseURL:           getEnvRequired("CDN_BASE_URL"),
			MaxImageSizeBytes:    getEnvInt64("MAX_IMAGE_SIZE_BYTES", 5242880),
			MaxEvidenceSizeBytes: getEnvInt64("MAX_EVIDENCE_SIZE_BYTES", 10485760),
		},
	}

	if err := validateRequired(cfg); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}

func getEnvRequired(key string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return ""
}

func getEnvInt(key string, defaultValue int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.ParseInt(v, 10, 64); err == nil {
			return i
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if v := os.Getenv(key); v != "" {
		return v == "true" || v == "1"
	}
	return defaultValue
}

func parseCSV(value string) []string {
	if value == "" {
		return []string{}
	}
	return strings.Split(value, ",")
}

func validateRequired(cfg *Config) error {
	missing := []string{}

	if cfg.Database.DSN == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if cfg.JWT.Secret == "" {
		missing = append(missing, "JWT_SECRET")
	}
	if cfg.Media.R2Bucket == "" {
		missing = append(missing, "R2_BUCKET")
	}
	if cfg.Media.R2Endpoint == "" {
		missing = append(missing, "R2_ENDPOINT")
	}
	if cfg.Media.R2AccessKeyID == "" {
		missing = append(missing, "R2_ACCESS_KEY_ID")
	}
	if cfg.Media.R2SecretAccessKey == "" {
		missing = append(missing, "R2_SECRET_ACCESS_KEY")
	}
	if cfg.Media.CDNBaseURL == "" {
		missing = append(missing, "CDN_BASE_URL")
	}

	if len(missing) > 0 {
		return fmt.Errorf("missing required env vars: %v", missing)
	}
	return nil
}
