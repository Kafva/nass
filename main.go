package main

// Autehntication: (IP based)
// The server will accept a mapping file on the form
//  { User1: [ 10.0.67.1, 10.0.67.2 ], ... }
//
// !! The server is only intended to be ran in a wireguard network !!
// Authentication is indirectly handled by the fact that the wireguard
// server knows the pubkey and expected origin of every user.
//
// The server will _not_ create keys, a GPG key should be created separately
// for each user.

import (
	"flag"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"gopkg.in/yaml.v3"

	. "github.com/Kafva/nass/server"
)

func main() {
    var user_config = ""
    var server_config = ""
    flag.StringVar(&user_config, "u", "", "Path to user configuration")
    flag.StringVar(&server_config, "c", "", "Path to server configuration")
    flag.Parse()

    if user_config != "" {
        f, err := ioutil.ReadFile(user_config)
        if err != nil {
            Die(INTERNAL_SRC, err)
        }
        err = yaml.Unmarshal(f, &USERS)
        if err != nil {
            Die(INTERNAL_SRC, err)
        }
    } else {
        Die(INTERNAL_SRC, "Missing [-u] users.yml configuration")
    }

    if server_config != "" {
        f, err := ioutil.ReadFile(server_config)
        if err != nil {
            Die(INTERNAL_SRC, err)
        }
        err = yaml.Unmarshal(f, &CONFIG)
        if err != nil {
            Die(INTERNAL_SRC, err)
        }
    }

    version, err := os.ReadFile("VERSION")
    if err == nil {
        VERSION = string(version)
    }

    // Seed randomness for password generation
    rand.Seed(time.Now().UnixNano())

    // Endpoints:
    //  /get?path=Service/wow
    //  /add?path=Service/wow  { value: '************' }
    //  /del?path=Service/wow
    //
    http.HandleFunc("/get", GetPass)
    http.HandleFunc("/add", AddPass)
    http.HandleFunc("/del", DelPass)

    // Web app resources are mounted at `/app`
    // The entrypoint is `/app/index.html`
    web_root := http.FileServer(http.Dir(WEBROOT))
    http.Handle("/app/",
        http.StripPrefix("/app", TemplateHook(DisableDirListings(web_root))))
    http.HandleFunc("/", redirect_to_app)

    listener := CONFIG.BindAddress + ":" + strconv.Itoa(CONFIG.Port)

    if CONFIG.TlsEnabled {
        Info(INTERNAL_SRC, "Listening on 'https://" + listener + "'...")
        err := http.ListenAndServeTLS(listener,
            CONFIG.TlsCert,
            CONFIG.TlsKey, nil,
        )
        if err != nil {
            Die(INTERNAL_SRC, "ListenAndServeTLS", err)
        }
    } else {
        Info(INTERNAL_SRC, "Listening on 'http://" + listener + "'...")
        http.ListenAndServe(listener, nil)
    }
}

func redirect_to_app(res http.ResponseWriter, req *http.Request) {
    if req.URL.Path == "/" {
        http.Redirect(res, req, "/app/index.html", 301)
    } else {
        http.NotFound(res, req)
    }
}
