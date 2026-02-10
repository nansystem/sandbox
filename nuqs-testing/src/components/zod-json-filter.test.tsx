import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { ZodJsonFilter } from "./zod-json-filter";

describe("ZodJsonFilter", () => {
  it("filterパラメータがなければデフォルト値が使われる", () => {
    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
      ),
    });

    expect(screen.getByTestId("state")).toHaveTextContent("|all|1");
  });

  it("JSONエンコードされた初期値を読み取れる", () => {
    const initial = JSON.stringify({
      q: "抹茶",
      category: "gelato",
      page: 3,
    });

    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams={`?filter=${encodeURIComponent(initial)}`}>
          {children}
        </NuqsTestingAdapter>
      ),
    });

    expect(screen.getByTestId("state")).toHaveTextContent("抹茶|gelato|3");
  });

  it("Zodスキーマに合わないJSONはデフォルト値にフォールバックする", () => {
    // categoryに無効な値を入れる
    const invalid = JSON.stringify({
      q: "チョコ",
      category: "invalid_category",
      page: 1,
    });

    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams={`?filter=${encodeURIComponent(invalid)}`}>
          {children}
        </NuqsTestingAdapter>
      ),
    });

    // バリデーション失敗 → nullが返り、withDefaultでデフォルト値が使われる
    expect(screen.getByTestId("state")).toHaveTextContent("|all|1");
  });

  it("検索入力でqフィールドだけが更新される", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();

    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      ),
    });

    await user.type(screen.getByTestId("search"), "ピスタチオ");

    const lastCall = onUrlUpdate.mock.calls.at(-1)![0];
    const filterParam = lastCall.searchParams.get("filter");
    const parsed = JSON.parse(filterParam!);
    expect(parsed.q).toBe("ピスタチオ");
    expect(parsed.category).toBe("all");
    expect(parsed.page).toBe(1);
  });

  it("カテゴリ変更でcategoryフィールドだけが更新される", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();

    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      ),
    });

    await user.selectOptions(screen.getByTestId("category"), "sorbet");

    const lastCall = onUrlUpdate.mock.calls.at(-1)![0];
    const filterParam = lastCall.searchParams.get("filter");
    const parsed = JSON.parse(filterParam!);
    expect(parsed.category).toBe("sorbet");
    expect(parsed.q).toBe("");
    expect(parsed.page).toBe(1);
  });

  it("次のページボタンでpageがインクリメントされる", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();

    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      ),
    });

    await user.click(screen.getByText("次のページ"));

    expect(screen.getByTestId("state")).toHaveTextContent("|all|2");

    const lastCall = onUrlUpdate.mock.calls.at(-1)![0];
    const filterParam = lastCall.searchParams.get("filter");
    const parsed = JSON.parse(filterParam!);
    expect(parsed.page).toBe(2);
  });

  it("不正なJSON文字列はデフォルト値にフォールバックする", () => {
    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?filter=not-valid-json">
          {children}
        </NuqsTestingAdapter>
      ),
    });

    expect(screen.getByTestId("state")).toHaveTextContent("|all|1");
  });

  it("pageが負数のJSONはデフォルト値にフォールバックする", () => {
    const invalid = JSON.stringify({
      q: "チョコ",
      category: "gelato",
      page: -1,
    });

    render(<ZodJsonFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams={`?filter=${encodeURIComponent(invalid)}`}>
          {children}
        </NuqsTestingAdapter>
      ),
    });

    // page: -1 は z.number().int().positive() に違反 → デフォルト値
    expect(screen.getByTestId("state")).toHaveTextContent("|all|1");
  });
});
