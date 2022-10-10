package main

import (
	"log"
	"net/http"
	"strconv"
)

const PORT = 5678

func Handler(res http.ResponseWriter, req *http.Request) {
  res.Header().Add("Accept-Encoding", "XDDDDDDDDDDDD") 
  res.Write([]byte("hey :D\n"))
}

func main(){ 
  http.HandleFunc("/", Handler)

  listener := "0.0.0.0:"+strconv.Itoa(PORT)

  log.Println("Listening on "+listener+"...")
  if err := http.ListenAndServe(listener, nil); err != nil {
    log.Fatal(err)
  }
}
