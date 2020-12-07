import "mocha";

import { expect } from "chai";

import { clearDatabase$, pg, redis, controller, client, generateTaskA, generateTaskB, workerA, workerB } from "./common";

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

    ]

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
 * Registering the workers.
 *
 */
describe("Registering workers", function() {

  rxMochaTests({

    testCaseName: "Registering workers",

    observables: [

      workerA.register$(),

      workerB.register$()

    ],

    verbose: false

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
      client.queue$(...generateTaskA(2)),
      client.queue$(...generateTaskA(2)),
      client.queue$(...generateTaskB(2)),
      client.queue$(...generateTaskB(2))
    ],

    assertions: [

      (o: any) => {
        expect(o, "1st QUEUE taskA").to.be.greaterThan(0);
      },

      (o: any) => {
        expect(o, "2nd QUEUE taskA").to.be.greaterThan(0)
      },

      (o: any) => {
        expect(o, "3rd QUEUE taskA").to.be.greaterThan(0)
      },

      (o: any) => {
        expect(o, "1st QUEUE taskB").to.be.greaterThan(0)
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

/**
 *
 * Start the worker command loop after 2 sec.
 *
 */
setTimeout(() => workerA.startCommandLoop(), 2000);
setTimeout(() => workerB.startCommandLoop(), 1000);
