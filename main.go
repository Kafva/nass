package main

// Endpoints:
//  /get?path=Service/wow
//  /add?path=Service/wow  { value: '************' }
//  /del?path=Service/wow
//  /list
// We do not need a list endpoint if we are writing purely for
// web since in that case the data would be directly embedded in the HTML
//
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


  http.HandleFunc("/", Handler)

  listener := CONFIG.BindAddress+":"+strconv.Itoa(CONFIG.Port)

  log.Println("Listening on "+listener+"...")
  if err := http.ListenAndServe(listener, nil); err != nil {
    log.Fatal(err)
  }
}


func Handler(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

