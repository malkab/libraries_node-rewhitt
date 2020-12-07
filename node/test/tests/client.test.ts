import "mocha";

import { expect } from "chai";

import { clearDatabase$, redis, controller, client, generateTaskB, generateTaskA } from "./common";

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
