import * as chai from "chai";
import * as mocha from "mocha";
import Ankarton from "../dist/index";

const expect = chai.expect;

describe("AccountsGenerator", () => {

  it.skip("should create one account", (done) => {
    Ankarton.generate({}).then(() => { done(); });
  });
  it.skip("should create one account", (done) => {
    Ankarton.generate({
      output: (err: any, data: any) => {
        done();
      },
    }).then(() => {/**/});
  });

  it("should create one account", (done) => {
    Ankarton.generate({
      output: (err: any, data: any) => {
        console.log(data);
        done();
      },
      passwordGenerator: (guestLogin: string, guestPassword: string): string => {
        return "genpas246";
      },
      proxy: { host: "", port: 4201 },
    }).then(() => {/**/});
  });

});
