package server

import (
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"
)

/*
1. Try to reveal the password using a cached pin:
    GET /get?path=<...>
  PASSWORD_STORE_GPG_OPTS="--pinentry-mode error --no-tty"

2. If this fails, prompt the user for the master password and re-run:
    POST /get?path=<...>
    pass=<...>
  PASSWORD_STORE_GPG_OPTS="--pinentry-mode loopback --passphrase $PASSPHRASE"

  https://superuser.com/a/1212720/986426
*/
func GetPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Set("Content-Type", "application/json")

  if req.Method != http.MethodPost && req.Method != http.MethodGet {
    ErrorResponse(res, "Unsupported method", http.StatusForbidden)
    return
  }

  user := MapReqToUser(res, req)
  if user.Name == "" { return }

  passPath := validatePath(res, req)
  if passPath == "" { return }

  cmd := exec.Command(CONFIG.PassBinary, passPath)
  cmd.Env = os.Environ()

  if req.Method == http.MethodGet {
    cmd.Env = append(cmd.Env,
      "PASSWORD_STORE_GPG_OPTS=--pinentry-mode error --no-tty",
    )
  } else {
    req.ParseForm()

    passphrase := formGet(res, req, "pass")
    if passphrase == "" { return }

    cmd.Env = append(cmd.Env,
      "PASSWORD_STORE_GPG_OPTS=--pinentry-mode loopback --passphrase " +
      passphrase,
    )
  }

  bytes, err := cmd.CombinedOutput()
  output := strings.TrimSpace(string(bytes))

  if err != nil && output == GPG_FAIL_STRING {
    // We need a nil check on 'err' in case that someone sets
    // 'GPG_FAIL_STRING' as their password
    if req.Method == http.MethodGet {
      // GET: Retry with PIN entry request (POST) to the same endpoint
      res.Write([]byte("{ \"Status\": \"retry\" }\n"))
    } else {
      // POST: Invalid PIN entry
      ErrorResponse(res, "Incorrect PIN entry", http.StatusBadRequest)
    }
  } else if err != nil {
    // Reply with decrypted password
    res.Write([]byte("{ \"Value\": \""+output+"\" }\n"))
  } else {
    // Fallback for other errors
    ErrorResponse(res, output, http.StatusBadRequest)
  }
}

/*
 POST /add?path=Service/web
   pass=*****
   generate=false
*/
func AddPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Set("Content-Type", "application/json")

  if req.Method != http.MethodPost {
    ErrorResponse(res, "Unsupported method", http.StatusForbidden)
    return
  }

  user := MapReqToUser(res, req)
  if user.Name == "" { return }

  passPath := validatePath(res, req)
  if passPath == "" { return }

  req.ParseForm()

  passphrase := formGet(res, req, "pass")
  if passphrase == "" { return }

  // TODO switch to multi user
  // generate := formGet(res, req, "generate") == "true"

  res.Write([]byte("{ \"You\": \""+user.Name+" "+passPath+"\" }\n"))
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
  regex := regexp.MustCompile(PASSENTRY_REGEX)

  if regex.Match([]byte(passPath)) &&
   strings.Count(passPath, "/") <= MAX_PASS_DEPTH &&
   !strings.HasPrefix(passPath, "/") &&
   !strings.HasSuffix(passPath, "/") {
    return passPath
  } else {
    ErrorResponse(res, "Invalid path format", http.StatusBadRequest)
    return ""
  }
}


func formGet(res http.ResponseWriter, req *http.Request, param string) string {
    value := req.Form.Get(param)

    if value == "" {
      ErrorResponse(res, "Missing value for "+param, http.StatusBadRequest)
    }
    return value
}
