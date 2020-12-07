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
 * A TASKFINISH command.
 *
 */
export class TaskFinishCommand extends Command {

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
      commandType: ECOMMANDTYPE.TASKFINISH,
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
      processingSubsystem,
      progress
    }: {
      pg: RxPg;
      redis: RxRedis;
      processingSubsystem: string;
      progress: number;
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

        // Get the task
        return Task.get$(pg, this._rewhittId, this._taskRegistry,
          o.taskId);

      }),

      // Not found, report
      rxo.catchError((o: any) => `task ${t.taskTaxonomy}: task does not exists`),

      // Update
      rxo.concatMap((o: any) => {

        t.status = ESTATUS.FINISH;
        t.workerId = processingSubsystem;

        return rx.concat(

          // Add the task to its queue
          t.serial$().pipe(

            rxo.concatMap((o: any) => t.pgUpdate$(pg, { rewhittId: this._rewhittId })),

            rxo.map((o: any) => `task ${t.taskTaxonomy}: updated at PG`),

            rxo.concatMap((o: any) => t.updateFinishTimestamp$(pg))

          )

        )

      })

    )

  }

}
