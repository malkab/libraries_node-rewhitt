import { EREDISMESSAGETYPE } from "../eredismessagetype";

import { IRedisMessageObject, RxRedis } from "@malkab/rxredis";

import * as rx from "rxjs";

import { NodeLogger } from '@malkab/node-logger';
import { RxPg } from '@malkab/rxpg';

/**
 *
 * Models a Rewhitt client message. All message must inherit this class.
 *
 */
export class RedisMessage implements IRedisMessageObject {

  /**
   *
   * The Rewhitt ID.
   *
   */
  protected _rewhittId: string;

  /**
   *
   * The PostgreSQL instance.
   *
   */
  protected _pg: RxPg;

  /**
   *
   * The Redis instance.
   *
   */
  protected _redis: RxRedis;

  /**
   *
   * The log.
   *
   */
  protected _log: NodeLogger | undefined;

  /**
   *
   * From message.
   *
   */
  protected _from: string;
  get from(): string { return this._from }

  /**
   *
   * To message.
   *
   */
  protected _to: string;
  get to(): string { return this._to }

  /**
   *
   * Message type.
   *
   */
  protected _messageType: EREDISMESSAGETYPE;
  get messageType(): EREDISMESSAGETYPE { return this._messageType }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      rewhittId,
      pg,
      redis,
      messageType,
      from,
      to,
      log
    }: {
      rewhittId: string;
      pg: RxPg;
      redis: RxRedis;
      messageType: EREDISMESSAGETYPE;
      from: string;
      to: string;
      log?: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._pg = pg;
    this._redis = redis;
    this._messageType = messageType;
    this._from = from;
    this._to = to;
    this._log = log;

  }

  /**
   *
   * serial$, for RxRedisQueue.
   *
   */
  public serial$(): rx.Observable<any> {

    return rx.of({
      from: this._from,
      to: this._to,
      messageType: this._messageType
    })

  }

  /**
   *
   * process$ the message.
   *
   */
  public process$(): rx.Observable<any> {

    throw new Error(
      "RedisMessage base task: process$ must be reimplemented at base message classes");

  }

}
