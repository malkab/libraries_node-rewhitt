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
  private _log: NodeLogger;
  get log(): NodeLogger { return this._log }

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
      log: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._clientId = `CLIENT::${clientId}`;
    this._redis = redis;
    this._taskRegistry = taskRegistry;
    this._log = log;

  }

  /**
   *
   * Post tasks.
   *
   */
  public post$(...tasks: Task[]): rx.Observable<any> {

    // To store the observables
    const obs: rx.Observable<any>[] = [];

    tasks.map((task: Task) => {

      this._log.logInfo({
        methodName: "post$",
        moduleName: "Client",
        message: `POST task ${task.taskTaxonomy}`,
        payload: { taskId: task.taskId, taskType: task.taskType }
      })

      // Serialize the task
      obs.push(task.serial$()
      .pipe(

        rxo.concatMap((o: any) => {

          // Serializa the POST command
          const q = new PostCommand({
            rewhittId: this._rewhittId,
            taskRegistry: this._taskRegistry,
            from: this.clientId,
            to: "controller",
            serialTask: o
          }).serial;

          return RxRedisQueue.set$(this._redis,
            this.clientControllerQueueName, JSON.stringify(q));

        })

      ))

    })

    return rx.concat(...obs);

  }

  /**
   *
   * Queue tasks.
   *
   */
  public queue$(...tasks: Task[]): rx.Observable<any> {

    // To store the observables
    const obs: rx.Observable<any>[] = [];

    tasks.map((task: Task) => {

      this._log.logInfo({
        methodName: "queue$",
        moduleName: "Client",
        message: `QUEUE task ${task.taskTaxonomy}`,
        payload: { taskId: task.taskId, taskType: task.taskType }
      })

      obs.push(task.serial$().pipe(

        rxo.concatMap((o: any) => {

          // Serializa a queue command
          const q = new QueueCommand({
            rewhittId: this._rewhittId,
            taskRegistry: this._taskRegistry,
            from: this.clientId,
            to: "controller",
            serialTask: o
          }).serial;

          return RxRedisQueue.set$(this._redis,
            this.clientControllerQueueName, JSON.stringify(q));

        })

      ))

    })

    return rx.concat(...obs);

  }

}
