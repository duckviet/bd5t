package handlers

import (
	"strconv"

	"github.com/duckviet/bd5t/backend/internal/auth"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type StudentsAPI struct {
	studentService *svcImpl.StudentService
}

func NewStudentsAPI(studentService *svcImpl.StudentService) *StudentsAPI {
	return &StudentsAPI{studentService: studentService}
}

func (h *StudentsAPI) SearchStudents(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)
	q := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	result, err := h.studentService.SearchStudents(c.Request.Context(), user.ID, q, page, pageSize)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Paginated(c, result.Data, &response.PaginationMeta{
		Page:       result.Page,
		PageSize:   result.PageSize,
		Total:      result.Total,
		TotalPages: result.TotalPages,
	})
}
