import "mocha";

import "webpack";

console.log(`

--------------------------

Mocha testing

--------------------------

`);

// Add test suites here
describe("rewhitt", () => {
  describe("\n\n  --- controller.test ---\n", () => require("./tests/controller.test"));
  describe("\n\n  --- client.test ---\n", () => require("./tests/client.test"));
});
