import { installGlobals } from "@remix-run/node/globals";
import "@testing-library/jest-dom/extend-expect";
import "dotenv/config";

installGlobals();

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

expect.extend({
  async toThrowResponse(received, status, message) {
    try {
      await received();

      return {
        message: () => `expected response to be thrown`,
        pass: false,
      };
    } catch (response: any) {
      if (response instanceof Response === false) {
        return {
          message: () => `expected response to be thrown`,
          pass: false,
        };
      }

      const body = await response.text();

      if (message !== undefined && body !== message) {
        return {
          message: () =>
            `expected response to be thrown with message ${
              message === "" ? '""' : message
            } received ${body}`,
          pass: false,
        };
      }

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
