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



import (
  "fmt"
	"log"
	"net/http"
	"strconv"
	"io/ioutil"
  "flag"

	"encoding/json"

	. "github.com/Kafva/nass/server"
)

const PORT = 5678

type UserMapping struct {
  IPs []string
}

func main(){ 

	var config = ""
  flag.StringVar(&config, "c", "", "Path to a YAML user mapping file")
  flag.Parse()
	if config != "" {
		f,err := ioutil.ReadFile(config)
		if err != nil {
			Die(err)
		}
    // TODO: Neither yaml nor json seems to have an easy interface for reading
    // key names.
    data := []UserMapping{}
		err = json.Unmarshal(f, &data)
		if err != nil {
			Die(err)
		}
    fmt.Printf("%+v\n", data);
	}


  http.HandleFunc("/", Handler)

  listener := "0.0.0.0:"+strconv.Itoa(PORT)

  log.Println("Listening on "+listener+"...")
  if err := http.ListenAndServe(listener, nil); err != nil {
    log.Fatal(err)
  }
}


func Handler(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

