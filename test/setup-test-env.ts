import { installGlobals } from "@remix-run/node/globals";
import "@testing-library/jest-dom/extend-expect";
import "dotenv/config";

installGlobals();

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
