import { ECOMMANDTYPE } from './ecommandtype';

import { Command } from "./command";

import { Task } from "../task";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis } from '@malkab/rxredis';

import { IRewhittTaskRegistry } from '../irewhitttaskregistry';

/**
 *
 * A QUEUE message.
 *
 */
export class QueueCommand extends Command {

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
      taskRegistry,
      from,
      to,
      serialTask,
      log
    }: {
      rewhittId: string;
      taskRegistry: IRewhittTaskRegistry;
      from: string;
      to: string;
      serialTask: any;
      log?: NodeLogger;
  }) {

    super({
      rewhittId: rewhittId,
      commandType: ECOMMANDTYPE.QUEUE,
      taskRegistry: taskRegistry,
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
  public process$({
      pg,
      redis
    }: {
      pg: RxPg,
      redis: RxRedis
  }): rx.Observable<any> {

    this._log?.logInfo({
      methodName: "process$",
      moduleName: "QueueCommand",
      message: `QUEUE task ${this.serialTask.taskId} type ${this.serialTask.taskType}`,
      payload: { taskId: this.serialTask.taskId, taskType: this.serialTask.taskType }
    })

    // Create the task from the serialTask parameters
    return this._taskRegistry.taskFactory({ ...this.serialTask }, this._log).pipe(

      rxo.concatMap((o: Task) => {

        console.log("D: nen23354", o);

        return Task.get$(pg, this._rewhittId, this._taskRegistry, o.taskId,
          this._log);

      })

    )

      //pgInsert$(pg, { rewhittId: this._rewhittId })),

    // // Check if the task is already registered
    // return rx.zip(

    //   // Insert the task on QUEUE status or update it from
    //   pg.executeParamQuery$(`
    //     insert into rewhitt_${this._rewhittId}.task(
    //       task_id, task_type, cached_status, queued, additional_params)
    //     values ($1, $2, $3, to_timestamp($4), $5)
    //     on conflict task_pkey`,
    //     {
    //       params: [ this._serialTask.taskId, this._serialTask.taskType,
    //         this.commandType, Date.now() / 1000.0, this._serialTask ]
    //     }),

    //   pg.executeParamQuery$(`
    //     insert into rewhitt_${this._rewhittId}.log
    //     values (to_timestamp($1), $2, $3, $4, $5)`,
    //     {
    //       params: [ Date.now() / 1000.0, this.to.toUpperCase(), 'INFO',
    //       this.commandType, this._serialTask ]
    //     })
    // )

  }

}
