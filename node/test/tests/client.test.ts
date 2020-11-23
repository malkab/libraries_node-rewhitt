import "mocha";

import { expect } from "chai";

import { clearDatabase$, pg, redis, client } from "./common";

import { rxMochaTests } from "@malkab/ts-utils";

/**
 *
 * Test description.
 *
 */
describe("Initialization from scratch", function() {

  rxMochaTests({

    testCaseName: "Initialization from scratch",

    observables: [

      client.init$()

    ],

    assertions: [

      (o: any) => console.log("D: jjeje", o)

    ],

    verbose: true

  })

});
