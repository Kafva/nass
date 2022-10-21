package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func Test_validatePath(t *testing.T) {
  user := User { Name: "tester", Origins: []string{} }

  req := httptest.NewRequest(http.MethodGet, "/get?path=abcd", nil)
  res := httptest.NewRecorder()
  path := validatePath(res, req, &user)

  if path != "tester/abcd" { t.Error("abcd", path) }


  req = httptest.NewRequest(http.MethodGet, "/get?path=1234", nil)

  // req.URL.Query().Del("path")
  //req.URL.Query().Add("path", "1234")

  path = validatePath(res, req, &user)
  if path != "tester/1234" { t.Error("1234", path) }

}
