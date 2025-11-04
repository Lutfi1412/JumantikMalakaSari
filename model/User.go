package model

type CreateUser struct {
	Nama     string `json:"nama" binding:"required"`
	Rt       int32  `json:"rt"`
	Rw       int32  `json:"rw"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateUser struct {
	UserName    string `json:"username" binding:"required"`
	PasswordNew string `json:"password_new" binding:"required"`
}

type GetUser struct {
	TableUser []TableUser `json:"table_user"`
}

type TableUser struct {
	Id   string `json:"id"`
	Nama string `json:"nama"`
	Rw   int32  `json:"rw"`
	Role string `json:"role"`
	Rt   int32  `json:"rt"`
}
