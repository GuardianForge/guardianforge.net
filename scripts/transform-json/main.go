package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"
)

var mapfile string
var configfile string

func main() {
	flag.StringVar(&mapfile, "mapfile", "", "help message for flagname")
	flag.StringVar(&configfile, "configfile", "", "help message for flagname")
	flag.Parse()

	mapbytes, err := os.ReadFile(mapfile)
	if err != nil {
		log.Fatal(err)
	}

	var configmap map[string]string
	err = json.Unmarshal(mapbytes, &configmap)
	if err != nil {
		log.Fatal(err)
	}

	configbytes, err := os.ReadFile(configfile)
	if err != nil {
		log.Fatal(err)
	}
	var configs map[string]interface{}
	err = json.Unmarshal(configbytes, &configs)
	if err != nil {
		log.Fatal(err)
	}

	for k, v := range configmap {
		if _, ok := configs[k]; ok {
			configs[k] = os.Getenv(v)
		}
	}

	jbytes, err := json.Marshal(configs)
	if err != nil {
		log.Fatal(err)
	}

	err = os.WriteFile(configfile, jbytes, 0744)
	if err != nil {
		log.Fatal(err)
	}
}
