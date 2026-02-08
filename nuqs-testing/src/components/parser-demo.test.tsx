import { render, screen } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import { ParserDemo } from "./parser-demo";

describe("parsers", () => {
  it("parseAsString — 文字列をそのまま扱う", () => {
    render(<ParserDemo />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?q=ジェラート">
          {children}
        </NuqsTestingAdapter>
      ),
    });

    expect(screen.getByTestId("q")).toHaveTextContent("ジェラート");
  });

  it("parseAsInteger — 文字列を整数に変換する", () => {
    render(<ParserDemo />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?page=3">
          {children}
        </NuqsTestingAdapter>
      ),
    });

    // page + 1 を表示しているので、numberなら4、stringなら"31"になる
    expect(screen.getByTestId("page")).toHaveTextContent("4");
  });

  it("parseAsBoolean — 文字列をbooleanに変換する", () => {
    render(<ParserDemo />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?active=true">
          {children}
        </NuqsTestingAdapter>
      ),
    });

    // active === true を表示しているので、booleanなら"true"、string "true"なら"false"になる
    expect(screen.getByTestId("active")).toHaveTextContent("true");
  });

  it("parseAsArrayOf — カンマ区切りを配列にする", () => {
    render(<ParserDemo />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?tags=チョコ,抹茶">
          {children}
        </NuqsTestingAdapter>
      ),
    });

    // tags.join(",") を表示しているので、配列なら成功、stringなら.joinが存在せずエラーになる
    expect(screen.getByTestId("tags")).toHaveTextContent("チョコ,抹茶");
  });

  it("パラメータがなければwithDefaultの値が使われる", () => {
    render(<ParserDemo />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
      ),
    });

    expect(screen.getByTestId("q")).toHaveTextContent("");
    expect(screen.getByTestId("page")).toHaveTextContent("2");
    expect(screen.getByTestId("active")).toHaveTextContent("false");
    expect(screen.getByTestId("tags")).toHaveTextContent("");
  });
});
