package server

import (
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

// Return 404 for any request that ends on a '/'
// An exception is made for `/app` which will result
// in a redirect to index.html instead of a 404
func DisableDirListings(next http.Handler) http.Handler {
  return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
    if strings.HasSuffix(req.URL.Path, "/") {
			if strings.HasPrefix(req.URL.Path, "/app") {
				http.Redirect(res, req, "/app/index.html", 301)
			} else {
				http.NotFound(res, req)
			}
      return
    }
    next.ServeHTTP(res, req)
  })
}

// Instead of fetching the password list after loading index.html
// we use a template to include these resources automatically on every request
func TemplateHook(next http.Handler) http.Handler {
  return http.HandlerFunc( func(res http.ResponseWriter, req *http.Request) {
    user := MapReqToUser(res, req) 
    if user.Name == "" { return }

    if filepath.Base(req.URL.Path) == "index.html" {
			// We need to use the version of `index.html` under `dist` that
			// has paths resolved by Vite
			var tmpl = template.Must(template.ParseFiles(WEBROOT+"/index.html"))

      rootDir := password_root_dir(&user)
      if _, err := os.Stat(rootDir); err != nil {
        Err(err.Error())
        ErrorResponse(res, "Missing passwordstore", http.StatusInternalServerError)
        return
      }

      passTree := PassEntry{ Name: user.Name }

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
        passTree.AddChildren(nodes)
        return nil
      })

			// Only allow resources to be loaded from whitelisted domains
			for _,value := range CSP_VALUES {
				res.Header().Add("Content-Security-Policy", value)
			}

      tmpl.Execute(res, passTree)
    } else {
      next.ServeHTTP(res, req)
    }
  })
}

func ErrorResponse(res http.ResponseWriter, msg string, code int) bool {
  res.WriteHeader(code)
	res.Header().Set("Content-Type", "application/json")
  res.Write([]byte("{ \"Error\": \""+  strings.TrimSpace(msg) +"\" }\n"))
  return false
}

// Verify that the origin of the requests matches an existing `User`.
// Returns a user with an empty name if no match was found.
func MapReqToUser(res http.ResponseWriter, req *http.Request) User {
  var user = User{}

  if remoteIP := ipFromAddr(req); remoteIP != "" {
     for _,u := range USERS {
       if u.HasOrigin(remoteIP) {
         user = u
         break
       }
     }
  }

  if user.Name == "" {
    Warn("Origin has no matching user: "+req.RemoteAddr)
    ErrorResponse(res, "Invalid origin or user", http.StatusUnauthorized)
  }

  return user
}

func password_root_dir(user *User) string {
  if CONFIG.SingleUser {
    return ExpandTilde(CONFIG.Passwordstore)
  } else {
    return ExpandTilde(CONFIG.Passwordstore)+"/"+user.Name
  }
}

func ipFromAddr(req *http.Request) string {
  if strings.Contains(req.RemoteAddr, ".") { // IPv4
    remoteAddr := strings.SplitN(req.RemoteAddr, ":", 2)
    if len(remoteAddr) == 2 {
      return remoteAddr[0]
    }
  } else { // IPv6, the address should be enclosed in '[]'
    return req.RemoteAddr[1:strings.LastIndex(req.RemoteAddr, "]")]  
  }
  return ""
}

