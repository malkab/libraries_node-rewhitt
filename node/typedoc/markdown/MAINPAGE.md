# Rewhitt Documentation

**Rewhitt** uses **Redis** as a mean of communication, normally via queues, between different services of the system (mainly, the controller and the workers).

The core of Rewhitt is composed of the following classes:

- **client:** the Rewhitt client offers several services to programs accessing a Rewhitt system, like for example checking the Rewhitt status, pushing new tasks into the system, accessing tasks results, initializing the system, etc.


## Posting Messages to Redis

Post with **RxRedisQueue.lset$**, get with **RxRedisQueue.rget$**.

## Logging

Only the Controller logs to the DB and a centralized log, so every action must go through a Controller. The controller is the only that works with the DB. Logging to the DB is done by the same SQL that writes in the status tables like **worker** and **tasks**.


## Redis Queues

All Redis queues are prefixed with **rewhitt::[[name]]::**.


## Initializing a Rewhitt Instance

The Controller initializes the Rewhitt system with the **init()** method.


## Life Cycle of a Task

This is the life cycle of a task, in order of ocurrence more or less.

### POST

A client posts a task to the system, posting the **serial** member of the task to a Redis **rewhitt::[[name]]::controller::test**.











- Check status for each task: PENDING > RUNNING > COMPLETED.
- Three classes all ar redis, no db, only controller
- Add subjects at client level to report on activity

Rewhitt types of message:

Task lyfecycle:
The client post the task to a single controller task-in queue

Received received by the controller
Queued enters its own queue by the controller
Retrieved enters a worker
Started started by a worker
Finished returned with success from a worker
Error returned with error from a worker
Completed postprocessing by the controller, last step

Client: general services for launching tasks

Controller: db and redis
Reserve one worker fir short operations
Asd an SPI reuqrsr to check queued tasks at redis, getting and setting

Will need a queue for short and anither for long

High, med, low
High: 130, 131
Med: 141-1
Low: 1311

Better:  queue for each task, total control

Worker log which queues are being inspected

Pause continue feature; add a new status paused, discard tasks coming from a paused analysos, requeue all of them

Must be vigilant and check the status of a task before processing from the queue. It might be completed already.

Review the life cycle of of tasks and analysis.

Create a detailes DB log for status and activities for Analysis and Tasks, create a diagram of lifecycle.
