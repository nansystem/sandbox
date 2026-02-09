import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SubmissionResult } from "@conform-to/dom";
import { ContactForm } from "./error-structure";

describe("ContactForm - エラーの置き場所の思想", () => {
  it("lastResultのフィールドエラーが各フィールドに表示される", () => {
    const lastResult: SubmissionResult<string[]> = {
      status: "error",
      initialValue: { name: "太郎", email: "invalid", message: "" },
      error: {
        email: ["メールアドレスの形式が正しくありません"],
        message: ["メッセージは10文字以上必要です"],
      },
    };

    render(<ContactForm lastResult={lastResult} />);

    expect(
      screen.getByText("メールアドレスの形式が正しくありません")
    ).toBeInTheDocument();
    expect(
      screen.getByText("メッセージは10文字以上必要です")
    ).toBeInTheDocument();
  });

  it("フォームレベルエラーがフィールドエラーと分離して表示される", () => {
    const lastResult: SubmissionResult<string[]> = {
      status: "error",
      initialValue: {
        name: "太郎",
        email: "taro@example.com",
        message: "こんにちは、お世話になっております",
      },
      error: {
        "": ["送信に失敗しました。時間をおいて再度お試しください"],
      },
    };

    render(<ContactForm lastResult={lastResult} />);

    expect(
      screen.getByText("送信に失敗しました。時間をおいて再度お試しください")
    ).toBeInTheDocument();
  });

  it("フィールドエラーとフォームエラーが同時に存在できる", () => {
    const lastResult: SubmissionResult<string[]> = {
      status: "error",
      initialValue: { name: "", email: "", message: "" },
      error: {
        "": ["サーバーエラーが発生しました"],
        name: ["名前は必須です"],
        email: ["メールアドレスは必須です"],
      },
    };

    render(<ContactForm lastResult={lastResult} />);

    // フォームレベルエラー
    expect(
      screen.getByText("サーバーエラーが発生しました")
    ).toBeInTheDocument();
    // フィールドレベルエラー
    expect(screen.getByText("名前は必須です")).toBeInTheDocument();
    expect(screen.getByText("メールアドレスは必須です")).toBeInTheDocument();
  });

  it("エラーがある場合aria-invalidがtrueになる", () => {
    const lastResult: SubmissionResult<string[]> = {
      status: "error",
      initialValue: { name: "太郎", email: "", message: "" },
      error: {
        email: ["メールアドレスは必須です"],
      },
    };

    render(<ContactForm lastResult={lastResult} />);

    const emailInput = screen.getByLabelText("メールアドレス");
    expect(emailInput).toHaveAttribute("aria-invalid", "true");

    // エラーのないフィールドにはaria-invalid="true"がない
    const nameInput = screen.getByLabelText("名前");
    expect(nameInput).not.toHaveAttribute("aria-invalid", "true");
  });

  it("aria-describedbyがerrorIdを含み、エラーメッセージと紐づく", () => {
    const lastResult: SubmissionResult<string[]> = {
      status: "error",
      initialValue: { name: "", email: "", message: "" },
      error: {
        email: ["メールアドレスは必須です"],
      },
    };

    render(<ContactForm lastResult={lastResult} />);

    const emailInput = screen.getByLabelText("メールアドレス");
    const ariaDescribedBy = emailInput.getAttribute("aria-describedby");
    expect(ariaDescribedBy).toBeTruthy();

    // aria-describedbyで参照されるエラー要素が存在する
    const errorElement = document.getElementById(
      ariaDescribedBy!.split(" ")[0]
    );
    expect(errorElement).not.toBeNull();
  });

  it("エラーなしの場合、エラー要素が表示されない", () => {
    render(<ContactForm />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
