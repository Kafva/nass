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
    passphrase := req.Form.Get("pass")

    if passphrase == "" {
      ErrorResponse(res, "Missing value for passphrase", http.StatusBadRequest)
      return
    }

    cmd.Env = append(cmd.Env,
      "PASSWORD_STORE_GPG_OPTS=--pinentry-mode loopback --passphrase " +
      passphrase,
    )
  }

  bytes, err := cmd.CombinedOutput()
  output := strings.TrimSpace(string(bytes))

  if err != nil && output != GPG_FAIL_STRING {
    // Non-existant password or other error
    ErrorResponse(res, output, http.StatusBadRequest)

  } else if output == GPG_FAIL_STRING {
    if req.Method == http.MethodGet {
      // Retry with POST request to the same endpoint
      res.Write([]byte("{ \"Status\": \"retry\" }\n"))
    } else {
      ErrorResponse(res, output, http.StatusBadRequest)
    }

  } else if err == nil {
    // Reply with decrypted password
    res.Write([]byte("{ \"Value\": \""+output+"\" }\n"))
  } else {
    // This should never happen
    ErrorResponse(res, "Bad request", http.StatusBadRequest)
  }
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


