package media

import (
	"fmt"
	"mime"
	"path/filepath"
	"strings"
)

type MediaType string

const (
	MediaTypeAvatar    MediaType = "avatar"
	MediaTypeThumbnail MediaType = "thumbnail"
	MediaTypeEvidence  MediaType = "evidence"
)

var allowedImageMimes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

var allowedEvidenceMimes = map[string]bool{
	"application/pdf": true,
	"image/jpeg":      true,
	"image/png":       true,
}

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

func ValidateFile(fileName string, contentType string, size int64, mediaType MediaType, maxSize int64) error {
	if size > maxSize {
		return &ValidationError{Message: fmt.Sprintf("file size exceeds maximum allowed size of %d bytes", maxSize)}
	}

	if contentType == "" {
		ext := filepath.Ext(fileName)
		contentType = mime.TypeByExtension(ext)
	}

	if mediaType == MediaTypeAvatar || mediaType == MediaTypeThumbnail {
		if !allowedImageMimes[contentType] {
			return &ValidationError{Message: "invalid image format. allowed: jpeg, png, gif, webp"}
		}
	} else if mediaType == MediaTypeEvidence {
		if !allowedEvidenceMimes[contentType] {
			return &ValidationError{Message: "invalid file format for evidence. allowed: pdf, jpeg, png"}
		}
	}

	return nil
}

func GetExtension(fileName string) string {
	ext := strings.ToLower(filepath.Ext(fileName))
	return ext
}

func GetContentType(fileName string) string {
	ext := GetExtension(fileName)
	return mime.TypeByExtension(ext)
}
