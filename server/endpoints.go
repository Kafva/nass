package server

import (
	"io"
	"math/rand"
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

  passPath := validatePath(res, req, &user)
  if passPath == "" { return }

  cmd := exec.Command(CONFIG.PassBinary, passPath)
  cmd.Env = os.Environ()

  if req.Method == http.MethodGet {
    cmd.Env = append(cmd.Env,
      "PASSWORD_STORE_GPG_OPTS=--pinentry-mode error --no-tty",
    )
  } else {
    req.ParseForm()

    passphrase := formGet(res, req, "pass", true)
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
      WriteResponse(res, StatusRetry, 
                    "Retry with PIN entry in POST request", "")
    } else {
      // POST: Invalid PIN entry
      ErrorResponse(res, "Incorrect PIN entry", http.StatusBadRequest)
    }
  } else if err == nil {
    // Reply with decrypted password
    WriteResponse(res, StatusSuccess, "", output)
  } else {
    // Fallback for other errors
    Err(err)
    ErrorResponse(res, output, http.StatusBadRequest)
  }
}

/*
 POST /add?path=Service/web
   pass=[********]
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

  passPath := validatePath(res, req, &user)
  if passPath == "" { return }

  req.ParseForm()

  passphrase := formGet(res, req, "pass", false)
  generate   := formGet(res, req, "generate", false) == "true"

  if passphrase == "" && !generate { return }

  fspath := CONFIG.Passwordstore+"/"+passPath+".gpg"

  if !Exists(fspath) {
    if generate {
      passphrase = genPass()
    }

    cmd := exec.Command(CONFIG.PassBinary, "insert", passPath)
    stdin, err := cmd.StdinPipe()
    defer stdin.Close()

    if err != nil {
      ErrorResponse(res, "Failed to open stdin", http.StatusInternalServerError)
      return
    }
    err = cmd.Start()
    if err != nil {
      ErrorResponse(res, "Failed to start pass", http.StatusInternalServerError)
      return
    }

    // Provide the password twice for confirmation
    io.WriteString(stdin, passphrase+"\n"+passphrase+"\n")
    cmd.Wait()

    if cmd.ProcessState.ExitCode() == 0 && generate {
      // Respond with generated passphrase
      WriteResponse(res, StatusSuccess, "", passphrase)

    } else if cmd.ProcessState.ExitCode() == 0 {
      WriteResponse(res, StatusSuccess, "", "")

    } else {
      ErrorResponse(res, "Failed to insert password",
                    http.StatusInternalServerError)
    }
  } else {
    ErrorResponse(res, "Entry already exists", http.StatusBadRequest)
  }
}

/*
  This operation works for both directories and lone files
  DELETE /del?path=Service/web
*/
func DelPass(res http.ResponseWriter, req *http.Request) {
  res.Header().Set("Content-Type", "application/json")

  if req.Method != http.MethodDelete {
    ErrorResponse(res, "Unsupported method", http.StatusForbidden)
    return
  }

  user := MapReqToUser(res, req)
  if user.Name == "" { return }

  passPath := validatePath(res, req, &user)
  if passPath == "" { return }

  fspath := CONFIG.Passwordstore+"/"+passPath
  if IsDir(fspath) || IsFile(fspath+".gpg") {
    _, err := exec.Command(CONFIG.PassBinary, "rm", "--force", passPath).Output()
    if err != nil {
      ErrorResponse(res, "Failed to remove password", 
                    http.StatusInternalServerError)
      return
    }
  } else {
    ErrorResponse(res, "Invalid path", http.StatusBadRequest)
    return
  }

  WriteResponse(res, StatusSuccess, "", "")
}

// Returns a sanitized password entry path on success and an empty string if
// validation fails. The path should be specified relative to the current user
// unless the `SingleUser` mode is active.
// '.' is not allowed as a prefix or suffix
// Sequences of '.' are not allowed
func validatePath(res http.ResponseWriter, req *http.Request, user *User) string {
  passPath := req.URL.Query().Get("path")

  if ! CONFIG.SingleUser {
    passPath = user.Name + "/" + passPath
  }

  regex := regexp.MustCompile(PASSENTRY_REGEX)

  if regex.Match([]byte(passPath)) &&
   strings.Count(passPath, "/") <= MAX_PASS_DEPTH &&
   !strings.Contains(passPath, "//") &&
   !strings.Contains(passPath, ".gpg") &&
   !strings.Contains(passPath, "..") &&
   !strings.Contains(passPath, "/.") &&
   !strings.Contains(passPath, "./") &&
   !strings.HasPrefix(passPath, "/") &&
   !strings.HasSuffix(passPath, "/") {
    return passPath
  } else {
    ErrorResponse(res, "Invalid path format", http.StatusBadRequest)
    return ""
  }
}

// There is a built-in password generation option in `pass` but
// we would like the output to be alpha-numerics + certain symbols (not any
// ASCII symbol).
func genPass() string {
  password := ""
  for len(password) < GEN_PASS_LEN {
     idx := rand.Intn(len(GEN_PASS_CHARS))
     password = password + GEN_PASS_CHARS[idx:idx+1]
  }
  return password
}

func formGet(res http.ResponseWriter, req *http.Request, param string,
             mandatory bool) string {
    value := req.Form.Get(param)

    if value == "" && mandatory {
      ErrorResponse(res, "Missing value for "+param, http.StatusBadRequest)
    }
    return value
}


