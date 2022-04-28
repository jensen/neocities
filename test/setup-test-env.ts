import { installGlobals } from "@remix-run/node/globals";
import "@testing-library/jest-dom/extend-expect";
import "dotenv/config";

installGlobals();

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

expect.extend({
  async toThrowResponse(received, status) {
    try {
      await received();

      return {
        message: () => `expected response to be thrown`,
        pass: false,
      };
    } catch (response: any) {
      if (response.status !== status) {
        return {
          message: () =>
            `expected response to be thrown with status ${status} received ${response.status}`,
          pass: false,
        };
      }
    }

    return {
      message: () => "Expected response not to be thrown",
      pass: true,
    };
  },
});
