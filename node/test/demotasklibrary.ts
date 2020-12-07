import { Task, IRewhittTaskRegistry, TaskProgressCommand, TaskFinishCommand, TaskErrorCommand, Controller } from "../src/index";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from "@malkab/node-logger";

import { ESTATUS } from "../src/core/estatus";

/**
 *
 * This is a demo library defining all classes to define a Rewhitt
 * infrastructure. It must address several steps defined below.
 *
 * Define a serie of tasks that extends the Task base class from Rewhitt. Most
 * important is to define a **serial$** method, extending the **super.serial$**
 * with any additional data item to be serialized. Create also a factory
 * function to instantiate the right task type based on the Task base class
 * **taskId** member.
 *
 * Tasks must have a deconstructed constructor compatible with the **serial$**
 * function.
 *
 */
export const taskFactory$: (params: any) => rx.Observable<TaskA | TaskB> =
(params: any) => {

  if(params.taskType === "TASKA") {

    return rx.of(new TaskA({ ...params }));

  }

  if(params.taskType === "TASKB") {

    return rx.of(new TaskB({ ...params }));

  }

  throw new Error(`undefined taskId ${params.taskId}: ${params}`);

}

/**
 *
 * A Task.
 *
 */
export class TaskA extends Task {

  /**
   *
   * Item A.
   *
   */
  private _itemA: number;
  get itemA(): number { return this._itemA }

  /**
   *
   * Item B.
   *
   */
  private _itemB: string;
  get itemB(): string { return this._itemB }

  /**
   *
   * Constructor. Tasks must be parametrized.
   *
   */
  constructor({
      // Specific data for this task
      itemA,
      itemB,

      // Common task data
      rewhittId,
      taskId,
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
      itemA: number;
      itemB: string;
      rewhittId: string;
      taskId: string;
      status?: ESTATUS;
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

    super({
      rewhittId: rewhittId,
      taskRegistry: taskRegistry,
      taskId: taskId,
      taskType: "TASKA",
      status: status,
      workerId: workerId,
      modification: modification,
      created: created,
      posted: posted,
      queued: queued,
      lastProgress: lastProgress,
      error: error,
      finish: finish,
      progress: progress
    });

    this._itemA = itemA;
    this._itemB = itemB;

  }

  /**
   *
   * Supersede super serial$ for RxRedisQueue.
   *
   */
  public serial$(): rx.Observable<any> {

    return super.serial$()
    .pipe(

      rxo.map((o: any) => {

        return {
          ...o,
          itemA: this._itemA,
          itemB: this._itemB
        };

      })

    )

  }

  /**
   *
   * Run the task.
   *
   */
  public run$(): rx.Observable<TaskProgressCommand | TaskFinishCommand | TaskErrorCommand> {

    return rx.timer(500, 500)
    .pipe(

      rxo.filter((o: number) => o % 5 === 0),

      rxo.concatMap((o: any) => {

        this.progress = o;
        this._itemB = `${o}`;

        if (o === 20) {

          return this.sendTaskFinishCommand$();

        } else {

          return this.sendTaskProgressCommand$();

        }

      }),

      rxo.take(5)

    )

  }

}

/**
 *
 * Another Task.
 *
 */
export class TaskB extends Task {

  /**
   *
   * Item C.
   *
   */
  private _itemC: number;
  get itemC(): number { return this._itemC }

  /**
   *
   * Item D.
   *
   */
  private _itemD: string;
  get itemD(): string { return this._itemD }

  /**
   *
   * Constructor. Tasks must be parametrized.
   *
   */
  constructor({
      // Specific data for this task
      itemC,
      itemD,

      // Common task data
      rewhittId,
      taskId,
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
      itemC: number;
      itemD: string;
      rewhittId: string;
      taskId: string;
      status?: ESTATUS;
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

    super({
      rewhittId: rewhittId,
      taskRegistry: taskRegistry,
      taskId: taskId,
      taskType: "TASKB",
      status: status,
      workerId: workerId,
      modification: modification,
      created: created,
      posted: posted,
      queued: queued,
      lastProgress: lastProgress,
      error: error,
      finish: finish,
      progress: progress
    });

    this._itemC = itemC;
    this._itemD = itemD;

  }

  /**
   *
   * Supersede super serial$ for RxRedisQueue.
   *
   */
  public serial$(): rx.Observable<any> {

    return super.serial$()
    .pipe(

      rxo.map((o: any) => {

        return {
          ...o,
          itemC: this._itemC,
          itemD: this._itemD
        };

      })

    )

  }

  /**
   *
   * Run the task.
   *
   */
  public run$(): rx.Observable<TaskProgressCommand | TaskFinishCommand | TaskErrorCommand> {

    // To store the original interval emitted
    let interval: number;

    return rx.timer(1000, 1000)
    .pipe(

      rxo.filter((o: number) => o % 3 === 0),

      rxo.concatMap((o: any) => {

        this.progress = o;
        this._itemD = `${o}`;

        if (o === 9) {

          return this.sendTaskErrorCommand$();

        } else {

          return this.sendTaskProgressCommand$();

        }

      }),

      rxo.take(4)

    )

  }

}

/**
 *
 * The registration.
 *
 */
export const taskRegistry: IRewhittTaskRegistry = {

  taskFactory$: taskFactory$,

  tasks: {
    "TASKA": TaskA,
    "TASKB": TaskB
  }

}
