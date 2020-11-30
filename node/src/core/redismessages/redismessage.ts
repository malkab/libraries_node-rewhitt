import { EREDISMESSAGETYPE } from "../eredismessagetype";

import { IRedisMessageObject } from "@malkab/rxredis";

import * as rx from "rxjs";

/**
 *
 * Models a Rewhitt client message. All message must inherit this class.
 *
 */
export class RedisMessage implements IRedisMessageObject {

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
      messageType,
      from,
      to
    }: {
      messageType: EREDISMESSAGETYPE;
      from: string;
      to: string;
  }) {

    this._messageType = messageType;
    this._from = from;
    this._to = to;

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

}
