package server

import (
	"net/http"
	"net/http/httptest"
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

  /* INVALID */
  assert_validatePath(t, res, req, &user, "a/b/c/d/e/f/g/h/i/j/k", "")

}
