#!/bin/sh

value=`cat version.txt`
value=`expr $value + 1`

ncc build index.js -o dist
git add -- .
git commit -m "new release"
git push
git tag `echo v$value`
git push origin `echo v$value`

echo $value > version.txt