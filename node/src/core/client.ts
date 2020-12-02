import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

import { Task } from './task';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { PostCommand } from './commands/postcommand';

import { QueueCommand } from './commands/queuecommand';

import { IRewhittTaskRegistry } from "./irewhitttaskregistry";

/**
 *
 * Rewhitt client. This class provides access to Rewhitt general services.
 *
 */
export class Client {

  /**
   *
   * The task registration.
   *
   */
  private _taskRegistry: IRewhittTaskRegistry;

  /**
   *
   * Logger.
   *
   */
  private _log: NodeLogger | undefined;
  get log(): NodeLogger | undefined { return this._log }

  /**
   *
   * The name of the client > controller queue.
   *
   */
  get clientControllerQueueName(): string {
    return `rewhitt::${this.rewhittId}::client::controller` }

  /**
   *
   * Rewhitt instance ID, used to identify the PG schema.
   *
   */
  private _rewhittId: string;
  get rewhittId(): string { return this._rewhittId }

  /**
   *
   * Rewhitt client name.
   *
   */
  private _clientId: string;
  get clientId(): string { return this._clientId }

  /**
   *
   * RxPg.
   *
   */
  // private _pg: RxPg;
  // get pg(): RxPg { return this._pg }

  /**
   *
   * Redis.
   *
   */
  private _redis: RxRedis;
  get redis(): RxRedis { return this._redis }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      rewhittId,
      clientId,
      redis,
      taskRegistry,
      log
    }: {
      rewhittId: string;
      clientId: string;
      redis: RxRedis;
      taskRegistry: IRewhittTaskRegistry;
      log?: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._clientId = `CLIENT::${clientId}`;
    this._redis = redis;
    this._taskRegistry = taskRegistry;
    this._log = log;

  }

  /**
   *
   * Post a task.
   *
   */
  public post$(task: Task): rx.Observable<any> {

    this._log?.logInfo({
      methodName: "post$",
      moduleName: "Client",
      message: `POST task ${task.taskId} type ${task.taskType}`,
      payload: { taskId: task.taskId, taskType: task.taskType }
    })

    // Serialize the task
    return task.serial$()
    .pipe(

      rxo.concatMap((o: any) => {

        // Serializa the POST command
        return new PostCommand({
          rewhittId: this._rewhittId,
          taskRegistry: this._taskRegistry,
          from: this.clientId,
          to: "controller",
          serialTask: o,
          log: this._log
        }).serial$();

      }),

      rxo.concatMap((o: any) => {

        return RxRedisQueue.set$(this._redis,
          this.clientControllerQueueName, JSON.stringify(o));

      })

    )

  }

  /**
   *
   * Queue a task.
   *
   */
  public queue$(task: Task): rx.Observable<any> {

    this._log?.logInfo({
      methodName: "queue$",
      moduleName: "Client",
      message: `QUEUE task ${task.taskId} type ${task.taskType}`,
      payload: { taskId: task.taskId, taskType: task.taskType }
    })

    return task.serial$()
    .pipe(

      rxo.concatMap((o: any) => {

        // Serializa the POST command
        return new QueueCommand({
          rewhittId: this._rewhittId,
          taskRegistry: this._taskRegistry,
          from: this.clientId,
          to: "controller",
          serialTask: o,
          log: this._log
        }).serial$();

      }),

      rxo.concatMap((o: any) => {

        return RxRedisQueue.set$(this._redis,
          this.clientControllerQueueName, JSON.stringify(o));

      })

    )

  }

}
