import "mocha";

import "webpack";

console.log(`

--------------------------

Mocha testing

--------------------------

`);

// Add test suites here
describe("TESTS", () => {
  describe("\n\n  --- a.test ---\n", () => require("./tests/a.test"));
  describe("\n\n  --- b.test ---\n", () => require("./tests/b.test"));
});
