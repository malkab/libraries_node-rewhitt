import { NodeLogger } from '@malkab/node-logger';

import { RxPg, PgOrm } from "@malkab/rxpg";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { ESTATUS } from './estatus';

import { IRewhittTaskRegistry } from './irewhitttaskregistry';

/**
 *
 * This is the base Task class every task definition must implement.
 *
 */
export class Task implements PgOrm.IPgOrm<Task>{

  // Placeholder for the required functions at the IPgPersistence interface
  // These will be created automatically by a helper at construction time
  public pgInsert$: (pg: RxPg, additionalParams?: any) => rx.Observable<Task> = (pg: RxPg) => rx.of(this);
  public pgUpdate$: (pg: RxPg, additionalParams?: any) => rx.Observable<Task> = (pg: RxPg) => rx.of(this);
  public pgDelete$: (pg: RxPg, additionalParams?: any) => rx.Observable<Task> = (pg: RxPg) => rx.of(this);

  /**
   *
   * The log.
   *
   */
  protected _log: NodeLogger | undefined;

  /**
   *
   * The status of the task.
   *
   */
  protected _status: ESTATUS | undefined;
  get status(): ESTATUS | undefined { return this._status }
  set status(status: ESTATUS | undefined) { this._status = status }

  /**
   *
   * The worker ID.
   *
   */

  /**
   *
   * Task ID.
   *
   */
  protected _taskId: string;
  get taskId(): string { return this._taskId }

  /**
   *
   * Task type.
   *
   */
  protected _taskType: string;
  get taskType(): string { return this._taskType }

  /**
   *
   * Constructor.
   *
   */
  constructor({
      taskId,
      taskType,
      status,
      log
    }: {
      taskId: string;
      taskType: string;
      status?: ESTATUS;
      log: NodeLogger;
  }) {

    this._taskId = taskId;
    this._taskType = taskType;
    this._status = status;
    this._log = log;

    PgOrm.generateDefaultPgOrmMethods(this, {
      pgInsert$: {
        sql: (additionalParams) => `
          insert into rewhitt_${additionalParams.rewhittId}.task (
            task_id, task_type, created, modification, params, status
          ) values ($1, $2, to_timestamp($3), to_timestamp($4), $5, $6);
        `,
        params$: () => this.serial$().pipe(
          rxo.map((o: any) => [ this._taskId, this._taskType,
            Date.now()/1000.0, Date.now()/1000.0, o, this._status ])
        )
      },
      pgUpdate$: {
        sql: (additionalParams) => `
          update rewhitt_${additionalParams.rewhittId}.task
          set
            modification = to_timestamp($1),
            params = $2,
            status = $3
          ;
        `,
        params$: () => this.serial$().pipe(
          rxo.map((o: any) => [ Date.now()/1000.0, o, this._status ])
        )
      },
    })

  }

  /**
   *
   * get$.
   *
   */
  public static get$(pg: RxPg, rewhittId: string,
    taskRegistry: IRewhittTaskRegistry, taskId: string, log?: NodeLogger
  ): rx.Observable<Task> {

    console.log("D: 33333 uuu", taskId);

    return PgOrm.select$<Task>({
      pg: pg,
      sql: `
        select params as p, status
        from rewhitt_${rewhittId}.task
        where task_id = $1;`,
      type: Task,
      newFunction: (params) => {

        console.log("D: 5555", params);
        const t: any = taskRegistry.taskFactory$({
          ...params.p, status: params.status }, log);
        console.log("D: 1111", t);
        return t;

      },
      params: () => [ taskId ]
    })

  }

  /**
   *
   * This is the serializing method to serialize the task to the DB and Redis.
   *
   */
  public serial$(): rx.Observable<any> {

    return rx.of({
      taskId: this.taskId,
      taskType: this.taskType
    })

  }

}
