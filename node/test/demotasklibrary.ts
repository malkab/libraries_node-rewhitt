import { Task, IRewhittTaskRegistry } from "../src/index";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { NodeLogger } from "@malkab/node-logger";

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
export const taskFactory: (params: any, log?: NodeLogger) => rx.Observable<TaskA | TaskB> =
(params: any, log?: NodeLogger) => {

  if(params.taskType === "TASKA") {

    return rx.of(new TaskA({ ...params, log: log }));

  }

  if(params.taskType === "TASKB") {

    return rx.of(new TaskB({ ...params, log: log }));

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
      taskId,
      itemA,
      itemB,
      log
    }: {
      taskId: string;
      itemA: number;
      itemB: string;
      log?: NodeLogger;
  }) {

    super({
      taskId: taskId,
      taskType: "TASKA",
      log: log
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
      taskId,
      itemC,
      itemD,
      log
    }: {
      taskId: string;
      itemC: number;
      itemD: string;
      log?: NodeLogger;
  }) {

    super({
      taskId: taskId,
      taskType: "TASKB",
      log: log
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

}

/**
 *
 * The registration.
 *
 */
export const taskRegistry: IRewhittTaskRegistry = {

  taskFactory: taskFactory,

  tasks: {
    "TASKA": TaskA,
    "TASKB": TaskB
  }

}
