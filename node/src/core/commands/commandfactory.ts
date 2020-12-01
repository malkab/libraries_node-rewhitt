import { ECOMMANDTYPE } from './ecommandtype';

import { PostCommand } from "./postcommand";

import { QueueCommand } from "./queuecommand";

/**
 *
 * Function to factorize the right RedisMessage.
 *
 */
export const commandFactory: (params: any) => PostCommand | QueueCommand =
(params: any) => {

  if (params.commandType === ECOMMANDTYPE.POST) {

    return new PostCommand(params);

  }

  if (params.commandType === ECOMMANDTYPE.QUEUE) {

    return new QueueCommand(params);

  }

  throw new Error(`error: unknown command ${params.commandType}`);

}
