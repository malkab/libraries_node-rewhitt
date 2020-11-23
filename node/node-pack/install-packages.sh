#!/bin/bash

# Version: 2020-10-14

# -----------------------------------------------------------------
#
# Document the script purpose here.
#
# -----------------------------------------------------------------
#
# Installs packages in TGZ in this folder. This is meant to be run from the repo
# root, not inside this folder. All repos *.tgz will be installed as production
# repos, so change it before publishing to NPM.
#
# -----------------------------------------------------------------

# Check mlkcontext to check. If void, no check will be performed.
MATCH_MLKCONTEXT=
# Remove packages firts. Upgrading from *.tgz is clumsy, remove target packages
# first.
PACKAGES_REMOVE=(
  whatever
)





# ---

# Check mlkcontext
if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi

# Remove existing repos
for PACK in "${PACKAGES_REMOVE[@]}" ; do

  yarn remove $PACK

done

# Install the latest version
echo
echo --------------
echo Installing $(ls -r node-pack/*.tgz | head -n 1)...
echo --------------
echo

yarn add file:./$(ls -r node-pack/*.tgz | head -n 1)
