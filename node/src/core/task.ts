/**
 *
 * This is the base Task class every task definition must implement.
 *
 */
export class Task {

  /**
   *
   * This is the serializing method to serialize the task to the DB and Redis.
   *
   */
  get serial(): any {

    return {
      taskId: this._taskId
    }

  }

  /**
   *
   * Task ID.
   *
   */
  protected _taskId: string;
  get taskId(): string { return this._taskId }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      taskId
    }: {
      taskId: string;
  }) {

    this._taskId = taskId;

  }

}
