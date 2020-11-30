import { EREDISMESSAGETYPE } from "./eredismessagetype";

/**
 *
 * Models a Rewhitt client message.
 *
 */
export interface IRedisMessage {
  /**
   *
   * Message type.
   *
   */
  messageType: EREDISMESSAGETYPE;
  /**
   *
   * Message payload.
   *
   */
  payload: any;
}
