import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SubmissionResult } from "@conform-to/dom";
import { ProfileForm } from "./form-metadata";

describe("ProfileForm - フォーム状態管理の設計思想", () => {
  it("defaultValueが初期値としてinputに反映される（uncontrolled）", () => {
    render(<ProfileForm />);

    const usernameInput = screen.getByLabelText(
      "ユーザー名"
    ) as HTMLInputElement;
    // uncontrolled: defaultValueとして設定される（valueではない）
    expect(usernameInput).toHaveValue("ゲスト");
  });

  it("defaultValueが空文字のフィールドは空で表示される", () => {
    render(<ProfileForm />);

    const bioInput = screen.getByLabelText("自己紹介") as HTMLInputElement;
    expect(bioInput).toHaveValue("");
  });

  it("lastResultなしの場合、statusは未定義", () => {
    render(<ProfileForm />);

    expect(screen.getByTestId("form-status")).toHaveTextContent("未送信");
  });

  it("lastResultでstatus='success'の場合、成功状態が反映される", () => {
    const lastResult: SubmissionResult<string[]> = {
      status: "success",
      initialValue: { username: "太郎", bio: "こんにちは" },
    };

    render(<ProfileForm lastResult={lastResult} />);

    expect(screen.getByTestId("form-status")).toHaveTextContent("success");
  });

  it("lastResultでstatus='error'の場合、エラー状態が反映される", () => {
    const lastResult: SubmissionResult<string[]> = {
      status: "error",
      initialValue: { username: "", bio: "" },
      error: {
        username: ["ユーザー名は必須です"],
      },
    };

    render(<ProfileForm lastResult={lastResult} />);

    expect(screen.getByTestId("form-status")).toHaveTextContent("error");
  });

  it("noValidateがform要素に設定されブラウザ標準バリデーションが無効化される", () => {
    render(<ProfileForm />);

    const form = document.querySelector("form")!;
    expect(form).toHaveAttribute("novalidate");
  });

  it("getInputPropsがdefaultValueを返す（valueではない＝uncontrolled）", () => {
    render(<ProfileForm />);

    const usernameInput = screen.getByLabelText(
      "ユーザー名"
    ) as HTMLInputElement;

    // HTMLInputElementのdefaultValueプロパティで確認
    expect(usernameInput.defaultValue).toBe("ゲスト");
    // React uncontrolledパターン: DOMのvalue属性で管理
    expect(usernameInput.value).toBe("ゲスト");
  });
});
