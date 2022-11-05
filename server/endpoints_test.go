package server

import (
	"net/http"
	"net/http/httptest"
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

  validated :=  validatePath(res, req, user)

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
  CONFIG.SingleUser = false
  user := User { Name: USERNAME, Origins: []string{} }

  req := httptest.NewRequest(http.MethodGet, "/get?path=", nil)
  res := httptest.NewRecorder()

  /* VALID */
  assert_validatePath(t, res, req, &user, "abcd", USERNAME+"/abcd")
  assert_validatePath(t, res, req, &user, "a/b/c/d", USERNAME+"/a/b/c/d")
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
}

func Test_validatePassword(t *testing.T) {
  res := httptest.NewRecorder()

  maxLen, _ := strconv.Atoi(TEXT_MAX_LEN)

  /* VALID */
  assert_validatePassword(t, res, "hjkl", "hjkl")
  assert_validatePassword(t, res, "_dir603Pw3Dd-uuJUVKL", "_dir603Pw3Dd-uuJUVKL")
  assert_validatePassword(t, res, strings.Repeat("A", maxLen), strings.Repeat("A", maxLen))
  assert_validatePassword(t, res, "-§$!\"'#€%&()=?*<>_.@/", "-§$!\"'#€%&()=?*<>_.@/")
  assert_validatePassword(t, res, "åäö", "åäö")
  assert_validatePassword(t, res, "ÅÄÖ", "ÅÄÖ")

  /* INVALID */
  assert_validatePassword(t, res, "", "")
  assert_validatePassword(t, res, "\\a", "")
  assert_validatePassword(t, res, "\n", "")
  assert_validatePassword(t, res, "\r", "")
  assert_validatePassword(t, res, ">>> 🤣 <<<", "")
  assert_validatePassword(t, res, strings.Repeat("A", maxLen+1), "")
}

