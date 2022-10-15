package server

import (
	"encoding/json"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
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


// Respond with the subtree of the password store for the relevant user:
//  {
//    "Name": "user",
//    "Children": [
//      {
//        "Name": "Service",
//        "Children": [
//          {
//            "Name": "acc1.gpg",
//            "Children": []
//          },
//          ...
//        ]
//      },
//		],
//   ...
//
func ListPass(res http.ResponseWriter, req *http.Request) {
  var user = User{}
  if !requestIsValid(res, req, &user) { return }

	dirs := JsonEntry{ Name: user.Name }

	//rootDir := ExpandTilde(CONFIG.Passwordstore)+"/"+user.Name TODO
	rootDir := ExpandTilde(CONFIG.Passwordstore)

	filepath.WalkDir(rootDir, func (path string, d fs.DirEntry, err error) error {
		name := d.Name()
		if name == ".git" {
				return filepath.SkipDir
		}
		if strings.HasPrefix(name, ".git") || name == ".gpg-id" || 
			name == filepath.Base(rootDir) {
				return nil
		}

		nodes := strings.Split(strings.TrimPrefix(path, rootDir+"/"), "/")
		dirs.AddChildren(nodes)
		return nil
	})

	data,err := json.Marshal(dirs)
	if err != nil {
		Die(err)
	}

  res.Write([]byte(data))
}


// Verify that the correct PSK has been provided and set
// the `User` that matches the origin of the request
func requestIsValid(res http.ResponseWriter, req *http.Request, user *User) bool {
	res.Header().Set("Content-Type", "application/json")

  if req.Header.Get(PSK_HEADER) != os.Getenv(PSK_ENV) {
    Warn("Invalid PSK received from "+ipFromAddr(req))
    return errorResponse(res, "Unauthorized")
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
  res.Write([]byte("{ \"Error\": \""+msg+"\" }\n"))
  return false
}


