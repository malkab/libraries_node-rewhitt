import { RxPg, QueryResult } from "@malkab/rxpg";

import { NodeLogger, ELOGLEVELS } from "@malkab/node-logger";

import { RxRedis } from "@malkab/rxredis";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { Client, Controller } from "../../src/index";

import { TaskA, TaskB, taskRegistry } from "../demotasklibrary";

/**
 *
 * Put here all common assets for tests. Tests should use as many common assets
 * as possible for common objects.
 *
 */

/**
 *
 * The loggers.
 *
 */
export const controllerLogger: NodeLogger = new NodeLogger({
  appName: "controller",
  consoleOut: false,
  minLogLevel: ELOGLEVELS.DEBUG,
  logFilePath: "/logs/controller",
})

export const clientLogger: NodeLogger = new NodeLogger({
  appName: "client",
  consoleOut: false,
  minLogLevel: ELOGLEVELS.DEBUG,
  logFilePath: "/logs/client"
})

/**
 *
 * PG connection.
 *
 */
export const pg: RxPg = new RxPg({
  applicationName: "test-libsunnsaasbackend",
  db: "postgres",
  host: "postgis",
  pass: "postgres"
});

/**
 *
 * Redis connection.
 *
 */
export const redis: RxRedis = new RxRedis({
  url: "redis://redis",
  password: "redis-secret-999"
})

/**
 *
 * Clear the database. Define here service functions and Observables that are
 * going to be reused.
 *
 */
export const clearDatabase$: rx.Observable<boolean> =
  pg.executeParamQuery$(`
    drop schema if exists rewhitt_test cascade;
  `)
  .pipe(

    rxo.concatMap((o: QueryResult) => redis.flushall$()),

    rxo.map((o: string) => o === "OK" ? true : false)

  );

/**
 *
 * This registers tasks and the task factory into the Rewhitt system. This way
 * Rewhitt knows how to construct tasks.
 *
 */


/**
 *
 * ReWhitt controller.
 *
 */
export const controller: Controller = new Controller({
  rewhittId: "test",
  controllerId: "theController",
  pg: pg,
  redis: redis,
  taskRegistry: taskRegistry,
  log: controllerLogger
})

/**
 *
 * ReWhitt client.
 *
 */
export const client: Client = new Client({
  rewhittId: "test",
  clientId: "theClient",
  redis: redis,
  taskRegistry: taskRegistry,
  log: clientLogger
})

/**
 *
 * Tasks.
 *
 */
export const taskA: TaskA = new TaskA({
  taskId: "aTaskA",
  itemA: 33,
  itemB: "33",
  log: clientLogger
})

export const taskB: TaskB = new TaskB({
  taskId: "aTaskB",
  itemC: 33,
  itemD: "33",
  log: clientLogger
})

export const anotherTaskB: TaskB = new TaskB({
  taskId: "anotherTaskB",
  itemC: 44,
  itemD: "44",
  log: clientLogger
})
