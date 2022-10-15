package server

import (
	"net/http"
	"os"
	"strings"
)

func GetPass(res http.ResponseWriter, req *http.Request) {
  var user = User{}
  if !requestIsValid(res, req, &user) { return }

  res.Write([]byte("hey: "+user.Name+"\n"))
}

// /add?path=Service/web
//   value=*****
//   generate=falss
func AddPass(res http.ResponseWriter, req *http.Request) {
  var user = User{}
  if !requestIsValid(res, req, &user) { return }

  res.Write([]byte("hey: "+user.Name+"\n"))
}

func DelPass(res http.ResponseWriter, req *http.Request) {
  var user = User{}
  if !requestIsValid(res, req, &user) { return }

  res.Write([]byte("hey: "+user.Name+"\n"))
}

// Respond with the subtree of the password store that
// relates to the origin of the request as:
//
//  [
//    "dir0": [
//      "dir1": [
//          "pass0", "pass1"
//      ]
//    ]
//    "dir1": [...]
//  ]
func ListPass(res http.ResponseWriter, req *http.Request) {
  var user = User{}
  if !requestIsValid(res, req, &user) { return }

  res.Write([]byte("hey: "+user.Name+"\n"))
}


// Verify that the correct PSK has been provided and set
// the `User` that matches the origin of the request
func requestIsValid(res http.ResponseWriter, req *http.Request, user *User) bool {
  if req.Header.Get(PSK_HEADER) != os.Getenv(PSK_ENV) {
    Warn("Invalid PSK received from "+ipFromAddr(req))
    return errorResponse(res, "Invalid PSK")
  }
  *user = mapReqToUser(req)
  if user.Name == "" {
    Warn("Origin has no matching user: "+ipFromAddr(req))
    return errorResponse(res, "Invalid origin or user")
  }
  return true
}

func ipFromAddr(req *http.Request) string {
  remoteAddr := strings.SplitN(req.RemoteAddr, ":", 2)
  if len(remoteAddr) == 2 {
    return remoteAddr[0]
  } else {
    return ""
  }
}

func mapReqToUser(req *http.Request) User {
  if remoteIP := ipFromAddr(req); remoteIP != "" {
     for _,user := range USERS {
       if user.HasOrigin(remoteIP) {
         return user
       }
     }
  }
  return User{}
}

func errorResponse(res http.ResponseWriter, msg string) bool {
  res.WriteHeader(http.StatusUnauthorized)
  res.Write([]byte("{ error: \""+msg+"\" }\n"))
  return false
}




