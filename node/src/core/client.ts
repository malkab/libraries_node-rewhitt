import { NodeLogger } from '@malkab/node-logger';
import { RxPg } from '@malkab/rxpg';

import { RxRedis } from '@malkab/rxredis';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

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

  }

  /**
   *
   * Init the instance from scratch at PG.
   *
   */
  public init$(): rx.Observable<any> {

    return this._pg.executeParamQuery$(`
      begin;

      create schema rewhitt;

      /**

        Workers heartbeat.

      */
      create table rewhitt.worker(
        worker_id varchar(100) primary key,
        last_activity timestamp,
        status jsonb
      );

      /**

        AnalysisTasks.

      */
      create table rewhitt.tasks(
        task_id varchar(64) primary key,
        task_type varchar(64),
        cached_status integer,
        cached_status_messages jsonb[],
        worker_id varchar(100) references rewhitt.worker(worker_id),
        creation timestamp,
        start timestamp,
        modification timestamp,
        completion timestamp,
        additional_params jsonb,
        data jsonb
      );

      commit;
    `).
    pipe(

      rxo.catchError((e: Error) => {

        console.log("D: jjene", e.message);

        if (e.message === "")

        return rx.of(33);

      })

    )

  }

}
