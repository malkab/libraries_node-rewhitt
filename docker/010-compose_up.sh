#!/bin/bash

# Version 2020-10-10

# -----------------------------------------------------------------
#
# Describe the purpose of the script here.
#
# -----------------------------------------------------------------
#
# Starts a Docker Compose.
#
# -----------------------------------------------------------------

# Check mlkcontext to check. If void, no check will be performed.
MATCH_MLKCONTEXT=common
# Compose file, blank searches for local docker-compose file.
COMPOSE_FILE=
# Project name, can be blank. Take into account that the folder name
# will be used, there can be name clashes.
PROJECT_NAME=rewhitt_dev
# Detach.
DETACH=false





# ---

echo -------------
echo WORKING AT $(mlkcontext)
echo -------------

# Check mlkcontext
if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi

if [ ! -z "${COMPOSE_FILE}" ] ; then

  COMPOSE_FILE="-f ${COMPOSE_FILE}"

fi

if [ ! -z "${PROJECT_NAME}" ] ; then

  PROJECT_NAME="-p ${PROJECT_NAME}"

fi

if [ "$DETACH" = true ] ; then

  DETACH="-d"

else

  DETACH=

fi

eval docker-compose $COMPOSE_FILE $PROJECT_NAME up $DETACH
