package util

import (
	"os"

	"api-jumantik/model"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(os.Getenv("SECRET_KEY"))

func GenerateToken(userID string, role string) (string, error) {
	claims := jwt.MapClaims{
		"id":   userID,
		"role": role,
		// "exp":  time.Now().Add(1 * time.Minute).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func ParseToken(tokenStr string) (*model.CustomClaims, error) {

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %v", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("failed to parse claims")
	}

	// Ambil nilai id dan role dari payload
	id, _ := claims["id"].(string)
	role, _ := claims["role"].(string)

	return &model.CustomClaims{
		ID:   id,
		Role: role,
	}, nil
}
