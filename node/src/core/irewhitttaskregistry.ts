import { NodeLogger } from '@malkab/node-logger';

import * as rx from "rxjs";

/**
 *
 * This is the data structure a Rewhitt instance needs to register tasks and its
 * factory.
 *
 */
export interface IRewhittTaskRegistry {
  /**
   *
   * The factory function.
   *
   */
  taskFactory$: (params: any, log?: NodeLogger) => rx.Observable<any>;
  /**
   *
   * The map of tasks to be recognized by the Rewhitt instance. They must extend
   * the Rewhitt class **Task**. The key of the Map is the taskType identifying
   * the task type and used by the factory to identify the correct type of task,
   * while the values must be the constructors of those child Task classes.
   *
   */
  tasks: { [ taskType: string ]: any }
}
