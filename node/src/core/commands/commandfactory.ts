import { ECOMMANDTYPE } from './ecommandtype';

import { PostCommand } from "./postcommand";

import { QueueCommand } from "./queuecommand";

import { TaskProgressCommand } from "./taskprogresscommand";

import { TaskFinishCommand } from "./taskfinishcommand";

import { TaskErrorCommand } from "./taskerrorcommand";

import { RunCommand } from "./runcommand";

import { WorkerHeartbeatCommand } from './workerheartbeatcommand';

/**
 *
 * Function to factorize the right RedisMessage.
 *
 */
export const commandFactory: (params: any) =>
PostCommand | QueueCommand | RunCommand | TaskProgressCommand | TaskFinishCommand | TaskErrorCommand | WorkerHeartbeatCommand =
(params: any) => {

  if (params.commandType === ECOMMANDTYPE.POST) {

    return new PostCommand(params);

  }

  if (params.commandType === ECOMMANDTYPE.QUEUE) {

    return new QueueCommand(params);

  }

  if (params.commandType === ECOMMANDTYPE.RUN) {

    return new RunCommand(params);

  }

  if (params.commandType === ECOMMANDTYPE.TASKPROGRESS) {

    return new TaskProgressCommand(params);

  }

  if (params.commandType === ECOMMANDTYPE.TASKFINISH) {

    return new TaskFinishCommand(params);

  }

  if (params.commandType === ECOMMANDTYPE.TASKERROR) {

    return new TaskErrorCommand(params);

  }

  if (params.commandType === ECOMMANDTYPE.WORKERHEARTBEAT) {

    return new WorkerHeartbeatCommand(params);

  }

  throw new Error(`commandFactory error: unknown command ${params.commandType}`);

}
