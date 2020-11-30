import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

import { Task } from './task';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { RedisMessage } from "./redismessages/redismessage";

import { redisMessageFactory } from './redismessages/redismessagefactory';

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

    // The blocking connection for the queue client::controller
    // this._clientControllerQueue = new RxRedisQueue(this._redis);

    // Start client > controller message loop
    RxRedisQueue.loop$({
      redis: this._redis.blockingClone(),
      keys: this.clientControllerQueueName,
      constructorFunc: (params: any) => redisMessageFactory(params)
    })
    .subscribe(

      (o: any) => {

        console.log("D: jeje", o);

      },

      (e: Error) => {

        console.log("D: jewww", e);

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

      create schema rewhitt_${this.name};

      /**
       *
       * Workers heartbeat.
       *
       */
      create table rewhitt_${this.name}.worker(
        worker_id varchar(100) primary key,
        last_activity timestamp,
        status jsonb
      );

      /**
       *
       * AnalysisTasks.
       *
       */
      create table rewhitt_${this.name}.tasks(
        task_id varchar(64) primary key,
        task_type varchar(64),
        cached_status integer,
        cached_status_messages jsonb[],
        worker_id varchar(100) references rewhitt_${this.name}.worker(worker_id),
        creation timestamp,
        start timestamp,
        modification timestamp,
        completion timestamp,
        additional_params jsonb,
        data jsonb
      );

      /**
       *
       * Actions catalog, this must match the ENUM EACTIONS.
       *
       */
      create table rewhitt_${this.name}.action(
        action_id varchar(64) primary key,
        description text
      );

      /**
       *
       * Log type entry, this must match the ENUM ELOGTYPE.
       *
       */
      create table rewhitt_${this.name}.log_type(
        log_type_id varchar(64) primary key
      );

      /**
       *
       * Log.
       *
       */
      create table rewhitt_${this.name}.log(
        t timestamp,
        agent varchar(64),
        log_type_id varchar(64) references rewhitt_${this.name}.log_type(log_type_id),
        action_id varchar(64) references rewhitt_${this.name}.action(action_id),
        additional_params jsonb,
        primary key (t, agent)
      );

      /**
       *
       * Log types.
       *
       */
      insert into rewhitt_${this.name}.log_type
      values ('INFO');

      /**
       *
       * Actions.
       *
       */
      insert into rewhitt_${this.name}.action
      values ('INIT', 'Rewhitt initialization');

      /**
       *
       * Log the initialization.
       *
       */
      insert into rewhitt_${this.name}.log
      values (now(), 'CLIENT', 'INFO', 'INIT');

      commit;
    `).
    pipe(

      rxo.catchError((e: Error) => {

        if (e.message === `schema "rewhitt_${this.name}" already exists`) {

          this.log?.logError({
            message: `error initializing Rewhitt: already initialized`,
            moduleName: "client",
            methodName: "init()"
          });

          return rx.throwError(new Error("rewhitt is already initialized"));

        } else {

          this.log?.logError({
            message: `unexpected error initializing Rewhitt: ${e.message}`,
            moduleName: "client",
            methodName: "init()"
          });

          return rx.throwError(e);

        }

      }),

      rxo.map((o: any) => {

        this.log?.logInfo({
          message: `Rewhitt ${this.name} initialized`,
          moduleName: "client",
          methodName: "init()",
          payload: { name: this.name }
        });

        return true;

      })

    )

  }

}
