package media

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/google/uuid"
)

type FileStorageService struct {
	r2Client   *R2Client
	maxSize    int64
	cdnBaseURL string
}

func NewFileStorageService(r2Client *R2Client, cfg config.MediaConfig) *FileStorageService {
	return &FileStorageService{
		r2Client:   r2Client,
		maxSize:    cfg.MaxEvidenceSizeBytes,
		cdnBaseURL: cfg.CDNBaseURL,
	}
}

func (s *FileStorageService) UploadEvidence(ctx context.Context, file *multipart.FileHeader) (*UploadResult, error) {
	if err := ValidateFile(file.Filename, file.Header.Get("Content-Type"), file.Size, MediaTypeEvidence, s.maxSize); err != nil {
		return nil, err
	}

	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	key := s.generateKey(file.Filename)
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

func (s *FileStorageService) DeleteFile(ctx context.Context, key string) error {
	return s.r2Client.Delete(ctx, key)
}

func (s *FileStorageService) generateKey(fileName string) string {
	ext := GetExtension(fileName)
	return fmt.Sprintf("evidence/%s%s", uuid.New().String(), ext)
}
