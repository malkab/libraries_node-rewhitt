/**
 *
 * Enumeration for tasks' status.
 *
 */
export enum ESTATUS {
  /**
   *
   * Posted tasks: waiting to be queued by the controller loop.
   *
   */
  POST = "POST",
  /**
   *
   * Queued tasks: at worker's queues.
   *
   */
  QUEUE = "QUEUE",
  /**
   *
   * The task is running and outputting PROGRESS commands.
   *
   */
  RUNNING = "RUNNING",
  /**
   *
   * The task resulted in an ERROR. The task outputted an ERROR command.
   *
   */
  ERROR = "ERROR",
  /**
   *
   * The task resulted in a successfull FINISH. The task outputted a FINISH
   * command.
   *
   */
  FINISH = "FINISH"
}
