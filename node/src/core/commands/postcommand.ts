import { ECOMMANDTYPE } from './ecommandtype';

import { Command } from "./command";

import { Task } from "../task";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { OrmError } from "@malkab/ts-utils";

import { RxRedis } from '@malkab/rxredis';

import { IRewhittTaskRegistry } from '../irewhitttaskregistry';

/**
 *
 * POST command.
 *
 */
export class PostCommand extends Command {

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
      commandType: ECOMMANDTYPE.POST,
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
      pg: RxPg;
      redis: RxRedis;
  }): rx.Observable<any> {

    this._log?.logInfo({
      methodName: "process$",
      moduleName: "PostCommand",
      message: `POST task ${this.serialTask.taskId} type ${this.serialTask.taskType}`,
      payload: { taskId: this.serialTask.taskId, taskType: this.serialTask.taskType }
    })

    // Create the task from the serialTask parameters
    return this._taskRegistry.taskFactory({ ...this.serialTask }, this._log).pipe(

      rxo.concatMap((o: Task) => o.pgInsert$(pg, { rewhittId: this._rewhittId })),

      rxo.catchError((o: any) => {

        if (o.OrmErrorCode === OrmError.EORMERRORCODES.DUPLICATED) {

          this._log?.logError({
            methodName: "process$",
            moduleName: "PostCommand",
            message: `POST task ${this.serialTask.taskId} type ${this.serialTask.taskType} error: task already exists in the system`,
            payload: { taskId: this.serialTask.taskId, taskType: this.serialTask.taskType }
          });

          throw new Error(`POST: task ${this.serialTask.taskId} already in the system`);

        }

        this._log?.logError({
          methodName: "process$",
          moduleName: "PostCommand",
          message: `POST task ${this.serialTask.taskId} type ${this.serialTask.taskType} unsuccessfull: unexpected error: ${o.message}`,
          payload: { taskId: this.serialTask.taskId, taskType: this.serialTask.taskType }
        });

        throw new Error(`POST command: unexpected error: ${o.message}`);

      }),

      rxo.map((o: any) => {

        this._log?.logInfo({
          methodName: "process$",
          moduleName: "PostCommand",
          message: `POST task ${this.serialTask.taskId} type ${this.serialTask.taskType}`,
          payload: { taskId: this.serialTask.taskId, taskType: this.serialTask.taskType }
        });

        return o;

      })

    )

  }

}
