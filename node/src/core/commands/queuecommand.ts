import { ECOMMANDTYPE } from './ecommandtype';

import { Command } from "./command";

import { RunCommand } from "./runcommand";

import { Task } from "../task";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

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
   * serial, for RxRedisQueue.
   *
   */
  get serial(): any {

    return {
      ...super.serial,
      serialTask: this._serialTask
    }

  }

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
      serialTask
    }: {
      rewhittId: string;
      taskRegistry: IRewhittTaskRegistry;
      from: string;
      to: string;
      serialTask: any;
  }) {

    super({
      rewhittId: rewhittId,
      commandType: ECOMMANDTYPE.QUEUE,
      taskRegistry: taskRegistry,
      from: from,
      to: to
    });

    this._serialTask = serialTask;

  }

  /**
   *
   * process$ the message.
   *
   */
  public process$({
      pg,
      redis,
      processingSubsystem
    }: {
      pg: RxPg;
      redis: RxRedis;
      processingSubsystem: string;
  }): rx.Observable<any> {

    // To store the generated task
    let t: Task;

    // Create the task from the serialTask parameters
    return this._taskRegistry.taskFactory$({
      ...this.serialTask,
      rewhittId: this._rewhittId
    }).pipe(

      // Check if the task is already posted
      rxo.concatMap((o: Task) => {

        t = o;

        // Check if the task already exists
        return Task.get$(pg, this._rewhittId, this._taskRegistry,
          o.taskId);

      }),

      // Not found, set new status and insert
      rxo.catchError((o: any) => {

        return t.pgInsert$(pg, { rewhittId: this._rewhittId }).pipe(

          rxo.map((o: any) => `task ${t.taskTaxonomy}: inserted at PG`)

        )

      }),

      // Update
      rxo.concatMap((o: any) => {

        if(o.status === ESTATUS.QUEUE) throw new Error(
          `task ${t.taskTaxonomy}: already queued`)

        t.status = ESTATUS.QUEUE;

        return rx.concat(

          // Add the task to its queue
          t.serial$().pipe(

            rxo.concatMap((o: any) =>
              RxRedisQueue.set$(redis, t.toWorkerTaskQueueName,
                JSON.stringify(new RunCommand({
                  from: processingSubsystem,
                  to: "workers",
                  rewhittId: this._rewhittId,
                  serialTask: o,
                  taskRegistry: this._taskRegistry
                }).serial))),

            rxo.catchError((o: Error) => {

              throw new Error(`task ${t.taskTaxonomy}: error setting task to the Redis worker task queue ${t.toWorkerTaskQueueName}: ${o.message}`);

            }),

            rxo.map((o: any) => `task ${t.taskTaxonomy}: set to Redis queue ${t.toWorkerTaskQueueName}`)

          ),

          t.pgUpdate$(pg, { rewhittId: this._rewhittId }).pipe(

            rxo.map((o: any) =>
              `task ${t.taskTaxonomy}: updated at PG`)

          ),

          t.updateQueuedTimestamp$(pg)

        )

      })

    )

  }

}
