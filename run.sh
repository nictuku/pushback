#!/bin/bash

set -eu

go build
docker build -t pushback .
docker run -m=150M -it pushback --rm > pushback.log
