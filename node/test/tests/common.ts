import { RxPg, QueryResult } from "@malkab/rxpg";

import { NodeLogger, ELOGLEVELS } from "@malkab/node-logger";

import { RxRedis } from "@malkab/rxredis";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { Client, Controller } from "../../src/index";

import { TaskA } from "../demotasklibrary";

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
  consoleOut: true,
  minLogLevel: ELOGLEVELS.DEBUG,
  logFilePath: "/logs/controller"
})

export const clientLogger: NodeLogger = new NodeLogger({
  appName: "client",
  consoleOut: true,
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
 * ReWhitt controller.
 *
 */
export const controller: Controller = new Controller({
  name: "test",
  pg: pg,
  redis: redis,
  log: controllerLogger
})

/**
 *
 * ReWhitt client.
 *
 */
export const client: Client = new Client({
  name: "test",
  pg: pg,
  redis: redis,
  log: clientLogger
})

/**
 *
 * Tasks.
 *
 */
export const taskA: TaskA = new TaskA({
  itemA: 33,
  itemB: "33"
})
