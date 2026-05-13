# Media & File Storage

## Project: Ban Do 5 Tot

---

## 1. Storage Backend

All media and files are stored in **Cloudflare R2**.

R2 is S3-compatible, so the AWS SDK or any S3-compatible client can be used.

---

## 2. Service Separation

Two distinct services handle different upload types:

### MediaService — images only
Used for: avatars, thumbnails, activity cover images

```go
type MediaService interface {
    UploadImage(ctx context.Context, file multipart.File) (*MediaUploadResult, error)
    DeleteObject(ctx context.Context, key string) error
}
```

### FileStorageService — generic files
Used for: evidence files (PDF, JPG, PNG, etc.)

```go
type FileStorageService interface {
    UploadFile(ctx context.Context, filename string, contentType string, r io.Reader, size int64) (*StoredFile, error)
    DeleteFile(ctx context.Context, key string) error
}
```

> Do not force evidence files through an image-only pipeline. Evidence may be PDF or other non-image formats.

---

## 3. MediaService Responsibilities

- Validate file type and size
- Optionally resize or compress images
- Upload to Cloudflare R2
- Return metadata to the calling service/handler

---

## 4. FileStorageService Responsibilities

- Accept any file type allowed by policy
- Validate content type against whitelist
- Enforce file size limits
- Upload raw to Cloudflare R2
- Return stored file metadata

---

## 5. Validation Rules

### Image uploads (MediaService)

| Rule | Value |
|---|---|
| Allowed types | `image/jpeg`, `image/png` |
| Max file size | 5 MB (avatars) |
| Reject if | File cannot be decoded as image |

### Evidence file uploads (FileStorageService)

| Rule | Value |
|---|---|
| Allowed types | `image/jpeg`, `image/png`, `application/pdf` |
| Max file size | 10 MB (configurable) |
| Reject if | Content type not in whitelist |

---

## 6. Result Types

```go
type MediaUploadResult struct {
    Key         string
    URL         string
    ContentType string
    Size        int64
}

type StoredFile struct {
    Key         string
    URL         string
    Filename    string
    ContentType string
    Size        int64
}
```

---

## 7. Rate Limiting

Apply rate limits on upload endpoints:

- `POST /media/upload` — image upload
- `POST /evidences` — evidence submission (includes file)

Limits should be enforced:
- Per IP (unauthenticated)
- Per user ID (authenticated)

See `MAKEFILE.md` or the middleware config for rate limit values.

---

## 8. Request Size Limits

Configure Gin's body size limits:

| Upload type | Max body size |
|---|---|
| Avatar / thumbnail | 5 MB |
| Evidence file | 10–20 MB |
| JSON body | 1 MB |

---

## 9. Directory Structure

```text
internal/
  media/
    media_service.go         ← MediaService implementation
    file_storage_service.go  ← FileStorageService implementation
    r2_client.go             ← Cloudflare R2 client setup
    validation.go            ← file type and size validators
```

---

## 10. Configuration

The following values should be in config (not hardcoded):

```yaml
media:
  r2_bucket: "ban-do-5-tot-media"
  r2_endpoint: "https://<account>.r2.cloudflarestorage.com"
  r2_access_key_id: "<from env>"
  r2_secret_access_key: "<from env>"
  cdn_base_url: "https://cdn.example.com"
  max_image_size_bytes: 5242880     # 5 MB
  max_evidence_size_bytes: 10485760 # 10 MB
```

---

## 11. Future Considerations

- Signed upload URLs — allow clients to upload directly to R2
- Background cleanup job — remove orphan files not linked to any record
- Image optimization pipeline — WebP conversion for thumbnails