package server

import (
  "net/http"
  "net/http/httptest"
  "os"
  "runtime/debug"
  "strconv"
  "strings"
  "testing"
)

const USERNAME = "tester"

// Test if path validation of `value` results in the `expected` output
func assert_validatePath(t *testing.T, res http.ResponseWriter,
                         req *http.Request, user *User,
                         value string, expected string) {
  req.URL.RawQuery = "path="+value

  validated :=  validatePath(res, req, user, true)

  if expected != validated  {
    debug.PrintStack()
    t.Error("Expected: '"+expected+"', Actual: '"+validated+"'")
  }
}

// Test if password validation of `value` results in the `expected` output
func assert_validatePassword(t *testing.T, res http.ResponseWriter,
                             value string, expected string) {
  validated :=  validatePassword(res, value)

  if expected != validated  {
    debug.PrintStack()
    t.Error("Expected: '"+expected+"', Actual: '"+validated+"'")
  }
}

func Test_validatePath(t *testing.T) {
  CONFIG.Passwordstore = "/tmp/.password-store"
  CONFIG.SingleUser = false
  user := User { Name: USERNAME, Origins: []string{} }

  req := httptest.NewRequest(http.MethodGet, "/get?path=", nil)
  res := httptest.NewRecorder()

  // /tmp/.password-store
  // └── tester
  //     ├── Email
  //     │   └── already@here.gpg
  //     └── a
  //         └── b
  //             └── c
  //                 └── d.gpg
  passRoot := CONFIG.Passwordstore + "/" + USERNAME
  os.MkdirAll(passRoot, 0777)
  os.MkdirAll(passRoot+"/Email", 0777)
  os.MkdirAll(passRoot+"/a/b/c", 0777)
  os.OpenFile(passRoot+"/a/b/c/d.gpg", os.O_RDONLY|os.O_CREATE, 0666)
  os.OpenFile(passRoot+"/Email/already@here.gpg", os.O_RDONLY|os.O_CREATE, 0666)

  /* VALID */
  assert_validatePath(t, res, req, &user, "abcd", USERNAME+"/abcd")
  assert_validatePath(t, res, req, &user, "a/b/c/q", USERNAME+"/a/b/c/q")
  assert_validatePath(t, res, req, &user, "Email/some@mail.co", USERNAME+"/Email/some@mail.co")
  assert_validatePath(t, res, req, &user, "Email/john.doe@mail.co", USERNAME+"/Email/john.doe@mail.co")

  /* INVALID */
  assert_validatePath(t, res, req, &user, "/", "")
  assert_validatePath(t, res, req, &user, "/a", "")
  assert_validatePath(t, res, req, &user, "a/", "")
  assert_validatePath(t, res, req, &user, "/a/a/", "")
  assert_validatePath(t, res, req, &user, "a/b/c/d/e/f/g/h/i/j/k", "")
  assert_validatePath(t, res, req, &user, "Email/me.gpg", "")
  assert_validatePath(t, res, req, &user, "Email/.", "")
  assert_validatePath(t, res, req, &user, "Email/..", "")
  assert_validatePath(t, res, req, &user, "Email/../a", "")
  assert_validatePath(t, res, req, &user, "Email/./a", "")
  assert_validatePath(t, res, req, &user, "Email/a./a", "")
  assert_validatePath(t, res, req, &user, "Email/.b/a", "")
  assert_validatePath(t, res, req, &user, "Email/.....b/a", "")
  assert_validatePath(t, res, req, &user, "Email/$HOME", "")
  assert_validatePath(t, res, req, &user, "Email/\"$HOME\"", "")
  assert_validatePath(t, res, req, &user, "Email/\\", "")
  assert_validatePath(t, res, req, &user, "Email/😉", "")

  assert_validatePath(t, res, req, &user, "Email/already@here", "")
  assert_validatePath(t, res, req, &user, "Email/already@here/pw", "")
  assert_validatePath(t, res, req, &user, "a/b/c", "")
  assert_validatePath(t, res, req, &user, "a/b/c/d", "")
  assert_validatePath(t, res, req, &user, "a/b/c/d/e", "")
  assert_validatePath(t, res, req, &user, "a/b/c/d/e/f", "")
}

func Test_validatePassword(t *testing.T) {
  res := httptest.NewRecorder()

  maxLen, _ := strconv.Atoi(TEXT_MAX_LEN)
  sentance := "Sometimes the default accessible name of an element is missing, or does not accurately describe its contents, and there is no content visible in the DOM that can be associated with the object to give it meaning."
  symbols := strings.ReplaceAll(SYMBOLS, "\\", "")

  /* VALID */
  assert_validatePassword(t, res, "hjkl", "hjkl")
  assert_validatePassword(t, res, "_dir603Pw3Dd-uuJUVKL", "_dir603Pw3Dd-uuJUVKL")
  assert_validatePassword(t, res, strings.Repeat("A", maxLen), strings.Repeat("A", maxLen))
  assert_validatePassword(t, res, symbols, symbols)
  assert_validatePassword(t, res, "åäö", "åäö")
  assert_validatePassword(t, res, "ÅÄÖ", "ÅÄÖ")
  assert_validatePassword(t, res, sentance, sentance)

  /* INVALID */
  assert_validatePassword(t, res, "", "")
  assert_validatePassword(t, res, "\\a", "")
  assert_validatePassword(t, res, "\n", "")
  assert_validatePassword(t, res, "\r", "")
  assert_validatePassword(t, res, ">>> 🤣 <<<", "")
  assert_validatePassword(t, res, "\\", "")
  assert_validatePassword(t, res, strings.Repeat("A", maxLen+1), "")
}

