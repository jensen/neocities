/**
 * @vitest-environment node
 */

import type { SpyInstance } from "vitest";
import { vi } from "vitest";
import { loader, action } from "~/routes/$hood/$address/$page/";

import { getSession, commitSession } from "~/services/session.server";

import { getOwnedAddress, getAddress } from "~/services/db.server";
import storage from "~/services/storage.server";

const dbMock = {
  getAddress: getAddress as unknown as SpyInstance,
  getOwnedAddress: getOwnedAddress as unknown as SpyInstance,
};

const storageMock = {
  download: storage.download as unknown as SpyInstance,
  upload: storage.upload as unknown as SpyInstance,
  list: storage.list as unknown as SpyInstance,
};

describe("/$hood/$address/$page", () => {
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

    describe("user is logged in", () => {
      let cookie: string;

      beforeEach(async () => {
        const session = await getSession();
        session.set("user_id", 1);
        cookie = await commitSession(session);
      });

      vi.mock("~/services/db.server.ts", () => ({
        getAddress: vi.fn(),
        getOwnedAddress: vi.fn(),
      }));

      it("throws a 403 response when the user does not own the address", async () => {
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

      it("throws a 400 response when the file name is taken", async () => {
        dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
        storageMock.list.mockResolvedValueOnce(["index.html"]);

        const formData = new FormData();

        formData.append("filename", "index");

        const request = new Request("/Page/1000/index.html/edit", {
          method: "post",
          headers: { cookie },
          body: formData,
        });

        await expect(() =>
          action({
            request,
            params: { hood: "Page", address: "1000", page: "index.html" },
            context: {},
          })
        ).toThrowResponse(400, "File is duplicate.");
      });

      it("throws a 500 response when the file upload fails", async () => {
        dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
        storageMock.list.mockResolvedValueOnce([]);
        storageMock.upload.mockRejectedValueOnce(undefined);

        const formData = new FormData();

        formData.append("filename", "index");

        const request = new Request("/Page/1000/index.html/edit", {
          method: "post",
          headers: { cookie },
          body: formData,
        });

        await expect(() =>
          action({
            request,
            params: { hood: "Page", address: "1000", page: "index.html" },
            context: {},
          })
        ).toThrowResponse(500);
      });

      it("redirects the user to the edit page if successful", async () => {
        dbMock.getOwnedAddress.mockResolvedValueOnce({ id: "abc-123" });
        storageMock.list.mockResolvedValueOnce([]);
        storageMock.upload.mockResolvedValueOnce(undefined);

        const formData = new FormData();

        formData.append("filename", "index");

        const request = new Request("/Page/1000/index.html/edit", {
          method: "post",
          headers: { cookie },
          body: formData,
        });

        const response = await action({
          request,
          params: { hood: "Page", address: "1000", page: "index.html" },
          context: {},
        });

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe(
          "/Page/1000/index.html/edit"
        );
      });
    });
  });

  describe(":loader", () => {
    it("redirects to the claim page if address not claimed", async () => {
      dbMock.getAddress.mockResolvedValueOnce({ id: "abc-123", owner: null });

      const request = new Request("/Page/1000/index.html");

      const response = await loader({
        request,
        params: {
          hood: "Page",
          address: "1000",
          page: "index.html",
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

      const request = new Request("https://host/Page/1000/index.html");

      const response = await loader({
        request,
        params: {
          hood: "Page",
          address: "1000",
          page: "index.html",
        },
        context: {},
      });

      const body = await response.text();

      expect(response.status).toBe(200);
      expect(body).toBe("<h1>Header</h1>");
    });
  });
});
