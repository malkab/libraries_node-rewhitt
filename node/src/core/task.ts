import { NodeLogger } from '@malkab/node-logger';
import * as rx from "rxjs";

/**
 *
 * This is the base Task class every task definition must implement.
 *
 */
export class Task {

  /**
   *
   * The log.
   *
   */
  protected _log: NodeLogger | undefined;

  /**
   *
   * Task ID.
   *
   */
  protected _taskId: string;
  get taskId(): string { return this._taskId }

  /**
   *
   * Task type.
   *
   */
  protected _taskType: string;
  get taskType(): string { return this._taskType }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      taskId,
      taskType,
      log
    }: {
      taskId: string;
      taskType: string;
      log: NodeLogger;
  }) {

    this._taskId = taskId;
    this._taskType = taskType;
    this._log = log;

  }

  /**
   *
   * This is the serializing method to serialize the task to the DB and Redis.
   *
   */
  public serial$(): rx.Observable<any> {

    return rx.of({
      taskId: this.taskId,
      taskType: this.taskType
    })

  }

}
