import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserCardPresenter } from "./user-card-presenter";

/**
 * ============================================================
 * Presenterのテスト — Container/Presenterパターン最大のメリット
 * ============================================================
 *
 * メリット1: 非同期処理・モックなしでUIの全状態を検証できる
 *   → propsを変えるだけで loading / error / success を即座にテスト
 *
 * メリット2: テストが高速で壊れにくい
 *   → API・状態管理の実装に依存しないため、リファクタ耐性が高い
 *
 * メリット3: 再利用性の証明
 *   → 同じPresenterに異なるデータを渡すだけで別の文脈で使える
 */
describe("UserCardPresenter", () => {
  // ─── メリット1: propsだけで全UI状態を網羅 ───

  it("成功状態: 名前とメールが表示される", () => {
    render(
      <UserCardPresenter
        name="田中太郎"
        email="taro@example.com"
        isLoading={false}
        error={null}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText("田中太郎")).toBeInTheDocument();
    expect(screen.getByText("taro@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
  });

  it("ローディング状態: 読み込み中が表示される", () => {
    render(
      <UserCardPresenter
        name=""
        email=""
        isLoading={true}
        error={null}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    // 名前やメールは表示されない
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("エラー状態: エラーメッセージと再試行ボタンが表示される", () => {
    render(
      <UserCardPresenter
        name=""
        email=""
        isLoading={false}
        error="サーバーに接続できません"
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "サーバーに接続できません",
    );
    expect(
      screen.getByRole("button", { name: "再試行" }),
    ).toBeInTheDocument();
  });

  // ─── メリット2: コールバックのテストもシンプル ───

  it("更新ボタンクリックでonRefreshが呼ばれる", async () => {
    const onRefresh = vi.fn();

    render(
      <UserCardPresenter
        name="田中太郎"
        email="taro@example.com"
        isLoading={false}
        error={null}
        onRefresh={onRefresh}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("エラー時の再試行ボタンでonRefreshが呼ばれる", async () => {
    const onRefresh = vi.fn();

    render(
      <UserCardPresenter
        name=""
        email=""
        isLoading={false}
        error="エラー発生"
        onRefresh={onRefresh}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "再試行" }));

    expect(onRefresh).toHaveBeenCalledOnce();
  });

  // ─── メリット3: 再利用性 — 異なるデータでも同じPresenterが使える ───

  it("別のユーザーデータでも正しく表示できる（再利用性）", () => {
    render(
      <UserCardPresenter
        name="佐藤花子"
        email="hanako@example.com"
        isLoading={false}
        error={null}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText("佐藤花子")).toBeInTheDocument();
    expect(screen.getByText("hanako@example.com")).toBeInTheDocument();
  });
});
