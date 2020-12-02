import { ECOMMANDTYPE } from './ecommandtype';

import { Command } from "./command";

import { Task } from "../task";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis } from '@malkab/rxredis';

import { IRewhittTaskRegistry } from '../irewhitttaskregistry';

import { ESTATUS } from "../estatus";

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

    // To store the generated task
    let t: Task;

    // Create the task from the serialTask parameters
    return this._taskRegistry.taskFactory$({ ...this.serialTask }, this._log).pipe(

      // Check if the task is already posted
      rxo.concatMap((o: Task) => {

        t = o;

        console.log("D: 88888", o);

        // Check if the task already exists
        return Task.get$(pg, this._rewhittId, this._taskRegistry,
          o.taskId, this._log);

      }),

      // Not found, set new status and insert
      rxo.catchError((o: any) => {

        console.log("D: Nee33 ", o);

        return t.pgInsert$(pg, { rewhittId: this._rewhittId });

      }),

      // Update
      rxo.concatMap((o: any) => {

        console.log("D: je222", o);

        t.status = ESTATUS.QUEUE;
        return rx.concat(
          t.pgUpdate$(pg, { rewhittId: this._rewhittId }),
          pg.executeParamQuery$(`
          update rewhitt_${this._rewhittId}.task
          set queued = to_timestamp(${Date.now() / 1000.0})
          where task_id = '${t.taskId}';`)
        )

      })

    )

  }

}
