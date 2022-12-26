package server

import (
    "fmt"
    "log"
    "os"
    "path/filepath"
    "runtime"
    "strings"
)

func Die(src string, strs ...interface{}) {
    strs = append(strs, "\n")
    logPrefix(src, "31", "FATAL")
    log.Fatal(strs...)
}

func Info(src string, strs ...interface{}) {
    logPrefix(src, "32", "INFO")
    log.Println(strs...)
}

func Debug(src string, strs ...interface{}) {
    if CONFIG.Debug {
        logPrefix(src, "34", "DEBUG")
        log.Println(strs...)
    }
}

func Warn(src string, args ...interface{}) {
    logPrefix(src, "33", "WARN")
    log.Println(args...)
}

func Err(src string, args ...interface{}) {
    logPrefix(src, "31", "ERROR")
    log.Println(args...)
}

func logPrefix(src string, color string, label string) {
    _, file, line, ok := runtime.Caller(2)
    caller := ""
    if ok {
        caller = filepath.Base(file) + ":" + fmt.Sprint(line) + " "
    }
    if CONFIG.Color {
        log.SetPrefix("\033[" + color + "m" + label + "\033[0m [" + src + "] " + caller)
    } else {
        log.SetPrefix(label + " [" + src + "] " + caller)
    }
}

func ExpandTilde(path string) string {
    home, _ := os.UserHomeDir()
    return strings.ReplaceAll(path, "~", home)
}

func Exists(path string) bool {
    _, err := os.Stat(path)
    return err == nil
}

func IsFile(path string) bool {
    info, err := os.Stat(path)
    return err == nil && !info.IsDir()
}

func IsDir(path string) bool {
    info, err := os.Stat(path)
    return err == nil && info.IsDir()
}
