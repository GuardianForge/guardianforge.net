#!/bin/bash
for f in $(find . -name go.mod);
  do (cd $(dirname $f); go mod vendor)
done