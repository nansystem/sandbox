import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { ProductFilter } from "./product-filter";

describe("ProductFilter", () => {
  it("複数のパラメータを初期値から読み取れる", () => {
    render(<ProductFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?q=抹茶&category=gelato&page=2">
          {children}
        </NuqsTestingAdapter>
      ),
    });

    expect(screen.getByTestId("state")).toHaveTextContent("抹茶|gelato|2");
  });

  it("setFiltersで一部のパラメータだけ更新できる", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();

    render(<ProductFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter
          searchParams="?q=&category=gelato&page=2"
          onUrlUpdate={onUrlUpdate}
        >
          {children}
        </NuqsTestingAdapter>
      ),
    });

    await user.selectOptions(screen.getByTestId("category"), "sorbet");

    const lastCall = onUrlUpdate.mock.calls.at(-1)![0];
    expect(lastCall.searchParams.get("category")).toBe("sorbet");
    expect(lastCall.searchParams.get("page")).toBe("2");
    expect(lastCall.searchParams.get("q")).toBe("");
  });

  it("setFiltersで複数パラメータを同時に更新できる", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();

    render(<ProductFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter
          searchParams="?page=5"
          onUrlUpdate={onUrlUpdate}
        >
          {children}
        </NuqsTestingAdapter>
      ),
    });

    await user.click(screen.getByText("チョコで検索"));

    expect(screen.getByTestId("state")).toHaveTextContent("チョコ||1");

    const lastCall = onUrlUpdate.mock.calls.at(-1)![0];
    expect(lastCall.searchParams.get("q")).toBe("チョコ");
    // page=1はデフォルト値なのでURLから省略される
    expect(lastCall.searchParams.get("page")).toBeNull();
  });
});
