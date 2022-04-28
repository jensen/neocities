/**
 * @vitest-environment node
 */

import type { SpyInstance } from "vitest";
import { vi } from "vitest";

import { action } from "~/routes/$hood/$address/claim";
import { getSession, commitSession } from "~/services/session.server";

import db from "~/services/db.server";
import storage from "~/services/storage.server";

const dbMock = db as unknown as SpyInstance;
const storageMock = {
  upload: storage.upload as unknown as SpyInstance,
};

describe("/$hood/$address/claim", () => {
  describe(":action", () => {
    it("throws a 401 response when the user has not logged in", async () => {
      const request = new Request("/Page/1000/claim", {
        method: "post",
      });

      expect(() =>
        action({
          request,
          params: {},
          context: {},
        })
      ).toThrowResponse(401);
    });

    describe("user is logged in", () => {
      let cookie: string;

      beforeEach(async () => {
        const session = await getSession();
        session.set("user_id", 1);
        cookie = await commitSession(session);
      });

      vi.mock("~/services/db.server.ts", () => ({
        default: vi.fn(),
      }));

      vi.mock("~/services/storage.server.ts", () => ({
        default: {
          upload: vi.fn(),
        },
      }));

      it("throws a 403 response when the address is already owned", async () => {
        dbMock.mockResolvedValueOnce([]);

        const request = new Request("/Page/1000/claim", {
          method: "post",
          headers: {
            Cookie: cookie,
          },
        });

        expect(() =>
          action({
            request,
            params: {},
            context: {},
          })
        ).toThrowResponse(403);
      });

      it("throws a 500 response when the page upload fails", async () => {
        dbMock.mockResolvedValueOnce([{ id: "abc-123" }]);
        storageMock.upload.mockRejectedValueOnce(undefined);

        const request = new Request("/Page/1000/claim", {
          method: "post",
          headers: {
            Cookie: cookie,
          },
        });

        expect(() =>
          action({
            request,
            params: {},
            context: {},
          })
        ).toThrowResponse(500);
      });

      it("it redirects on successful upload", async () => {
        dbMock.mockResolvedValueOnce([{ id: "abc-123" }]);
        storageMock.upload.mockResolvedValueOnce(undefined);

        const request = new Request("/Page/1000/claim", {
          method: "post",
          headers: {
            Cookie: cookie,
          },
        });

        const response = await action({
          request,
          params: {
            hood: "Page",
            address: "1000",
          },
          context: {},
        });

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe("/Page/1000/");
      });
    });
  });
});
