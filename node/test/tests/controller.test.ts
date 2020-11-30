import "mocha";

import { expect } from "chai";

import { clearDatabase$, pg, redis, controller, taskA } from "./common";

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

      clearDatabase$

    ],

    assertions: [

      (o: boolean) => expect(o, "clearDatabase$").to.be.true

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

    verbose: false

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

      pg.executeParamQuery$(`select * from rewhitt_${controller.name}.log;`)

    ],

    assertions: [

      (o: any) => {

        expect(o.rows[0].agent, "Check client")
          .to.be.equal("CLIENT");

        expect(o.rows[0].agent, "Check agent")
          .to.be.equal("CLIENT");

        expect(o.rows[0].action_id, "Check action_id")
          .to.be.equal("INIT");

      }

    ],

    verbose: false

  })

})
