import { EREDISMESSAGETYPE } from '../eredismessagetype';

import { PostRedisMessage } from "./postredismessage";

/**
 *
 * Function to factorize the right RedisMessage.
 *
 */
export const redisMessageFactory: (params: any) => PostRedisMessage =
(params: any) => {

  if (params.messageType === EREDISMESSAGETYPE.POST) {

    return new PostRedisMessage(params);

  }

  throw new Error(`error: unknown RedisMessage ${params.messageType}`);

}
