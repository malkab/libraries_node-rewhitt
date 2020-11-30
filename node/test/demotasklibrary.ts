import { Task } from "../src/index";

/**
 *
 * This is a demo library defining tasks.
 *
 */
export class TaskA extends Task {

  /**
   *
   * Serial.
   *
   */
  get serial(): any {

    return {
      ...super.serial,
      itemA: this._itemA,
      itemB: this._itemB
    }

  }

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

}
