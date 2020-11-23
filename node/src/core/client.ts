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
      redis
    }: {
      name: string;
      pg: RxPg;
      redis: RxRedis;
  }) {

    this._name = name;
    this._pg = pg;
    this._redis = redis;

  }

  /**
   *
   * Init the instance from scratch at PG.
   *
   */
  public init$(): rx.Observable<any> {

    return this._pg.executeParamQuery$(`
      select 33;
    `)

  }

}
