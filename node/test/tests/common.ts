import { RxPg, QueryResult } from "@malkab/rxpg";

import { NodeLogger, ELOGLEVELS } from "@malkab/node-logger";

import { RxRedis } from "@malkab/rxredis";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { Client } from "../../src/index";

/**
 *
 * Put here all common assets for tests. Tests should use as many common assets
 * as possible for common objects.
 *
 */

/**
 *
 * The logger.
 *
 */
export const logger: NodeLogger = new NodeLogger({
  appName: "libsunnsaasbackend_tests",
  consoleOut: true,
  minLogLevel: ELOGLEVELS.DEBUG,
  logFilePath: "."
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
    delete from warehouse.analysis_tasks;
    delete from warehouse.properties;
    delete from sunnsaas.analysis;
    delete from sunnsaas.project;
    delete from users.sunnsaas_user where sunnsaas_user_id <> 'app';
    delete from users.sunnsaas_user_role where sunnsaas_user_role_id <> 'app';
  `)
  .pipe(

    rxo.concatMap((o: QueryResult) => redis.flushall$()),

    rxo.map((o: string) => o === "OK" ? true : false)

  );

/**
 *
 * ReWhitt client.
 *
 */
export const client: Client = new Client({
  name: "rewhitt_test",
  pg: pg,
  redis: redis
})
