package server

import (
	"net/http"
	//"os/exec"
	"regexp"
)

/*
1. Try to reveal the password using a cached pin:
  export PASSWORD_STORE_GPG_OPTS="--pinentry-mode error --no-tty"
2. If this fails, prompt the user for the master password and re-run:
  export PASSWORD_STORE_GPG_OPTS="--pinentry-mode loopback --passphrase $PASSPHRASE"

  https://superuser.com/a/1212720/986426
*/
func GetPass(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")

  user := MapReqToUser(res, req)
  if user.Name == "" { return }

  passPath := validatePath(res, req)
  if passPath == "" { return }


  //exec.Command("pass", )

  res.Write([]byte("{ \"You\": \""+user.Name+"\" }\n"))
}

/*
 /add?path=Service/web
   value=*****
   generate=falss
*/
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

// Returns a sanitized password entry path (relative to the current user's root)
// on success and an empty string if validation fails.
func validatePath(res http.ResponseWriter, req *http.Request) string {
  passPath := req.URL.Query().Get("path")
  regex := regexp.MustCompile(PASSPATH_REGEX)
  Debug(passPath)
  if regex.Match([]byte(passPath)) {
    return passPath
  } else {
    ErrorResponse(res, "Invalid path format", http.StatusBadRequest)
    return ""
  }
}


