#!/bin/bash

# Version: 2020-11-28

# -----------------------------------------------------------------
#
# Redis CLI.
#
# -----------------------------------------------------------------
#
# Runs a cli session on a Redis.
#
# -----------------------------------------------------------------

# Check mlkcontext to check. If void, no check will be performed.
MATCH_MLKCONTEXT=common
# The version of Redis to run.
REDIS_VERSION=5.0
# Network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost". Keep in mind that linking to a container and using the -p
# option for debugging results in a conflict. Use an external network if
# both features are needed.
NETWORK=rewhitt_dev
# Redis host - REMEMBER: here do not use the redis:// protocol, use
# directly the host name. And if container: was used as network,
# remember that the host will be localhost.
HOST=redis
# Redis port.
PORT=6379
# Redis password.
PASS=redis-secret-999
# Container name.
CONTAINER_NAME=rewhitt_redis_cli_dev
# Container host name. Incompatible with NETWORK=container:XXX.
CONTAINER_HOST_NAME=rewhitt_redis_cli_dev
# External volumes.
VOLUMES=()





# ---

# Check mlkcontext is present at the system
if command -v mlkcontext &> /dev/null
then

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

fi

# Command string
if [ ! -z "${NETWORK}" ]; then NETWORK="--network=${NETWORK}" ; fi
if [ ! -z "${CONTAINER_NAME}" ]; then CONTAINER_NAME="--name=${CONTAINER_NAME}" ; fi
if [ ! -z "${CONTAINER_HOST_NAME}" ]; then CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}" ; fi

VOLUMES_F=

if [ ! -z "${VOLUMES}" ] ; then
  for E in "${VOLUMES[@]}" ; do
    VOLUMES_F="${VOLUMES_F} -v ${E} "
  done
fi

eval    docker run -ti --rm \
        $NETWORK \
        $CONTAINER_NAME \
        $CONTAINER_HOST_NAME \
        $VOLUMES_F \
        --workdir /ext_src/ \
        --entrypoint /bin/bash \
        redis:$REDIS_VERSION \
        -c \"redis-cli -a ${PASS} -h ${HOST} -p ${PORT}\"
