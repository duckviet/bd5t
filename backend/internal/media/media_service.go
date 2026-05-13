package media

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/google/uuid"
)

type MediaService struct {
	r2Client   *R2Client
	maxSize    int64
	cdnBaseURL string
}

func NewMediaService(r2Client *R2Client, cfg config.MediaConfig) *MediaService {
	return &MediaService{
		r2Client:   r2Client,
		maxSize:    cfg.MaxImageSizeBytes,
		cdnBaseURL: cfg.CDNBaseURL,
	}
}

type UploadResult struct {
	URL string
	Key string
}

func (s *MediaService) UploadImage(ctx context.Context, file *multipart.FileHeader, mediaType MediaType) (*UploadResult, error) {
	if err := ValidateFile(file.Filename, file.Header.Get("Content-Type"), file.Size, mediaType, s.maxSize); err != nil {
		return nil, err
	}

	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	key := s.generateKey(mediaType, file.Filename)
	contentType := GetContentType(file.Filename)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	if err := s.r2Client.Upload(ctx, key, src, contentType); err != nil {
		return nil, fmt.Errorf("failed to upload to R2: %w", err)
	}

	return &UploadResult{
		URL: s.r2Client.GetURL(key),
		Key: key,
	}, nil
}

func (s *MediaService) generateKey(mediaType MediaType, fileName string) string {
	ext := GetExtension(fileName)
	return fmt.Sprintf("%s/%s%s", mediaType, uuid.New().String(), ext)
}
