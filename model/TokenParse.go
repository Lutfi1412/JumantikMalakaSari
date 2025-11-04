package model

type CustomClaims struct {
	ID   string `json:"id"`
	Role string `json:"role"`
}

type CheckToken struct {
	Token string `json:"token" binding:"required"`
}
