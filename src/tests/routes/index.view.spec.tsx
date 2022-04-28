/**
 * @vitest-environment happy-dom
 */

import type { SpyInstance } from "vitest";
import type { FormProps, LinkProps } from "@remix-run/react";
import { vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import View from "../../routes/";
import { useLoaderData } from "@remix-run/react";

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
    };
  });

  it("renders", () => {
    useLoaderDataMock.mockImplementation(() => ({
      hoods: [
        {
          name: "First Neighbourhood",
          description: "The first neighbourhood in the list.",
        },
        {
          name: "Second Neighbourhood",
          description: "The second neighbourhood in the list.",
        },
      ],
    }));

    const { getByText } = render(<View />);

    expect(getByText("First Neighbourhood")).toBeInTheDocument();
    expect(getByText("Second Neighbourhood")).toBeInTheDocument();
  });
});
