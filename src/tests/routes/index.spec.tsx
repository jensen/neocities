/**
 * @vitest-environment node
 */

import type { SpyInstance } from "vitest";
import { vi } from "vitest";
import { loader } from "../../routes/";

import db from "../../services/db.server";

const dbMock = db as unknown as SpyInstance;

describe("/", () => {
  vi.mock("../../services/db.server.ts", () => ({
    default: vi.fn(),
  }));

  describe(":loader", () => {
    it("returns 200 with ", async () => {
      dbMock.mockResolvedValueOnce([
        { name: "Neighbourhood", description: "Description" },
      ]);

      const request = new Request("/", {
        method: "get",
      });

      const response = await loader({
        request,
        params: {},
        context: {},
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.hoods.length).toBe(1);
      expect(body.hoods[0].name).toBe("Neighbourhood");
      expect(body.hoods[0].description).toBe("Description");
    });
  });
});
