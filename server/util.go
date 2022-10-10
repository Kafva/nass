package server

import (
	"log"
)

func Die(strs ... interface{}) {
  strs = append(strs, "\n")
  logPrefix("31", "FATAL")
  log.Fatal(strs ...)
}

func Info(strs ... interface{}) {
	logPrefix("32", "INFO")
	log.Println(strs ...)
}

func Debug(strs ... interface{}) {
  if CONFIG.Debug {
    logPrefix("34", "DEBUG")
    log.Println(strs ...)
  }
}

func Warn(args ... interface{}) {
  logPrefix("33", "WARN")
  log.Println(args ...)
}

func Err(args ... interface{}) {
  logPrefix("31", "ERROR")
  log.Println(args ...)
}

func logPrefix(color string, label string) {
  if CONFIG.Color {
    log.SetPrefix("\033["+color+"m"+label+"\033[0m ")
  } else {
    log.SetPrefix(label+" ")
  }
}
