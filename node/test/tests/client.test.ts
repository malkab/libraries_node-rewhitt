import "mocha";

import { expect } from "chai";

import { clearDatabase$, pg, redis, controller, client, taskA } from "./common";

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

    verbose: false

  })

})

/**
 *
 * Post a task.
 *
 */
describe("Post a task", function() {

  rxMochaTests({

    testCaseName: "Post a task",

    observables: [
      client.post$(taskA),
      client.post$(taskA)
    ],

    assertions: [

      (o: any) => {
        console.log("D: jeje", o);
      },

      (o: any) => {
        console.log("D: jeje", o);
      }

    ],

    verbose: true

  })

})

/**
 *
 * Queue a task.
 *
 */
describe("Queue a task", function() {

  rxMochaTests({

    testCaseName: "Queue a task",

    observables: [
      client.queue$(taskA)
    ],

    assertions: [

      (o: any) => {
        console.log("D: jeje", o);
      }

    ],

    verbose: true

  })

})
