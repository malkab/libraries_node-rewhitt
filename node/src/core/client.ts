import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

import { Task } from './task';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { PostRedisMessage } from './redismessages/postredismessage';

/**
 *
 * Rewhitt client. This class provides access to Rewhitt general services.
 *
 */
export class Client {

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
  private _clientName: string;
  get clientName(): string { return this._clientName }

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
      rewhittId,
      clientName,
      pg,
      redis,
      log
    }: {
      rewhittId: string;
      clientName: string;
      pg: RxPg;
      redis: RxRedis;
      log?: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._clientName = clientName;
    this._pg = pg;
    this._redis = redis;
    this._log = log;

  }

  /**
   *
   * Post a task.
   *
   */
  public post(task: Task): rx.Observable<any> {

    return task.serial$()
    .pipe(

      rxo.concatMap((o: any) => {

        return RxRedisQueue.set$(this._redis, this.clientControllerQueueName,
          new PostRedisMessage({
            rewhittId: this._rewhittId,
            pg: this._pg,
            redis: this._redis,
            from: this.clientName,
            to: "controller",
            serialTask: o,
            log: this._log
          })
        )

      })

    )

  }

}
