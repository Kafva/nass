package server

import (
	"net/http"
)

func GetPass(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")

  user := MapReqToUser(res, req) 
  if user.Name == "" { return }

  res.Write([]byte("{ \"You\": \""+user.Name+"\" }\n"))
}

// /add?path=Service/web
//   value=*****
//   generate=falss
func AddPass(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")

  user := MapReqToUser(res, req) 
  if user.Name == "" { return }

  res.Write([]byte("{ \"You\": \""+user.Name+"\" }\n"))
}

func DelPass(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")

  user := MapReqToUser(res, req) 
  if user.Name == "" { return }

  res.Write([]byte("{ \"You\": \""+user.Name+"\" }\n"))
}




