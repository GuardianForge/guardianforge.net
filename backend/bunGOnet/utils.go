package bunGOnet

import "log"

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
