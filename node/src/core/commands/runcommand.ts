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

import { ESTATUS } from "../estatus";

/**
 *
 * POST command.
 *
 */
export class RunCommand extends Command {

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
      commandType: ECOMMANDTYPE.RUN,
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

    // Create the task from the serialTask parameters
    return this._taskRegistry.taskFactory$({
      ...this.serialTask,
      rewhittId: this._rewhittId
    }).pipe(

      // Set the task status to POST, insert it into the DB, and update its
      // posted timestamp
      rxo.concatMap((o: Task) => o.run$({ pg: pg, redis: redis }))

    )

  }

}
