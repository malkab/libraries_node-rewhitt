import { Task } from "../src/index";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

/**
 *
 * This is a demo library defining tasks.
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
      itemA,
      itemB
    }: {
      itemA: number;
      itemB: string;
  }) {

    super({
      taskId: "TASKA"
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
