import { RxPg, QueryResult } from "@malkab/rxpg";

import { NodeLogger, ELOGLEVELS } from "@malkab/node-logger";

import { RxRedis } from "@malkab/rxredis";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { Client, Controller, Worker } from "../../src/index";

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

export const workerLoggerA: NodeLogger = new NodeLogger({
  appName: "worker",
  consoleOut: false,
  minLogLevel: ELOGLEVELS.DEBUG,
  logFilePath: "/logs/workerA"
})

export const workerLoggerB: NodeLogger = new NodeLogger({
  appName: "worker",
  consoleOut: false,
  minLogLevel: ELOGLEVELS.DEBUG,
  logFilePath: "/logs/workerB"
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
 * ReWhitt workers.
 *
 */
export const workerA: Worker = new Worker({
  rewhittId: "test",
  workerId: "theWorkerA",
  pg: pg,
  redis: redis,
  taskRegistry: taskRegistry,
  log: workerLoggerA,
  taskTypes: [ "TASKA", "TASKB" ]
})

export const workerB: Worker = new Worker({
  rewhittId: "test",
  workerId: "theWorkerB",
  pg: pg,
  redis: redis,
  taskRegistry: taskRegistry,
  log: workerLoggerB,
  taskTypes: [ "TASKB" ]
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
 * Task generators.
 *
 */
export const generateTaskA: (n: number) => TaskA[] = (n: number) =>
  Array.from(Array(n).keys()).map((n: number) => new TaskA({
    rewhittId: "test",
    taskId: `aTask${n}`,
    itemA: n,
    itemB: `${n}`
  }))

export const generateTaskB: (n: number) => TaskB[] = (n: number) =>
  Array.from(Array(n).keys()).map((n: number) => new TaskB({
    rewhittId: "test",
    taskId: `bTask${n}`,
    itemC: n,
    itemD: `${n}`
  }))
