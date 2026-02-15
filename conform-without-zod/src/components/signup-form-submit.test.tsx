import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SignupForm } from "./signup-form";

describe("SignupForm - submitの挙動（Zodなし）", () => {
  it("必須フィールドが空のままsubmitしてもonSubmitが発火する", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: SubmitEvent) => {
      e.preventDefault();
    });

    const { container } = render(<SignupForm />);
    const form = container.querySelector("form")!;
    form.addEventListener("submit", handleSubmit as unknown as EventListener);

    // 何も入力せずsubmit
    await user.click(screen.getByText("登録"));

    console.log("=== onSubmit発火回数 ===", handleSubmit.mock.calls.length);
    console.log("=== noValidate属性 ===", form.hasAttribute("novalidate"));

    // noValidateがあるのでブラウザのバリデーションはスキップされ、submitが通る
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("constraintのrequiredがHTML属性としては存在する", () => {
    render(<SignupForm />);

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    // HTML属性としてはrequiredが付いている
    console.log("=== email required属性 ===", emailInput.hasAttribute("required"));
    console.log("=== password required属性 ===", passwordInput.hasAttribute("required"));
    console.log("=== email validity.valid (空) ===", (emailInput as HTMLInputElement).validity.valid);

    expect(emailInput).toHaveAttribute("required");
    // しかしnoValidateによりブラウザはチェックしない
  });
});
