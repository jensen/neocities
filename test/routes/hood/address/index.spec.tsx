/**
 * @vitest-environment node
 */

import type { SpyInstance } from "vitest";
import { vi } from "vitest";
import { loader } from "~/routes/$hood/$address";

import { getAddress } from "~/services/db.server";
import storage from "~/services/storage.server";

const dbMock = {
  getAddress: getAddress as unknown as SpyInstance,
};
const storageMock = {
  download: storage.download as unknown as SpyInstance,
};

describe("/$hood/$address/", () => {
  describe(":loader", () => {
    vi.mock("~/services/db.server", () => ({
      getAddress: vi.fn(),
    }));

    vi.mock("~/services/storage.server", () => ({
      default: {
        download: vi.fn(),
      },
    }));

    it("throws a 404 if the address is not a number", async () => {
      const request = new Request("/Page/Address");

      await expect(() =>
        loader({
          request,
          params: {
            hood: "Page",
            address: "Address",
          },
          context: {},
        })
      ).toThrowResponse(404);
    });

    it("throws a 404 if the address is not found", async () => {
      dbMock.getAddress.mockResolvedValueOnce(undefined);

      const request = new Request("/Page/1000");

      await expect(() =>
        loader({
          request,
          params: {
            hood: "Page",
            address: "1000",
          },
          context: {},
        })
      ).toThrowResponse(404);
    });

    it("redirects to the claim page if address not claimed", async () => {
      dbMock.getAddress.mockResolvedValueOnce({ id: "abc-123", owner: null });

      const request = new Request("/Page/1000");

      const response = await loader({
        request,
        params: {
          hood: "Page",
          address: "1000",
        },
        context: {},
      });

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/Page/1000/claim");
    });

    it("returns a 200 with the content from the storage download", async () => {
      dbMock.getAddress.mockResolvedValueOnce({
        id: "abc-123",
        owner: "xyz-789",
      });
      storageMock.download.mockResolvedValueOnce("<h1>Header</h1>");

      const request = new Request("/Page/1000");

      const response = await loader({
        request,
        params: {
          hood: "Page",
          address: "1000",
        },
        context: {},
      });

      const body = await response.text();

      expect(response.status).toBe(200);
      expect(body).toBe("<h1>Header</h1>");
    });
  });
});
