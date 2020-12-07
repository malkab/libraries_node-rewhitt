export enum ECOMMANDTYPE {
  /**
   *
   * INIT: Rewhitt initialization.
   *
   */
  INIT = "INIT",
  /**
   *
   * POST a task: the task is registered at the controller, but will wait for
   * the logic of the post loop of the controller to go QUEUE.
   *
   */
  POST = "POST",
  /**
   *
   * QUEUE a task: put the task on its queue for the workers to work on them.
   *
   */
  QUEUE = "QUEUE",
  /**
   *
   * RUN a task: command the run of a task to a worker. Sent to controller >
   * workers task queues.
   *
   */
  RUN = "RUN",
  /**
   *
   * TASKPROGRESS from a task: reports progress in a task.
   *
   */
  TASKPROGRESS = "TASKPROGRESS",
  /**
   *
   * TASKFINISH from a task: reports finishing a task.
   *
   */
  TASKFINISH = "TASKFINISH",
  /**
   *
   * TASKERROR from a task: reports an error in a task.
   *
   */
  TASKERROR = "TASKERROR",
  /**
   *
   * Worker heartbeat.
   *
   */
  WORKERHEARTBEAT = "WORKERHEARTBEAT"
}
