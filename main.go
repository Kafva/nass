package main

// Autehntication: (IP based)
// The server will accept a mapping file on the form
//  { User1: [ 10.0.67.1, 10.0.67.2 ], ... }
//
// !! The server is only intended to be ran in a wireguard network !!
// Authentication is indirectly handled by the fact that the wireguard
// server knows the pubkey and expected origin of every user.
//
// The server will _not_ create keys, a GPG key should be created seperatly
// for each user.
//
// To avoid name conflicts each user should have their own subfolder under
// .password-store

import (
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"gopkg.in/yaml.v3"

	. "github.com/Kafva/nass/server"
)


func main(){ 
	var config = ""
  flag.StringVar(&config, "c", "", "Path to a YAML configuration file")
  flag.Parse()
	if config != "" {
		f,err := ioutil.ReadFile(config)
		if err != nil {
			Die(err)
		}
    users := []User{}
		err = yaml.Unmarshal(f, &users)
		if err != nil {
			Die(err)
		}
    log.Printf("%+v\n", users);
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



