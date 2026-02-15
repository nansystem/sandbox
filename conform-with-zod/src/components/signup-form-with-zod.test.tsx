import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignupFormWithZod } from "./signup-form-with-zod";

describe("SignupFormWithZod - getZodConstraintでHTML制約属性を自動生成", () => {
  it("Zodスキーマからrequired, minlength等のHTML属性が自動生成される", () => {
    render(<SignupFormWithZod />);

    const emailInput = screen.getByLabelText("メールアドレス");
    expect(emailInput).toHaveAttribute("name", "email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toBeRequired();

    const passwordInput = screen.getByLabelText("パスワード");
    expect(passwordInput).toHaveAttribute("name", "password");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute("minlength", "8");
  });

  it("getFormPropsがform要素にid, noValidateを設定する", () => {
    render(<SignupFormWithZod />);

    const form = document.querySelector("form")!;
    expect(form).toHaveAttribute("id", "signup-zod");
    expect(form).toHaveAttribute("novalidate");
  });

  it("labelのhtmlForとinputのidが一致する", () => {
    render(<SignupFormWithZod />);

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    expect(emailInput).toHaveAttribute("id", "signup-zod-email");
    expect(passwordInput).toHaveAttribute("id", "signup-zod-password");
  });
});
