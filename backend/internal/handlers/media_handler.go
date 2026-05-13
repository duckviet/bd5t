package handlers

import (
	"net/http"

	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/media"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type MediaAPI struct {
	mediaService       *media.MediaService
	fileStorageService *media.FileStorageService
}

func NewMediaAPI(mediaService *media.MediaService, fileStorageService *media.FileStorageService) *MediaAPI {
	return &MediaAPI{
		mediaService:       mediaService,
		fileStorageService: fileStorageService,
	}
}

func (h *MediaAPI) UploadMedia(c *gin.Context) {
	auth.MustGetCurrentUser(c)

	file, err := c.FormFile("file")
	if err != nil {
		response.Error(c, &media.ValidationError{Message: "file is required"})
		return
	}

	mediaType := c.PostForm("type")
	if mediaType == "" {
		response.Error(c, &media.ValidationError{Message: "type is required"})
		return
	}

	var result *media.UploadResult

	switch mediaType {
	case string(media.MediaTypeAvatar), string(media.MediaTypeThumbnail):
		result, err = h.mediaService.UploadImage(c.Request.Context(), file, media.MediaType(mediaType))
	case string(media.MediaTypeEvidence):
		result, err = h.fileStorageService.UploadEvidence(c.Request.Context(), file)
	default:
		response.Error(c, &media.ValidationError{Message: "invalid type. allowed: avatar, thumbnail, evidence"})
		return
	}

	if err != nil {
		response.Error(c, err)
		return
	}

	if result == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UPLOAD_FAILED",
				"message": "Failed to upload file",
			},
		})
		return
	}

	response.OK(c, gin.H{
		"url": result.URL,
		"key": result.Key,
	})
}
