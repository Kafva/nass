package server

import "net/http"

func GetPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

func AddPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

func DelPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

func ListPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

