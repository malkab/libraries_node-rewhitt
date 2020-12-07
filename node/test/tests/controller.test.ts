import "mocha";

import { expect } from "chai";

import { clearDatabase$, redis, controller, client, generateTaskB, generateTaskA, pg } from "./common";

import { rxMochaTests } from "@malkab/ts-utils";

/**
 *
 * Clear the database.
 *
 */
describe("Clear the database", function() {

  rxMochaTests({

    testCaseName: "Clear the database",

    observables: [

      clearDatabase$,

      redis.flushall$()

    ],

    assertions: [

      (o: boolean) => expect(o, "clearDatabase$").to.be.true,

      (o: boolean) => expect(o, "flushall$").to.be.equal("OK")

    ],

    active: true

  })

})

/**
 *
 * Initialize Rewhitt.
 *
 */
describe("Initialize Rewhitt", function() {

  rxMochaTests({

    testCaseName: "Initialize Rewhitt",

    observables: [

      controller.init$()

    ],

    assertions: [

      (o: any) => expect(o, "Initialize Rewhitt").to.be.true

    ],

    verbose: false,

    active: true

  })

})

/**
 *
 * Error at initializing Rewhitt again.
 *
 */
describe("Error at initializing Rewhitt again", function() {

  rxMochaTests({

    testCaseName: "Error at initializing Rewhitt again",

    observables: [

      controller.init$()

    ],

    assertions: [

      (o: any) => expect(o.message, "Error at initializing Rewhitt again")
        .to.be.equal("rewhitt is already initialized")

    ],

    verbose: false,

    active: true

  })

})

/**
 *
 * Check first entry log.
 *
 */
describe("Check first entry log", function() {

  rxMochaTests({

    testCaseName: "Check first entry log",

    observables: [

      pg.executeParamQuery$(`select * from rewhitt_${controller.rewhittId}.log;`)

    ],

    assertions: [

      (o: any) => {

        expect(o.rows[0].agent, "Check agent")
          .to.be.equal("CONTROLLER::theController");

        expect(o.rows[0].log_type_id, "Check log type ID")
          .to.be.equal("INFO");

        expect(o.rows[0].status_id, "Check action_id")
          .to.be.equal("INIT");

      }

    ],

    verbose: false,

    active: true

  })

})

/**
 *
 * Post tasks.
 *
 */
describe("Post a task", function() {

  rxMochaTests({

    testCaseName: "Post a task",

    observables: [
      client.post$(...generateTaskA(2)),
      client.post$(...generateTaskA(2)),
      client.post$(...generateTaskB(2)),
      client.post$(...generateTaskB(2))
    ],

    assertions: [

      (o: any) => {
        expect(o, "1st POST taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "2nd POST taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 1st POST taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 2nd POST taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "1st POST taskB").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "2nd POST taskB").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 1st POST taskB").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 2nd POST taskB").to.be.greaterThan(0);
      }

    ],

    verbose: false,

    active: true

  })

})

/**
 *
 * Queue tasks.
 *
 */
describe("Queue a task", function() {

  rxMochaTests({

    testCaseName: "Queue a task",

    observables: [
      client.post$(...generateTaskA(2)),
      client.post$(...generateTaskA(2)),
      client.post$(...generateTaskB(2)),
      client.post$(...generateTaskB(2))
    ],

    assertions: [

      (o: any) => {
        expect(o, "1st QUEUE taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "2nd QUEUE taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 1st QUEUE taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 2nd QUEUE taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "1st QUEUE taskB").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "2nd QUEUE taskB").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 1st QUEUE taskB").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "Repeated 2nd QUEUE taskB").to.be.greaterThan(0);
      }

    ],

    verbose: false,

    active: true

  })

})

/**
 *
 * Start the controller command loop.
 *
 */
controller.startCommandLoop();
