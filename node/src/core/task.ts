import { NodeLogger } from '@malkab/node-logger';

import { RxPg, PgOrm } from "@malkab/rxpg";

import { RxRedis } from '@malkab/rxredis';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { ESTATUS } from './estatus';

import { IRewhittTaskRegistry } from './irewhitttaskregistry';

import { TaskProgressCommand } from "./commands/taskprogresscommand";

import { TaskFinishCommand } from "./commands/taskfinishcommand";

import { TaskErrorCommand } from "./commands/taskerrorcommand";

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
   * The Rewhitt ID.
   *
   */
  protected _rewhittId: string;
  get rewhittId(): string { return this._rewhittId }

  /**
   *
   * The Rewhitt ID.
   *
   */
  protected _taskRegistry: IRewhittTaskRegistry;
  get taskRegistry(): IRewhittTaskRegistry { return this._taskRegistry }

  /**
   *
   * Gets a composed string with taskType/taskId
   *
   */
  get taskTaxonomy(): string { return `${this.taskType}/${this.taskId}` }

  /**
   *
   * The status of the task.
   *
   */
  protected _status: ESTATUS;
  get status(): ESTATUS { return this._status }
  set status(status: ESTATUS) { this._status = status }

  /**
   *
   * The worker ID.
   *
   */
  protected _workerId: string | undefined;
  get workerId(): string | undefined { return this._workerId }
  set workerId(workerId: string | undefined) { this._workerId = workerId }

  /**
   *
   * The name of the task to worker queue.
   *
   */
  get toWorkerTaskQueueName(): string {
    return `rewhitt::${this.rewhittId}::task::${this.taskType}` }

  /**
   *
   * Created.
   *
   */
  protected _created: number | undefined;
  get created(): number | undefined { return this._created }

  /**
   *
   * Posted.
   *
   */
  protected _posted: number | undefined;
  get posted(): number | undefined { return this._posted }

  /**
   *
   * Modification.
   *
   */
  protected _modification: number | undefined;
  get modification(): number | undefined { return this._modification }

    /**
   *
   * Queued.
   *
   */
  protected _queued: number | undefined;
  get queued(): number | undefined { return this._queued }

  /**
   *
   * Last progress.
   *
   */
  protected _lastProgress: number | undefined;
  get lastProgress(): number | undefined { return this._lastProgress }

  /**
   *
   * Error.
   *
   */
  protected _error: number | undefined;
  get error(): number | undefined { return this._error }

  /**
   *
   * Completion.
   *
   */
  protected _finish: number | undefined;
  get finish(): number | undefined { return this._finish }

  /**
   *
   * Progress.
   *
   */
  protected _progress: number | undefined;
  get progress(): number | undefined { return this._progress }
  set progress(progress: number | undefined) { this._progress = progress }

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
      rewhittId,
      taskRegistry,
      taskId,
      taskType,
      status,
      workerId,
      modification,
      created,
      posted,
      queued,
      lastProgress,
      error,
      finish,
      progress
    }: {
      rewhittId: string;
      taskRegistry: IRewhittTaskRegistry;
      taskId: string;
      taskType: string;
      status: ESTATUS;
      workerId?: string;
      modification?: number;
      created?: number;
      posted?: number;
      queued?: number;
      lastProgress?: number;
      error?: number;
      finish?: number;
      progress?: number;
  }) {

    this._rewhittId = rewhittId;
    this._taskRegistry = taskRegistry;
    this._taskId = taskId;
    this._taskType = taskType;
    this._status = status;
    this._workerId = workerId;
    this._modification = modification;
    this._created = created;
    this._posted = posted;
    this._queued = queued;
    this._lastProgress = lastProgress;
    this._error = error;
    this._finish = finish;
    this._progress = progress;

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
            modification = now(),
            worker_id = $5,
            params = $1,
            status = $2,
            progress = $4
          where task_id = $3
          ;
        `,
        params$: () => this.serial$().pipe(
          rxo.map((o: any) => [ o, this._status,
            this._taskId, this._progress, this.workerId ])
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
    taskRegistry: IRewhittTaskRegistry, taskId: string
  ): rx.Observable<Task> {

    return PgOrm.select$<Task>({
      pg: pg,
      sql: `
        select params as p, status
        from rewhitt_${rewhittId}.task
        where task_id = $1;`,
      type: Task,
      newFunction: (params) => {

        const t: any = taskRegistry.taskFactory$({
          ...params.p,
          status: params.status,
          rewhittId: rewhittId
        });

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
      taskType: this.taskType,
      progress: this.progress,
      workerId: this.workerId
    });

  }

  /**
   *
   * Run$, here goes the logic of the task.
   *
   */
  public run$({
      pg,
      redis
    }: {
      pg: RxPg;
      redis: RxRedis;
  }): rx.Observable<TaskProgressCommand | TaskFinishCommand | TaskErrorCommand> {

    throw new Error(`undefined method run$ for task ${this.taskTaxonomy}`)

  }

  /**
   *
   * Put a TASKPROGRESS command into the controller queue.
   *
   */
  public sendTaskProgressCommand$(): rx.Observable<TaskProgressCommand> {

    return this.serial$()
    .pipe(

      rxo.map((o: any) => new TaskProgressCommand({
        from: this.workerId ? this.workerId : "unknown worker",
        to: "controller",
        rewhittId: this.rewhittId,
        serialTask: o,
        taskRegistry: this.taskRegistry
      }))

    )

  }

  /**
   *
   * Put a TASKFINISH command into the controller queue.
   *
   */
  public sendTaskFinishCommand$(): rx.Observable<TaskFinishCommand> {

    return this.serial$()
    .pipe(

      rxo.map((o: any) => new TaskFinishCommand({
        from: this.workerId ? this.workerId : "unknown worker",
        to: "controller",
        rewhittId: this.rewhittId,
        serialTask: o,
        taskRegistry: this.taskRegistry
      }))

    )

  }

  /**
   *
   * Put a TASKERROR command into the controller queue.
   *
   */
  public sendTaskErrorCommand$(): rx.Observable<TaskErrorCommand> {

    return this.serial$()
    .pipe(

      rxo.map((o: any) => new TaskErrorCommand({
        from: this.workerId ? this.workerId : "unknown worker",
        to: "controller",
        rewhittId: this.rewhittId,
        serialTask: o,
        taskRegistry: this.taskRegistry
      }))

    )

  }

  /**
   *
   * Update modification timestamp.
   *
   */
  public updateModificationTimestamp$(pg: RxPg): rx.Observable<any> {

    return pg.executeParamQuery$(`
      update rewhitt_${this.rewhittId}.task
      set modification = now()
      where task_id = $1;`,
      { params: [ this.taskId ] }
    ).pipe(

      rxo.map((o: any) =>
        `task ${this.taskTaxonomy}: updated modification time`)

    )

  }

  /**
   *
   * Update posted timestamp.
   *
   */
  public updatePostedTimestamp$(pg: RxPg): rx.Observable<any> {

    return pg.executeParamQuery$(`
      update rewhitt_${this.rewhittId}.task
      set posted = now()
      where task_id = $1;`,
      { params: [ this.taskId ] }
    ).pipe(

      rxo.map((o: any) =>
        `task ${this.taskTaxonomy}: updated posted time`)

    )

  }

  /**
   *
   * Update queued timestamp.
   *
   */
  public updateQueuedTimestamp$(pg: RxPg): rx.Observable<any> {

    return pg.executeParamQuery$(`
      update rewhitt_${this.rewhittId}.task
      set queued = now()
      where task_id = $1;`,
      { params: [ this.taskId ] }
    ).pipe(

      rxo.map((o: any) =>
        `task ${this.taskTaxonomy}: updated queued time`)

    )

  }

  /**
   *
   * Update queued timestamp.
   *
   */
  public updateLastProgressTimestamp$(pg: RxPg): rx.Observable<any> {

    return pg.executeParamQuery$(`
      update rewhitt_${this.rewhittId}.task
      set last_progress = now()
      where task_id = $1;`,
      { params: [ this.taskId ] }
    ).pipe(

      rxo.map((o: any) =>
        `task ${this.taskTaxonomy}: updated last_progress time`)

    )

  }

  /**
   *
   * Update error timestamp.
   *
   */
  public updateErrorTimestamp$(pg: RxPg): rx.Observable<any> {

    return pg.executeParamQuery$(`
      update rewhitt_${this.rewhittId}.task
      set error = now()
      where task_id = $1;`,
      { params: [ this.taskId ] }
    ).pipe(

      rxo.map((o: any) =>
        `task ${this.taskTaxonomy}: updated error time`)

    )

  }

  /**
   *
   * Update finish timestamp.
   *
   */
  public updateFinishTimestamp$(pg: RxPg): rx.Observable<any> {

    return pg.executeParamQuery$(`
      update rewhitt_${this.rewhittId}.task
      set finish = now()
      where task_id = $1;`,
      { params: [ this.taskId ] }
    ).pipe(

      rxo.map((o: any) =>
        `task ${this.taskTaxonomy}: updated finish time`)

    )

  }

}
