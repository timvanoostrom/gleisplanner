#!/usr/bin/env sh
# taken from https://vitejs.dev/guide/static-deploy.html#github-pages

set -e

npm run build

cd dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:timvanoostrom/gleisplanner.git master:gh-pages

cd -
