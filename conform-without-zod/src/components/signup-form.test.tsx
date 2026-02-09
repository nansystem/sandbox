import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignupForm } from "./signup-form";

describe("SignupForm - a11y属性の自動生成", () => {
  it("getInputPropsがname, id, type, required属性を自動生成する", () => {
    render(<SignupForm />);

    const emailInput = screen.getByLabelText("メールアドレス");
    expect(emailInput).toHaveAttribute("name", "email");
    expect(emailInput).toHaveAttribute("id");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toBeRequired();

    const passwordInput = screen.getByLabelText("パスワード");
    expect(passwordInput).toHaveAttribute("name", "password");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute("minlength", "8");
  });

  it("getFormPropsがform要素にid, noValidateを設定する", () => {
    render(<SignupForm />);

    const form = document.querySelector("form")!;
    expect(form).toHaveAttribute("id", "signup");
    expect(form).toHaveAttribute("novalidate");
  });

  it("labelのhtmlForとinputのidが一致し、アクセシブルな紐づけになる", () => {
    render(<SignupForm />);

    // getByLabelTextが成功すること自体がlabel-input紐づけの証明
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    // idがformId-fieldName規則で生成されている
    expect(emailInput).toHaveAttribute("id", "signup-email");
    expect(passwordInput).toHaveAttribute("id", "signup-password");
  });

  it("getInputPropsがform属性を設定し、form要素との関連付けを行う", () => {
    render(<SignupForm />);

    const emailInput = screen.getByLabelText("メールアドレス");
    expect(emailInput).toHaveAttribute("form", "signup");

    const passwordInput = screen.getByLabelText("パスワード");
    expect(passwordInput).toHaveAttribute("form", "signup");
  });
});
