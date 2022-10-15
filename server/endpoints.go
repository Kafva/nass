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

type JsonDir struct {
	Children map[string]JsonDir
}

// Respond with the subtree of the password store that
// relates to the origin of the request as:
//
//  [
//    "dir0": [
//      "dir1": [
//          "pass0", "pass1"
//      ],
//			"dir2": [...]
//    ]
//    "dir1": [...]
//  ]
func ListPass(res http.ResponseWriter, req *http.Request) {
  var user = User{}
  if !requestIsValid(res, req, &user) { return }

	dirs := map[string]JsonDir{}

	//rootDir := ExpandTilde(CONFIG.Passwordstore)+"/"+user.Name
	rootDir := ExpandTilde(CONFIG.Passwordstore)
	filepath.WalkDir(rootDir, func (path string, d fs.DirEntry, err error) error {
		name := d.Name()
		if strings.HasPrefix(name, ".git") || name == ".gpg-id" {
			if d.IsDir() {
				return filepath.SkipDir
			} else {
				return nil
			}
		}

		// Extract the parent directories relative to the rootDir
		nodes := strings.Split(strings.TrimPrefix(path, rootDir), "/")

		// Go down the corresponding number of levels in the `dirs`
		cursor := dirs

		for _,node := range nodes {
			// Create a new `JsonDir` if a matching entry does not already exist
			// at the current level
			if _, ok := cursor[node]; !ok {
				cursor[node] = JsonDir{ Children: map[string]JsonDir{} }
			}
			cursor = cursor[node].Children
		}

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




