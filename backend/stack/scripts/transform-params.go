package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

func main() {
	// Import params.json
	file, err := os.Open("./params.json")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	b, err := ioutil.ReadAll(file)
	if err != nil {
		log.Fatal(err)
	}

	var params map[string]interface{}
	json.Unmarshal(b, &params)

	out := ""

	for key, el := range params {
		out += fmt.Sprintf("%v=\"%v\"\n", key, el)
	}

	outf, err := os.Create("./sam.params")
	if err != nil {
		log.Fatal(err)
	}
	defer outf.Close()

	_, err = outf.WriteString(out)
	if err != nil {
		log.Fatal(err)
	}
}
