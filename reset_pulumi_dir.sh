#/usr/bin/bash

rm -rf ~/.pulumi
pulumi login --local
pulumi plugin install resource docker v3.4.1
