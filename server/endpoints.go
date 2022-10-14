package server

import (
	"net/http"
	"strings"
)

func GetPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

/// /add?path=Service/web  
///   value=*****
///   generate=falss
func AddPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

func DelPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

/// Responed with the subtree of the password store that
/// relates to the origin of the request as:
/// 
///	[
///		"dir0": [
///			"dir1": [
///					"pass0", "pass1"
///			]
///		]
///		"dir1": [...]
///	]
func ListPass(res http.ResponseWriter, req *http.Request) {
	user := mapReqToUser(req)
	if user.Name == "" {
		res.Write([]byte{})
	} else {
		res.Write([]byte("hey: "+user.Name+"\n"))
	}
}

func mapReqToUser(req *http.Request) User {
	remoteAddr := strings.SplitN(req.RemoteAddr, ":", 2)
	if len(remoteAddr) == 2 {
		remoteIP := remoteAddr[0]

		for _,user := range USERS {
			if user.HasOrigin(remoteIP) {
				return user
			}
		}
	}

	return User{}
}
