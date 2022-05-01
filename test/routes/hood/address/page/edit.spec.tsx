/**
 * @vitest-environment node
 */

import type { SpyInstance } from "vitest";
import { vi } from "vitest";
import { loader, action } from "~/routes/$hood/$address/$page/edit";

import { getSession, commitSession } from "~/services/session.server";

import { getOwnedAddress } from "~/services/db.server";
import storage from "~/services/storage.server";

const dbMock = {
  getOwnedAddress: getOwnedAddress as unknown as SpyInstance,
};

const storageMock = {
  download: storage.download as unknown as SpyInstance,
  upload: storage.upload as unknown as SpyInstance,
  list: storage.list as unknown as SpyInstance,
};

describe("/$hood/$address/$page/edit", () => {
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
      download: vi.fn(),
      upload: vi.fn(),
      list: vi.fn(),
    },
  }));

  describe(":action", () => {
    it("throws a 401 response when the user has not logged in", async () => {
      const request = new Request("/Page/1000/index.html/edit", {
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

    it("throws a 403 response when the user has logged in but does not own the page", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce(undefined);

      const request = new Request("/Page/1000/index.html/edit", {
        method: "post",
        headers: { cookie },
      });

      await expect(() =>
        action({
          request,
          params: { hood: "Page", address: "1000", page: "index.html" },
          context: {},
        })
      ).toThrowResponse(403);
    });

    it("throws a 500 response when the upload is not successful", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
      storageMock.upload.mockRejectedValueOnce(undefined);

      const body = new FormData();
      body.set("content", "<h1>Header</h1>");

      const request = new Request("/Page/1000/index.html/edit", {
        method: "post",
        headers: { cookie },
        body,
      });

      await expect(() =>
        action({
          request,
          params: { hood: "Page", address: "1000", page: "index.html" },
          context: {},
        })
      ).toThrowResponse(500);
    });

    describe("redirects the user when they update the content", () => {
      let body: FormData;

      beforeEach(() => {
        dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
        storageMock.upload.mockResolvedValueOnce(undefined);

        body = new FormData();
        body.set("content", "<h1>Header</h1>");
      });

      it("sends a location of the address root path if index.html", async () => {
        const request = new Request("/Page/1000/index.html/edit", {
          method: "post",
          headers: { cookie },
          body,
        });

        const response = await action({
          request,
          params: {
            hood: "Page",
            address: "1000",
            page: "index.html",
          },
          context: {},
        });

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe("/Page/1000/");
      });

      it("sends a location of the address root with filename for all non index.html", async () => {
        const request = new Request("/Page/1000/about.html/edit", {
          method: "post",
          headers: { cookie },
          body,
        });

        const response = await action({
          request,
          params: {
            hood: "Page",
            address: "1000",
            page: "about.html",
          },
          context: {},
        });

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe("/Page/1000/about.html");
      });
    });
  });

  describe(":loader", () => {
    it("throws a 401 response when the user has not logged in", async () => {
      const request = new Request("/Page/1000/index.html/edit", {
        method: "get",
      });

      await expect(() =>
        loader({
          request,
          params: {},
          context: {},
        })
      ).toThrowResponse(401);
    });

    it("throws a 403 response when the user has logged in but does not own the page", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce(undefined);

      const request = new Request("/Page/1000/index.html/edit", {
        method: "get",
        headers: { cookie },
      });

      await expect(() =>
        loader({
          request,
          params: {
            hood: "Page",
            address: "1000",
          },
          context: {},
        })
      ).toThrowResponse(403);
    });

    it("returns a 200 response when the user owns the page", async () => {
      dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
      storageMock.download.mockResolvedValueOnce(
        new ReadableStream({
          start(controller) {
            controller.enqueue(Buffer.from("<h1>Header</h1>", "utf-8"));
            controller.close();
          },
        })
      );
      storageMock.list.mockResolvedValueOnce(["index.html"]);

      const request = new Request("/Page/1000/index.html/edit", {
        method: "get",
        headers: { cookie },
      });

      const response = await loader({
        request,
        params: {
          hood: "Page",
          address: "1000",
          page: "index.html",
        },
        context: {},
      });

      expect(storage.download).toHaveBeenCalledWith("abc-123/index.html");
      expect(storage.list).toHaveBeenCalledWith("abc-123");

      expect(response.content).toBe("<h1>Header</h1>");
      expect(response.files[0]).toBe("index.html");
    });
  });
});
