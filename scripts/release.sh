#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" ]; then
  npm run travis-deploy-once "npm run semantic-release"
fi