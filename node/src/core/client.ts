import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

import { Task } from './task';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { EREDISMESSAGETYPE } from "./eredismessagetype";

import { IRedisMessage } from "./iredismessage";

/**
 *
 * Rewhitt client. This class provides access to Rewhitt general services.
 *
 */
export class Client {

  /**
   *
   * The RxRedisQueue for client > controller messages.
   *
   */
  private _clientControllerQueue: RxRedisQueue;

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
    return `rewhitt::${this.name}::client::controller` }

  /**
   *
   * Rewhitt instance name.
   *
   */
  private _name: string;
  get name(): string { return this._name }

  /**
   *
   * RxPg.
   *
   */
  private _pg: RxPg;
  get pg(): RxPg { return this._pg }

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
      name,
      pg,
      redis,
      log
    }: {
      name: string;
      pg: RxPg;
      redis: RxRedis;
      log?: NodeLogger;
  }) {

    this._name = name;
    this._pg = pg;
    this._redis = redis;
    this._log = log;

    // The queue client > controller
    this._clientControllerQueue = new RxRedisQueue(this._redis);

  }

  /**
   *
   * Post a task.
   *
   */
  public post(task: Task): rx.Observable<any> {

    return this._clientControllerQueue.set$(this.clientControllerQueueName,
      JSON.stringify(<IRedisMessage>{
        messageType: EREDISMESSAGETYPE.POST,
        payload: { task: JSON.stringify(task.serial) }
      })
    )

  }

}
