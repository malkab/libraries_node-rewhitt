import { EREDISMESSAGETYPE } from '../eredismessagetype';

import { RedisMessage } from "./redismessage";

import { Task } from "../task";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis } from '@malkab/rxredis';

import { EACTIONS } from "../eactions";

/**
 *
 * A POST message.
 *
 */
export class PostRedisMessage extends RedisMessage {

  /**
   *
   * The task serialization.
   *
   */
  private _serialTask: any;
  get serialTask(): any { return this._serialTask }



  /**
   *
   * Constructor.
   *
   */
  constructor({
      rewhittId,
      pg,
      redis,
      from,
      to,
      serialTask,
      log
    }: {
      rewhittId: string;
      pg: RxPg,
      redis: RxRedis,
      from: string;
      to: string;
      serialTask: any;
      log?: NodeLogger;
  }) {

    super({
      rewhittId: rewhittId,
      pg: pg,
      redis: redis,
      messageType: EREDISMESSAGETYPE.POST,
      from: from,
      to: to,
      log: log
    });

    this._serialTask = serialTask;

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
          serialTask: this._serialTask
        }

      })

    )

  }

  /**
   *
   * process$ the message.
   *
   */
  public process$(): rx.Observable<any> {

    this._log?.logInfo({
      methodName: "process$",
      moduleName: "PostRedisMessage",
      message: `Processing POST message for task ${this.serialTask.taskId} of type ${this.serialTask.taskType}`,
      payload: { taskId: this.serialTask.taskId, taskType: this.serialTask.taskType }
    })

    return rx.zip(
      this._pg.executeParamQuery$(`
        insert into rewhitt_${this._rewhittId}.tasks(
          task_id, task_type, cached_status, posted, additional_params)
        values ($1, $2, $3, to_timestamp($4), $5)`,
        {
          params: [ this._serialTask.taskId, this._serialTask.taskType,
            EACTIONS.POST, Date.now() / 1000.0, this._serialTask ]
        }),

      this._pg.executeParamQuery$(`
        insert into rewhitt_${this._rewhittId}.log
        values (to_timestamp($1), $2, $3, $4, $5)`,
        {
          params: [ Date.now() / 1000.0, this.to.toUpperCase(), 'INFO', EACTIONS.POST,
          this._serialTask ]
        })
    );

  }

}
