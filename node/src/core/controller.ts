import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

import { Task } from './task';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { RedisMessage } from "./redismessages/redismessage";

import { redisMessageFactory } from './redismessages/redismessagefactory';
import { PostRedisMessage } from './redismessages/postredismessage';

/**
 *
 * This is the Rewhitt controller.
 *
 */
export class Controller {

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
  private _controllerName: string;
  get controllerName(): string { return this._controllerName }

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
      controllerName,
      pg,
      redis,
      log
    }: {
      rewhittId: string;
      controllerName: string;
      pg: RxPg;
      redis: RxRedis;
      log?: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._controllerName = controllerName;
    this._pg = pg;
    this._redis = redis;
    this._log = log;

    // The blocking connection for the queue client::controller
    // this._clientControllerQueue = new RxRedisQueue(this._redis);

    // Start client > controller message loop
    RxRedisQueue.loop$({
      redis: this._redis.blockingClone(),
      keys: this.clientControllerQueueName,
      constructorFunc: (params: any) => redisMessageFactory({
        ...params,
        rewhittId: this._rewhittId,
        pg: this._pg,
        redis: this._redis,
        log: this._log
      })
    })
    .pipe(

      rxo.concatMap((o: any) => {

        return o.object.process$();

      })

    )
    .subscribe(

      (o: any) => {

        console.log("D: jeje", o);

      },

      (e: Error) => {

        throw new Error(`RxRedisQueue client > controller error, should not happen: ${e.message}`);

      },

      () => {

        throw new Error("RxRedisQueue client > controller completed, should not happen");

      }

    )

  }

  /**
   *
   * Init the instance from scratch at PG.
   *
   */
  public init$(): rx.Observable<boolean> {

    return this._pg.executeParamQuery$(`
      begin;

      create schema rewhitt_${this.rewhittId};

      /**
       *
       * Workers heartbeat.
       *
       */
      create table rewhitt_${this.rewhittId}.worker(
        worker_id varchar(100) primary key,
        last_activity timestamp,
        status jsonb
      );

      /**
       *
       * Actions catalog, this must match the ENUM EACTIONS.
       *
       */
      create table rewhitt_${this.rewhittId}.action(
        action_id varchar(64) primary key,
        description text
      );

      /**
       *
       * AnalysisTasks.
       *
       */
      create table rewhitt_${this.rewhittId}.tasks(
        task_id varchar(64) primary key,
        task_type varchar(64),
        cached_status varchar(64) references rewhitt_${this.rewhittId}.action(action_id),
        cached_status_messages jsonb[],
        worker_id varchar(100) references rewhitt_${this.rewhittId}.worker(worker_id),
        posted timestamp,
        start timestamp,
        modification timestamp,
        completion timestamp,
        additional_params jsonb
      );

      /**
       *
       * Log type entry, this must match the ENUM ELOGTYPE.
       *
       */
      create table rewhitt_${this.rewhittId}.log_type(
        log_type_id varchar(64) primary key
      );

      /**
       *
       * Log.
       *
       */
      create table rewhitt_${this.rewhittId}.log(
        t timestamp,
        agent varchar(64),
        log_type_id varchar(64) references rewhitt_${this.rewhittId}.log_type(log_type_id),
        action_id varchar(64) references rewhitt_${this.rewhittId}.action(action_id),
        additional_params jsonb,
        primary key (t, agent)
      );

      /**
       *
       * Log types.
       *
       */
      insert into rewhitt_${this.rewhittId}.log_type
      values ('INFO');

      /**
       *
       * Actions.
       *
       */
      insert into rewhitt_${this.rewhittId}.action
      values ('INIT', 'Rewhitt initialization');

      insert into rewhitt_${this.rewhittId}.action
      values ('POST', 'Action POST');

      /**
       *
       * Log the initialization.
       *
       */
      insert into rewhitt_${this.rewhittId}.log
      values (now(), 'CONTROLLER', 'INFO', 'INIT');

      commit;
    `).
    pipe(

      rxo.catchError((e: Error) => {

        if (e.message === `schema "rewhitt_${this.rewhittId}" already exists`) {

          this.log?.logError({
            message: `error initializing Rewhitt: already initialized`,
            moduleName: "controller",
            methodName: "init()"
          });

          return rx.throwError(new Error("rewhitt is already initialized"));

        } else {

          this.log?.logError({
            message: `unexpected error initializing Rewhitt: ${e.message}`,
            moduleName: "controller",
            methodName: "init()"
          });

          return rx.throwError(e);

        }

      }),

      rxo.map((o: any) => {

        this.log?.logInfo({
          message: `Rewhitt ${this.rewhittId} initialized`,
          moduleName: "controller",
          methodName: "init()",
          payload: { name: this.rewhittId }
        });

        return true;

      })

    )

  }

}
