package main

// Autehntication: (IP based)
// The server will accept a mapping file on the form
//  { User1: [ 10.0.67.1, 10.0.67.2 ], ... }
//
// !! The server is only intended to be ran in a wireguard network !!
// Authentication is indirectly handled by the fact that the wireguard
// server knows the pubkey and expected origin of every user.
//
// Just for fun, we could add an application specific key that needs
// to be passed with all requests (configured just like the moat key, shared
// between all users)
//
// The server will _not_ create keys, a GPG key should be created separately
// for each user.
//
// To avoid name conflicts each user should have their own subfolder under
// .password-store

import (
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"gopkg.in/yaml.v3"

	. "github.com/Kafva/nass/server"
)


func main(){ 
	var user_config = ""
	var server_config = ""
  flag.StringVar(&user_config,   "u", "", "Path to user configuration")
  flag.StringVar(&server_config, "c", "", "Path to server configuration")
  flag.Parse()

	if user_config != "" {
		f,err := ioutil.ReadFile(user_config)
		if err != nil {
			Die(err)
		}
		err = yaml.Unmarshal(f, &USERS)
		if err != nil {
			Die(err)
		}
	} else {
		Die("Missing [-u] users.yml configuration")
	}

	if server_config != "" {
		f,err := ioutil.ReadFile(server_config)
		if err != nil {
			Die(err)
		}
		err = yaml.Unmarshal(f, &CONFIG)
		if err != nil {
			Die(err)
		}
	}
	if os.Getenv(PSK_ENV) == "" {
		Die("Missing value for '"+PSK_ENV+"'")
	}

	// Endpoints:
	//  /get?path=Service/wow
	//  /add?path=Service/wow  { value: '************' }
	//  /del?path=Service/wow
	//  /list
	// We would not need a /list endpoint if we were writing purely for
	// web since in that case the data would be directly embedded in the HTML
  http.HandleFunc("/",    ListPass)
  http.HandleFunc("/get",  GetPass)
  http.HandleFunc("/add",  AddPass)
  http.HandleFunc("/del",  DelPass)

  listener := CONFIG.BindAddress+":"+strconv.Itoa(CONFIG.Port)

  log.Println("Listening on "+listener+"...")
  if err := http.ListenAndServe(listener, nil); err != nil {
    log.Fatal(err)
  }
}



