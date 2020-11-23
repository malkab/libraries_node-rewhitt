#!/bin/bash

# Version: 2020-10-26

# -----------------------------------------------------------------
#
# Document the script purpose here.
#
# -----------------------------------------------------------------
#
# Packs and distributes the package to other repos for local install in
# development environments. This is meant to be run from the repo root, not
# inside this folder.
#
# -----------------------------------------------------------------

# Check mlkcontext to check. If void, no check will be performed.
MATCH_MLKCONTEXT=
# The repos to copy the package to. Those repos must comply with the
# node_libraries or node_standalone and have a node/node-pack folder structure.
REPO=(
  /home/git/whatever0
  /home/git/whatever1
)





# ---

# Check mlkcontext
if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi

# Drop existing packages
rm ./node-pack/*.tgz

# Package
yarn build
yarn version --patch --no-git-tag-version
yarn pack

# Move package to node-pack
mv ./*.tgz ./node-pack

# Copy to other repos
for REPO in "${REPO[@]}" ; do

  # Drop remote REPO packages
  rm $REPO/node/node-pack/*.tgz
  cp -f ./node-pack/*.tgz $REPO/node/node-pack/

done
