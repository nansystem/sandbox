import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { NameInput } from "./name-input";

describe("NameInput", () => {
  it("初期パラメータなしではデフォルト値が使われる", () => {
    render(<NameInput />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
      ),
    });

    expect(screen.getByText("こんにちは、ゲストさん")).toBeInTheDocument();
  });

  it("初期パラメータがあれば表示に反映される", () => {
    render(<NameInput />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?name=太郎">
          {children}
        </NuqsTestingAdapter>
      ),
    });

    expect(screen.getByText("こんにちは、太郎さん")).toBeInTheDocument();
  });

  it("入力するとURLパラメータが更新される", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();

    render(<NameInput />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      ),
    });

    await user.type(screen.getByPlaceholderText("名前を入力"), "花子");

    // 画面に反映される
    expect(screen.getByText("こんにちは、花子さん")).toBeInTheDocument();
    // URLも更新される（?name=花子）
    const { searchParams } = onUrlUpdate.mock.lastCall![0];
    expect(searchParams.get("name")).toBe("花子");
  });
});
