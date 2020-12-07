import { NodeLogger } from '@malkab/node-logger';

import { RxPg } from '@malkab/rxpg';

import { RxRedis, RxRedisQueue } from '@malkab/rxredis';

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { Command } from "./commands/command";

import { commandFactory } from './commands/commandfactory';

import { ECOMMANDTYPE } from "./commands/ecommandtype";

import { IRewhittTaskRegistry } from "./irewhitttaskregistry";

import { WorkerHeartbeatCommand } from "./commands/workerheartbeatcommand"

/**
 *
 * Rewhitt worker.
 *
 */
export class Worker {

  /**
   *
   * Rewhitt instance ID, used to identify the PG schema.
   *
   */
  private _rewhittId: string;
  get rewhittId(): string { return this._rewhittId }

  /**
   *
   * Rewhitt worker ID.
   *
   */
  private _workerId: string;
  get workerId(): string { return this._workerId }

  /**
   *
   * Task types to process to, in order.
   *
   */
  private _taskTypes: string[];
  get taskTypes(): string[] { return this._taskTypes }

  /**
   *
   * Returns the names of the queues for the tasks.
   *
   */
  get taskQueueNames(): string[] {

    return this.taskTypes.map((type: string) => `rewhitt::${this.rewhittId}::task::${type}`);

  }

  /**
   *
   * The queue for worker > controller communication.
   *
   */
  get workerControllerQueue(): string {
    return `rewhitt::${this.rewhittId}::worker::controller` }

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
   * Constructor.
   *
   */
  constructor({
      rewhittId,
      workerId,
      taskTypes,
      pg,
      redis,
      taskRegistry,
      heartbeat = 10000,
      log
    }: {
      rewhittId: string;
      workerId: string;
      taskTypes: string[];
      pg: RxPg;
      redis: RxRedis;
      taskRegistry: IRewhittTaskRegistry;
      heartbeat?: number;
      log: NodeLogger;
  }) {

    this._rewhittId = rewhittId;
    this._workerId = `WORKER::${workerId}`;
    this._taskTypes = taskTypes;
    this._pg = pg;
    this._redis = redis;
    this._taskRegistry = taskRegistry;
    this._log = log;

    /**
     *
     * Worker heartbeat loop.
     *
     */
    setInterval(() => {

      this._sendHeartbeat$().subscribe(

        (o: any) => {

          this.log.logInfo({
            moduleName: `worker: ${this.workerId}`,
            methodName: "task worker heartbeat",
            message: `${this.workerId} heartbeat`
          })

        },

        (o: Error) => {

          this.log.logError({
            moduleName: `worker: ${this.workerId}`,
            methodName: "task worker heartbeat",
            message: `${this.workerId} heartbeat error: ${o.message}`,
            payload: { error: o.message }
          })

        }

      )

    }, heartbeat);

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

    // Start tasks queues message loop
    RxRedisQueue.get$({ redis: b, keys: this.taskQueueNames }).pipe(

      // Get the command from the Redis
      rxo.map((o: any) => {

        return commandFactory({
          ...JSON.parse(o[1]),
          rewhittId: this.rewhittId,
          taskRegistry: this._taskRegistry
        })

      }),

      // Process the command, shielding the loop from errors
      rxo.switchMap((o: Command) => {

        storedCommand = o;

        // Check for allowed commands
        if ([ ECOMMANDTYPE.RUN ].indexOf(o.commandType) === -1) {

          throw new Error(`unprocessable command ${o.commandType} for worker`);

        };

        return o.process$({ pg: this.pg, redis: this.redis })
        .pipe(

          rxo.catchError((o: Error) => rx.of(o))

        )

      }),

      // Publish the generated command in the task run to the controller queue
      rxo.concatMap((o: any) => {

        o = o.serial;
        o.serialTask.workerId = this.workerId;
        o.from = this.workerId;

        return RxRedisQueue.set$(this.redis, this.workerControllerQueue,
          JSON.stringify(o)).pipe(

            rxo.map((x: any) => `command ${o.commandType}, task ${o.serialTask.taskType}/${o.serialTask.taskId}, progress ${o.serialTask.progress}`)

          );

      }),

      rxo.repeat()

    ).subscribe(

      (o: any) => {

        this.log.logInfo({
          moduleName: `worker: ${this.workerId}`,
          methodName: "task worker loop$",
          message: `${storedCommand.commandType} command: ${o}`,
          payload: { commandType: storedCommand.commandType }
        })

      },

      (e: Error) => {

        this.log.logError({
          moduleName: `worker: ${this.workerId}`,
          methodName: "task worker loop$",
          message: `reaching error processing, should not happen, terminating loop: ${e.message}`
        });

      },

      () => {

        this.log.logError({
          moduleName: `worker: ${this.workerId}`,
          methodName: "task worker loop$",
          message: `loop completing, should not happen`
        })

      }

    )

  }

  /**
   *
   * Heartbeat function.
   *
   */
  private _sendHeartbeat$(): rx.Observable<any> {

    return RxRedisQueue.set$(this.redis, this.workerControllerQueue,
      JSON.stringify(
        new WorkerHeartbeatCommand({
          from: this.workerId ? this.workerId : "unknown worker",
          to: "controller",
          rewhittId: this.rewhittId,
          workerId: this.workerId,
          taskRegistry: this.taskRegistry
        }).serial))

  }

  /**
   *
   * Initialize and register the worker in the controller. It generates a
   * heart beat.
   *
   */
  public register$(): rx.Observable<boolean | string> {

    return this._sendHeartbeat$().pipe(

      rxo.map((o: any) => {

        this.log.logInfo({
          moduleName: `worker: ${this.workerId}`,
          methodName: "register$()",
          message: `${this.workerId} registered`
        })

        return true;

      }),

      rxo.catchError((o: Error) => {

        this.log.logError({
          moduleName: `worker: ${this.workerId}`,
          methodName: "register$()",
          message: `${this.workerId} register error: ${o.message}`,
          payload: { error: o.message }
        })

        return o.message;

      })

    );

  }

}
