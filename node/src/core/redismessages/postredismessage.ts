import { EREDISMESSAGETYPE } from '../eredismessagetype';

import { RedisMessage } from "./redismessage";

import { Task } from "../task";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

/**
 *
 * A POST message.
 *
 */
export class PostRedisMessage extends RedisMessage {

  /**
   *
   * The task.
   *
   */
  private _taskId: string;
  get taskId(): string { return this._taskId }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      from,
      to,
      taskId
    }: {
      from: string;
      to: string;
      taskId: string;
  }) {

    super({
      messageType: EREDISMESSAGETYPE.POST,
      from: from,
      to: to
    });

    this._taskId = taskId;

  }

  /**
   *
   * Supersede super serial$ for RxRedisQueue.
   *
   */
  public serial$(): rx.Observable<any> {

    return super.serial$()
    .pipe(

      rxo.map((o: any) => {

        return {
          ...o,
          taskId: this._taskId
        }

      })

    )

  }

}
