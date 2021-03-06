/**
 * @vitest-environment node
 */

import type { SpyInstance } from "vitest";
import { vi } from "vitest";
import { Readable } from "stream";
import { action } from "~/routes/$hood/$address/upload";
import { getSession, commitSession } from "~/services/session.server";

import { getOwnedAddress } from "~/services/db.server";
import storage from "~/services/storage.server";

const dbMock = {
  getOwnedAddress: getOwnedAddress as unknown as SpyInstance,
};

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
    getOwnedAddress: vi.fn(),
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

      await expect(() =>
        action({
          request,
          params: {},
          context: {},
        })
      ).toThrowResponse(401);
    });

    it("throws a 400 if the hood is not defined", async () => {
      const request = new Request("/Page/1000/upload", {
        method: "post",
        headers: {
          Cookie: cookie,
        },
      });

      await expect(() =>
        action({
          request,
          params: {
            hood: "",
            address: "1000",
          },
          context: {},
        })
      ).toThrowResponse(400, "Must provide 'hood' param.");
    });

    it("throws a 400 if the hood is not defined", async () => {
      const request = new Request("/Page/1000/upload", {
        method: "post",
        headers: {
          Cookie: cookie,
        },
      });

      await expect(() =>
        action({
          request,
          params: {
            hood: "Page",
            address: "",
          },
          context: {},
        })
      ).toThrowResponse(400, "Must provide 'address' param.");
    });

    it("throws a 403 response when the user has logged in but does not own the page", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce(undefined);

      const request = new Request("/Page/1000/upload", {
        method: "post",
        headers: {
          Cookie: cookie,
        },
      });

      await expect(() =>
        action({
          request,
          params: {
            hood: "Page",
            address: "1000",
          },
          context: {},
        })
      ).toThrowResponse(403);
    });

    it("redirects the user when they upload content", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
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
      expect(storageMock.stream).toBeCalledWith(
        "abc-123/index.html",
        expect.any(Readable)
      );

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/Page/1000/");
    });

    it("throws a 400 response when the files are not named correctly", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
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

      await expect(() =>
        action({
          request,
          params: { hood: "Page", address: "1000" },
          context: {},
        })
      ).toThrowResponse(400, "Could not upload.");
    });

    it("throws a 400 response when the files are not of the correct type", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
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

      await expect(() =>
        action({
          request,
          params: { hood: "Page", address: "1000" },
          context: {},
        })
      ).toThrowResponse(400, "Could not upload.");
    });
  });
});
