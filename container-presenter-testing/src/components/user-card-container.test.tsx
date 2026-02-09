import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserCardContainer } from "./user-card-container";

/**
 * ============================================================
 * Containerのテスト — ロジックだけを検証する
 * ============================================================
 *
 * Containerはデータ取得・状態管理を担い、UIはPresenterに委譲する。
 * fetchUserをDIしているため、モックの差し替えが容易。
 *
 * ※ Presenterの見た目テストは presenter.test.tsx で完了済みなので、
 *   ここでは「データの流れ」と「状態遷移」だけに集中できる。
 */
describe("UserCardContainer", () => {
  it("取得成功: fetchUserの結果がPresenter経由で表示される", async () => {
    const fetchUser = vi
      .fn()
      .mockResolvedValue({ name: "田中太郎", email: "taro@example.com" });

    render(<UserCardContainer fetchUser={fetchUser} />);

    // 非同期でデータが反映される
    expect(await screen.findByText("田中太郎")).toBeInTheDocument();
    expect(screen.getByText("taro@example.com")).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledOnce();
  });

  it("取得失敗: エラーメッセージが表示される", async () => {
    const fetchUser = vi
      .fn()
      .mockRejectedValue(new Error("ネットワークエラー"));

    render(<UserCardContainer fetchUser={fetchUser} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ネットワークエラー",
    );
  });

  it("ローディング: 初期表示で読み込み中が表示される", () => {
    // resolveしないPromiseで永続的にloading状態を保持
    const fetchUser = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<UserCardContainer fetchUser={fetchUser} />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("再試行: エラー後に再試行ボタンで再取得できる", async () => {
    const fetchUser = vi
      .fn()
      .mockRejectedValueOnce(new Error("失敗"))
      .mockResolvedValue({ name: "田中太郎", email: "taro@example.com" });

    render(<UserCardContainer fetchUser={fetchUser} />);

    // エラー状態を待つ
    expect(await screen.findByRole("alert")).toHaveTextContent("失敗");

    // 再試行
    await userEvent.click(screen.getByRole("button", { name: "再試行" }));

    // 成功データが表示される
    expect(await screen.findByText("田中太郎")).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledTimes(2);
  });
});
