# Rewhitt Documentation

**Rewhitt** uses **Redis** as a mean of communication, normally via queues, between different services of the system (mainly, the controller and the workers).

The core of Rewhitt is composed of the following classes:

- **client:** the Rewhitt client offers several services to programs accessing a Rewhitt system, like for example checking the Rewhitt status, pushing new tasks into the system, accessing tasks results, initializing the system, etc.
