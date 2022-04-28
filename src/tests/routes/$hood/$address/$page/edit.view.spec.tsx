/**
 * @vitest-environment happy-dom
 */

import type { FormProps, LinkProps } from "@remix-run/react";
import type { SpyInstance } from "vitest";
import { vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import View from "~/routes/$hood/$address/$page/edit";
import { useParams, useLoaderData } from "@remix-run/react";

const useParamsMock = useParams as unknown as SpyInstance;
const useLoaderDataMock = useLoaderData as unknown as SpyInstance;

describe("View", () => {
  vi.mock("@remix-run/react", () => {
    return {
      Form: React.forwardRef<HTMLFormElement>(
        ({ reloadDocument, replace, ...props }: FormProps, ref) => (
          <form ref={ref} {...props} />
        )
      ),
      Link: ({ children, ...props }: LinkProps) => <a {...props}>{children}</a>,
      useLoaderData: vi.fn(),
      useParams: vi.fn(),
      useTransition: () => ({ state: "idle", type: "idle" }),
    };
  });

  it("renders", () => {
    useParamsMock.mockImplementation(() => ({
      hood: "Page",
      address: "1000",
    }));
    useLoaderDataMock.mockImplementation(() => ({
      content: "<h1>Header</h1>",
      files: ["index.html"],
    }));

    const { getByText } = render(<View />);

    expect(getByText("index.html")).toBeInTheDocument();
  });
});
