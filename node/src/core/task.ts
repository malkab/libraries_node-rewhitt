import * as rx from "rxjs";

/**
 *
 * This is the base Task class every task definition must implement.
 *
 */
export class Task {

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

  /**
   *
   * This is the serializing method to serialize the task to the DB and Redis.
   *
   */
  public serial$(): rx.Observable<any> {

    return rx.of({
      taskId: this._taskId
    })

  }

}
