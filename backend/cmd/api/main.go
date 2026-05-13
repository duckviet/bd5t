package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/duckviet/bd5t/backend/internal/database/postgres"
	"github.com/duckviet/bd5t/backend/internal/handlers"
	"github.com/duckviet/bd5t/backend/internal/handlers/middleware"
	"github.com/duckviet/bd5t/backend/internal/media"
	repoImpl "github.com/duckviet/bd5t/backend/internal/repository/impl"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := postgres.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(context.Background()); err != nil {
		log.Fatalf("Database health check failed: %v", err)
	}
	log.Println("Database connected and healthy")

	router := setupRouter(cfg, db)

	srv := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler: router,
	}

	go func() {
		log.Printf("Starting server on %s:%s", cfg.Server.Host, cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

func setupRouter(cfg *config.Config, db *pgxpool.Pool) *gin.Engine {
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	middlewareStack(router, cfg)

	tokenMgr := auth.NewTokenManager(cfg)

	userRepo := repoImpl.NewUserRepository(db)
	authService := svcImpl.NewAuthService(userRepo, tokenMgr)
	authAPI := handlers.NewAuthAPI(authService)

	unitRepo := repoImpl.NewUnitRepository(db)
	unitService := svcImpl.NewUnitService(unitRepo)
	unitsAPI := handlers.NewUnitsAPI(unitService)

	activityRepo := repoImpl.NewActivityRepository(db)
	activityService := svcImpl.NewActivityService(activityRepo)
	activitiesAPI := handlers.NewActivitiesAPI(activityService)

	profileService := svcImpl.NewProfileService(userRepo, unitRepo)
	profileAPI := handlers.NewProfileAPI(profileService)

	r2Client, err := media.NewR2Client(
		cfg.Media.R2Endpoint,
		cfg.Media.R2AccessKeyID,
		cfg.Media.R2SecretAccessKey,
		cfg.Media.R2Bucket,
		cfg.Media.CDNBaseURL,
	)
	if err != nil {
		log.Fatalf("Failed to create R2 client: %v", err)
	}

	mediaService := media.NewMediaService(r2Client, cfg.Media)
	fileStorageService := media.NewFileStorageService(r2Client, cfg.Media)
	mediaAPI := handlers.NewMediaAPI(mediaService, fileStorageService)

	evidenceRepo := repoImpl.NewEvidenceRepository(db)
	evidenceService := svcImpl.NewEvidenceService(evidenceRepo, activityRepo, fileStorageService, mediaService, cfg.Media)
	evidencesAPI := handlers.NewEvidencesAPI(evidenceService)

	progressRepo := repoImpl.NewProgressRepository(db)
	progressService := svcImpl.NewProgressService(progressRepo, evidenceRepo, activityRepo)
	progressAPI := handlers.NewProgressAPI(progressService)

	leaderboardRepo := repoImpl.NewLeaderboardRepository(db)
	leaderboardService := svcImpl.NewLeaderboardService(leaderboardRepo)
	leaderboardAPI := handlers.NewLeaderboardAPI(leaderboardService)

	adminService := svcImpl.NewAdminService(evidenceRepo, activityRepo, progressService)
	adminAPI := handlers.NewAdminAPI(adminService)

	healthAPI := handlers.NewHealthAPI()

	authGroup := router.Group("/auth")
	{
		authGroup.POST("/register", authAPI.Register)
		authGroup.POST("/login", authAPI.Login)
		authGroup.POST("/logout", middleware.AuthRequired(tokenMgr), authAPI.Logout)
		authGroup.POST("/refresh", authAPI.Refresh)
		authGroup.GET("/me", middleware.AuthRequired(tokenMgr), authAPI.Me)
	}

	router.GET("/units", unitsAPI.ListUnits)
	router.GET("/activities", activitiesAPI.ListActivities)
	router.GET("/activities/:slug", activitiesAPI.GetActivityDetail)

	router.GET("/profile", middleware.AuthRequired(tokenMgr), profileAPI.GetProfile)
	router.PATCH("/profile", middleware.AuthRequired(tokenMgr), profileAPI.UpdateProfile)

	router.POST("/media/upload", middleware.AuthRequired(tokenMgr), mediaAPI.UploadMedia)

	router.GET("/evidences", middleware.AuthRequired(tokenMgr), evidencesAPI.ListEvidences)
	router.POST("/evidences", middleware.AuthRequired(tokenMgr), evidencesAPI.CreateEvidence)
	router.DELETE("/evidences/:id", middleware.AuthRequired(tokenMgr), evidencesAPI.DeleteEvidence)

	router.GET("/progress", middleware.AuthRequired(tokenMgr), progressAPI.GetProgress)
	router.GET("/leaderboard", leaderboardAPI.ListLeaderboard)

	router.GET("/healthz", healthAPI.Healthz)
	router.GET("/readyz", healthAPI.Readyz)

	adminGroup := router.Group("/admin")
	{
		adminGroup.PATCH("/evidences/:id/review", middleware.AdminRequired(tokenMgr), adminAPI.ReviewEvidence)
		adminGroup.POST("/activities", middleware.AdminRequired(tokenMgr), adminAPI.CreateActivity)
		adminGroup.PATCH("/activities/:id", middleware.AdminRequired(tokenMgr), adminAPI.UpdateActivity)
		adminGroup.DELETE("/activities/:id", middleware.AdminRequired(tokenMgr), adminAPI.DeleteActivity)
	}

	return router
}

func middlewareStack(router *gin.Engine, cfg *config.Config) {
	router.Use(middleware.Recovery())
	router.Use(middleware.RequestID())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.RateLimiter(cfg.RateLimit))
}
