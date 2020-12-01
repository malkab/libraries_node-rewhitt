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
  QUEUE = "QUEUE"
}
