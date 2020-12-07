import { ECOMMANDTYPE } from './ecommandtype';

import { Command } from "./command";

import { Task } from "../task";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { OrmError } from "@malkab/ts-utils";

import { RxRedis } from '@malkab/rxredis';

import { IRewhittTaskRegistry } from '../irewhitttaskregistry';

import { ESTATUS } from "../estatus";

/**
 *
 * POST command.
 *
 */
export class WorkerHeartbeatCommand extends Command {

  /**
   *
   * serial, for RxRedisQueue.
   *
   */
  get serial(): any {

    return {
      ...super.serial,
      workerId: this._workerId
    }

  }

  /**
   *
   * The task serialization.
   *
   */
  private _workerId: any;
  get workerId(): string { return this._workerId }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      rewhittId,
      taskRegistry,
      from,
      to,
      workerId
    }: {
      rewhittId: string;
      taskRegistry: IRewhittTaskRegistry;
      from: string;
      to: string;
      workerId: string;
  }) {

    super({
      rewhittId: rewhittId,
      commandType: ECOMMANDTYPE.WORKERHEARTBEAT,
      taskRegistry: taskRegistry,
      from: from,
      to: to
    });

    this._workerId = workerId;

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
      pg: RxPg;
      redis: RxRedis;
  }): rx.Observable<any> {

    // Try to insert
    return pg.executeParamQuery$(`
      insert into rewhitt_${this._rewhittId}.worker
      values ($1, now())
      on conflict (worker_id)
      do update set last_activity = now();`,
      { params: [ this.workerId ]}
    ).pipe(

      rxo.map((o: any) => this.workerId)

    )

  }

}
