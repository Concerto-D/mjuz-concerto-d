#/usr/bin/bash

rm -rf ~/.pulumi
pulumi login --local
cp -r ~/pulumi_plugins/plugins ~/.pulumi/plugins
#pulumi plugin install resource docker v3.4.1
