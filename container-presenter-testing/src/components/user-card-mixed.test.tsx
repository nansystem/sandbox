import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserCardMixed } from "./user-card-mixed";
import { UserCardPresenter } from "./user-card-presenter";

/**
 * ============================================================
 * Mixed vs Container/Presenter — テスタビリティの比較
 * ============================================================
 *
 * このテストファイルでは、ロジックとUIが混在したコンポーネント(Mixed)と
 * 分離されたPresenterを並べて、テストのしやすさの違いを示す。
 */

describe("Mixed: ロジックとUIが混在したコンポーネントの課題", () => {
  /**
   * 課題1: UIの状態テストに必ず非同期処理が必要
   *
   * 「エラー画面を見たいだけ」でも、fetchUserのモック→非同期待機が必要。
   * Presenterなら props で error を渡すだけで同期的にテストできる。
   */
  it("エラー状態を検証するのに非同期処理が必要", async () => {
    const fetchUser = vi
      .fn()
      .mockRejectedValue(new Error("サーバーエラー"));

    render(<UserCardMixed fetchUser={fetchUser} />);

    // findBy（非同期）で待つ必要がある
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("サーバーエラー");
  });

  /**
   * 課題2: ローディング状態のテストが不安定になりやすい
   *
   * Promiseのタイミングに依存するため、テストが壊れやすい。
   * Presenterなら isLoading={true} を渡すだけ。
   */
  it("ローディング状態のテストにPendingなPromiseが必要", () => {
    const fetchUser = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<UserCardMixed fetchUser={fetchUser} />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});

describe("Presenter: 同じUI検証をモックなし・同期的に実行", () => {
  /**
   * 上記と同じUI検証だが、Presenterならモックも非同期も不要
   */
  it("エラー状態 → propsを渡すだけ（モック不要・同期的）", () => {
    render(
      <UserCardPresenter
        name=""
        email=""
        isLoading={false}
        error="サーバーエラー"
        onRefresh={() => {}}
      />,
    );

    // findByではなくgetBy（同期）で即座に検証できる
    expect(screen.getByRole("alert")).toHaveTextContent("サーバーエラー");
  });

  it("ローディング状態 → propsを渡すだけ（モック不要・同期的）", () => {
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
  });

  it("成功状態 → propsを渡すだけ（モック不要・同期的）", () => {
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
  });
});
