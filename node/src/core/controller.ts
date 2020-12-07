import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { Command } from "./commands/command";

import { commandFactory } from './commands/commandfactory';

import { ECOMMANDTYPE } from './commands/ecommandtype';

import { IRewhittTaskRegistry } from "./irewhitttaskregistry";

/**
 *
 * This is the Rewhitt controller.
 *
 */
export class Controller {

  /**
   *
   * The task registration.
   *
   */
  private _taskRegistry: IRewhittTaskRegistry;
  get taskRegistry(): IRewhittTaskRegistry { return this._taskRegistry };

  /**
   *
   * Logger.
   *
   */
  private _log: NodeLogger;
  get log(): NodeLogger { return this._log }

  /**
   *
   * The name of the client > controller queue.
   *
   */
  get clientControllerQueueName(): string {
    return `rewhitt::${this.rewhittId}::client::controller` }

  /**
   *
   * The name of the worker > controller queue.
   *
   */
  get workerControllerQueueName(): string {
    return `rewhitt::${this.rewhittId}::worker::controller` }

  /**
   *
   * Rewhitt instance ID, used to identify the PG schema.
   *
   */
  private _rewhittId: string;
  get rewhittId(): string { return this._rewhittId }

  /**
   *
   * Rewhitt controller ID.
   *
   */
  private _controllerId: string;
  get controllerId(): string { return this._controllerId }

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
      controllerId,
      pg,
      redis,
      taskRegistry,
      log
    }: {
      rewhittId: string;
      controllerId: string;
      pg: RxPg;
      redis: RxRedis;
      taskRegistry: IRewhittTaskRegistry;
      log: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._controllerId = `CONTROLLER::${controllerId}`;
    this._pg = pg;
    this._redis = redis;
    this._taskRegistry = taskRegistry;
    this._log = log;

  }

  /**
   *
   * Start the command loop.
   *
   */
  public startCommandLoop(): void {

    // To store the generated command by the loop
    let storedCommand: Command;

    // A blocking connection to Redis for message processing
    const b: RxRedis = this._redis.blockingClone();

    // Start client > controller message loop
    RxRedisQueue.get$({
      redis: b,
      keys: [ this.workerControllerQueueName, this.clientControllerQueueName ]
    }).pipe(

      // Get the command from the Redis
      rxo.map((o: any) => commandFactory({
          ...JSON.parse(o[1]),
          rewhittId: this.rewhittId,
          taskRegistry: this._taskRegistry
        })

      ),

      // Process the command, shielding the loop from errors
      rxo.switchMap((o: Command) => {

        storedCommand = o;

        // Check for allowed commands
        if ([
          ECOMMANDTYPE.POST,
          ECOMMANDTYPE.QUEUE,
          ECOMMANDTYPE.TASKPROGRESS,
          ECOMMANDTYPE.TASKFINISH,
          ECOMMANDTYPE.TASKERROR,
          ECOMMANDTYPE.WORKERHEARTBEAT
        ].indexOf(o.commandType) === -1) {

          throw new Error(`unprocessable command ${o.commandType} for controller`);

        };

        return o.process$({ pg: this.pg, redis: this.redis })
        .pipe(

          rxo.catchError((o: Error) => rx.of(o))

        )

      }),

      rxo.repeat()

    ).subscribe(

      (o: any) => {

        this.log.logInfo({
          moduleName: `controller: ${this.controllerId}`,
          methodName: "client > controller loop$",
          message: `${storedCommand.commandType} command: ${o}`,
          payload: { commandType: storedCommand.commandType }
        })

      },

      (e: Error) => {

        this.log.logError({
          moduleName: `controller: ${this.controllerId}`,
          methodName: "client > controller loop$",
          message: `reaching error processing, should not happen, terminating loop: ${e.message}`
        });

      },

      () => {

        this.log.logError({
          moduleName: `controller: ${this.controllerId}`,
          methodName: "client > controller loop$",
          message: `loop completing, should not happen`
        })

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
       * Status catalog, this must include all elements in ENUM ESTATUS,
       * although not exclusively. Also other Rewhitt system's actions or events
       * can be added here for the log.
       *
       */
      create table rewhitt_${this.rewhittId}.status(
        status_id varchar(64) primary key,
        description text
      );

      /**
       *
       * AnalysisTasks.
       *
       */
      create table rewhitt_${this.rewhittId}.task(
        task_id varchar(64) primary key,
        task_type varchar(64),
        status varchar(64) references rewhitt_${this.rewhittId}.status(status_id),
        worker_id varchar(100) references rewhitt_${this.rewhittId}.worker(worker_id),
        modification timestamp,
        created timestamp,
        posted timestamp,
        queued timestamp,
        last_progress timestamp,
        error timestamp,
        finish timestamp,
        progress float,
        params jsonb
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
        status_id varchar(64) references rewhitt_${this.rewhittId}.status(status_id),
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
       * Status.
       *
       */
      insert into rewhitt_${this.rewhittId}.status
      values ('INIT', 'Rewhitt initialization');

      insert into rewhitt_${this.rewhittId}.status
      values ('POST', 'POST command');

      insert into rewhitt_${this.rewhittId}.status
      values ('QUEUE', 'QUEUE command');

      insert into rewhitt_${this.rewhittId}.status
      values ('RUNNING', 'RUNNING command');

      insert into rewhitt_${this.rewhittId}.status
      values ('FINISH', 'FINISH command');

      insert into rewhitt_${this.rewhittId}.status
      values ('ERROR', 'ERROR command');

      /**
       *
       * Log the initialization.
       *
       */
      insert into rewhitt_${this.rewhittId}.log
      values (now(), '${this.controllerId}', 'INFO', 'INIT');

      commit;
    `).
    pipe(

      rxo.catchError((e: Error) => {

        if (e.message === `schema "rewhitt_${this.rewhittId}" already exists`) {

          this.log.logError({
            message: `error initializing Rewhitt: already initialized`,
            moduleName: "controller",
            methodName: "init()"
          });

          return rx.throwError(new Error("rewhitt is already initialized"));

        } else {

          this.log.logError({
            message: `unexpected error initializing Rewhitt: ${e.message}`,
            moduleName: "controller",
            methodName: "init()"
          });

          return rx.throwError(e);

        }

      }),

      rxo.map((o: any) => {

        this.log.logInfo({
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
