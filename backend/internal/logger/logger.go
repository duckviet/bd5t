package logger

import (
	"os"

	"github.com/rs/zerolog"
)

var log zerolog.Logger

func init() {
	env := os.Getenv("APP_ENV")
	if env == "production" {
		log = zerolog.New(os.Stdout).With().Timestamp().Logger()
	} else {
		log = zerolog.New(consoleWriter()).With().Timestamp().Logger()
	}
}

func Log() *zerolog.Event {
	return log.Info()
}

func Error() *zerolog.Event {
	return log.Error()
}

func Debug() *zerolog.Event {
	return log.Debug()
}

func Warn() *zerolog.Event {
	return log.Warn()
}

func consoleWriter() zerolog.ConsoleWriter {
	return zerolog.ConsoleWriter{Out: os.Stdout}
}
