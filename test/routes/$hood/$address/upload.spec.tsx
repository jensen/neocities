/**
 * @vitest-environment node
 */

import type { SpyInstance } from "vitest";
import { vi } from "vitest";
import { Readable } from "stream";
import { action } from "~/routes/$hood/$address/upload";
import { getSession, commitSession } from "~/services/session.server";

import db from "~/services/db.server";
import storage from "~/services/storage.server";

const dbMock = db as unknown as SpyInstance;
const storageMock = {
  stream: storage.stream as unknown as SpyInstance,
};

describe("/$hood/$address/upload", () => {
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
      stream: vi.fn(),
    },
  }));

  describe(":action", () => {
    it("throws a 401 response when the user has not logged in", async () => {
      const request = new Request("/Page/1000/upload", {
        method: "post",
      });

      try {
        await action({
          request,
          params: {},
          context: {},
        });
      } catch (response: any) {
        expect(response.status).toBe(401);
      }
    });

    it("throws a 403 response when the user has logged in but does not own the page", async () => {
      dbMock.mockResolvedValueOnce([]);

      const request = new Request("/Page/1000/upload", {
        method: "post",
        headers: {
          Cookie: cookie,
        },
      });

      try {
        await action({
          request,
          params: {},
          context: {},
        });
      } catch (response: any) {
        expect(response.status).toBe(403);
      }
    });

    it("redirects the user when they upload content", async () => {
      dbMock.mockResolvedValueOnce([{ id: "abc-123" }]);
      storageMock.stream.mockResolvedValueOnce(undefined);

      const formData = new FormData();

      formData.append(
        "files",
        new Blob(["<h1>Upload Test</h1>"], {
          type: "text/html",
        }),
        "index.html"
      );

      const request = new Request("/Page/1000/upload", {
        method: "post",
        body: formData,
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

      expect(storageMock.stream).toBeCalledTimes(1);
      expect(storageMock.stream.calls[0][0]).toBe("abc-123/index.html");
      expect(storageMock.stream.calls[0][1]).toBeInstanceOf(Readable);

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/Page/1000/");
    });

    it("throws a 400 response when the files are not named correctly", async () => {
      dbMock.mockResolvedValueOnce([{ id: "abc-123" }]);
      storageMock.stream.mockResolvedValueOnce(undefined);

      const formData = new FormData();

      formData.append(
        "notfiles",
        new Blob(["<h1>Upload Test</h1>"], {
          type: "text/html",
        }),
        "index.html"
      );

      const request = new Request("/Page/1000/upload", {
        method: "post",
        body: formData,
        headers: {
          Cookie: cookie,
        },
      });

      try {
        await action({
          request,
          params: {
            hood: "Page",
            address: "1000",
          },
          context: {},
        });
        throw new Error();
      } catch (response: any) {
        expect(response.status).toBe(400);
      }
    });

    it("throws a 400 response when the files are not of the correct type", async () => {
      dbMock.mockResolvedValueOnce([{ id: "abc-123" }]);
      storageMock.stream.mockResolvedValueOnce(undefined);

      const formData = new FormData();

      formData.append(
        "files",
        new File(["<h1>Upload Test</h1>"], "index.html", {
          type: "html/text",
        })
      );

      const request = new Request("/Page/1000/upload", {
        method: "post",
        body: formData,
        headers: {
          Cookie: cookie,
        },
      });

      try {
        await action({
          request,
          params: {
            hood: "Page",
            address: "1000",
          },
          context: {},
        });
        throw new Error();
      } catch (response: any) {
        expect(response.status).toBe(400);
      }
    });
  });
});
