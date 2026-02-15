import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileForm } from "./form-metadata";

describe("Conformのuncontrolledパターンを検証", () => {
  it("getInputPropsはvalueではなくdefaultValueを返す", () => {
    render(<ProfileForm />);

    const usernameInput = screen.getByLabelText("ユーザー名") as HTMLInputElement;

    // defaultValueが設定されている
    console.log("=== defaultValue ===", usernameInput.defaultValue);
    expect(usernameInput.defaultValue).toBe("ゲスト");

    // React DevToolsで見るとvalueプロパティ（controlled）ではない
    // HTMLのvalue属性が存在しないことを確認
    console.log("=== value属性(HTML) ===", usernameInput.getAttribute("value"));
    console.log("=== defaultValue属性(HTML) ===", usernameInput.getAttribute("defaultvalue"));
  });

  it("入力してもReactの再レンダリングが走らない", async () => {
    const user = userEvent.setup();
    const renderCount = vi.fn();

    // ProfileFormの外でレンダリング回数を数えるラッパー
    function Wrapper() {
      renderCount();
      return <ProfileForm />;
    }

    render(<Wrapper />);

    // 初回レンダリング
    console.log("=== 初回レンダリング回数 ===", renderCount.mock.calls.length);
    const initialRenderCount = renderCount.mock.calls.length;

    // ユーザーが入力
    const usernameInput = screen.getByLabelText("ユーザー名");
    await user.clear(usernameInput);
    await user.type(usernameInput, "太郎");

    console.log("=== 入力後レンダリング回数 ===", renderCount.mock.calls.length);
    console.log("=== 入力後のDOM値 ===", (usernameInput as HTMLInputElement).value);

    // uncontrolledなので親コンポーネントの再レンダリングは増えない
    expect(renderCount.mock.calls.length).toBe(initialRenderCount);
    // しかしDOMの値は更新されている
    expect(usernameInput).toHaveValue("太郎");
  });
});
