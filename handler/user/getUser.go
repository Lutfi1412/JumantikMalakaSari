package user

import (
	"context"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

func GetUser(c *gin.Context) {
	role := c.GetString("role")

	if role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	query := `
		SELECT hashing_id, nama, rw, role, rt
		FROM users
		ORDER BY 
			CASE 
				WHEN role = 'admin' THEN 1
				WHEN role = 'koordinator' THEN 2
				WHEN role = 'petugas' THEN 3
				ELSE 4
			END
	`

	rows, err := config.Pool.Query(context.Background(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch users"})
		return
	}
	defer rows.Close()

	var users []model.TableUser

	for rows.Next() {
		var user model.TableUser
		err := rows.Scan(&user.Id, &user.Nama, &user.Rw, &user.Role, &user.Rt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error scanning user data"})
			return
		}

		// hapus prefix \ atau \\ sehingga string mulai langsung dari "x"
		if len(user.Id) >= 1 && (user.Id[0] == '\\' || user.Id[:2] == `\\`) {
			user.Id = user.Id[len(`\`):] // hapus satu karakter \ di depan
		}

		users = append(users, user)
	}

	response := model.GetUser{
		TableUser: users,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success",
		"data":    response,
	})
}
