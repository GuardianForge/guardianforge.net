#!/bin/bash

# recursiveGoModTidy() {
#   for d in *; do
#     if [ -d "$d" ]; then         # or:  if test -d "$d"; then
#       ( cd "$d" && go mod tidy )
#       subdircount=$(find . -maxdepth 1 -type d | wc -l)
#       echo $d
#       echo $subdircount
#       if [[ "$subdircount" -gt 1 ]]
#       then
#         recursiveGoModTidy
#       fi
#     fi
#   done
# }

recursiveGoModTidy() {
  find . -type f -name go.mod -execdir go mod tidy \;
}

recursiveGoModTidy