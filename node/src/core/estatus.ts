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
  QUEUE = "QUEUE"
}
