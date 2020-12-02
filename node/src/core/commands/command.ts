import { ECOMMANDTYPE } from "./ecommandtype";

import * as rx from "rxjs";

import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from "@malkab/rxpg";

import { RxRedis } from "@malkab/rxredis";

import { IRewhittTaskRegistry } from '../irewhitttaskregistry';

/**
 *
 * Models a Rewhitt client message. All message must inherit this class.
 *
 */
export class Command {

  /**
   *
   * The task registration.
   *
   */
  protected _taskRegistry: IRewhittTaskRegistry;

  /**
   *
   * The Rewhitt ID.
   *
   */
  protected _rewhittId: string;

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
  protected _commandType: ECOMMANDTYPE;
  get commandType(): ECOMMANDTYPE { return this._commandType }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      rewhittId,
      commandType,
      taskRegistry,
      from,
      to,
      log
    }: {
      rewhittId: string;
      commandType: ECOMMANDTYPE;
      taskRegistry: IRewhittTaskRegistry;
      from: string;
      to: string;
      log?: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._commandType = commandType;
    this._taskRegistry = taskRegistry;
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
      commandType: this._commandType
    })

  }

  /**
   *
   * process$ the message.
   *
   */
  public process$({
      pg,
      redis
    }: {
      pg: RxPg,
      redis: RxRedis
    }): rx.Observable<any> {

    throw new Error(
      "RedisMessage base task: process$ must be reimplemented at base message classes");

  }

}
