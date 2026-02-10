import createClient from "openapi-fetch";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { paths } from "./generated/api";
import { handlers } from "./msw-handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createTestClient() {
  return createClient<paths>({ baseUrl: "http://localhost:3000" });
}

describe("openapi-fetch の { data, error } レスポンスパターン", () => {
  describe("GET /pets - ペット一覧取得", () => {
    it("成功時は data にペット配列が入り、error は undefined", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.GET("/pets");

      expect(response.status).toBe(200);
      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data).toHaveLength(3);
      expect(data![0]).toEqual({
        id: 1,
        name: "Pochi",
        species: "dog",
        age: 3,
      });
    });

    it("query パラメータ species でフィルタできる", async () => {
      const client = createTestClient();
      const { data, error } = await client.GET("/pets", {
        params: { query: { species: "cat" } },
      });

      expect(error).toBeUndefined();
      expect(data).toHaveLength(1);
      expect(data![0]!.name).toBe("Tama");
    });

    it("query パラメータ limit で件数制限できる", async () => {
      const client = createTestClient();
      const { data, error } = await client.GET("/pets", {
        params: { query: { limit: 2 } },
      });

      expect(error).toBeUndefined();
      expect(data).toHaveLength(2);
    });

    it("不正な limit で 400 エラーが返る場合、error にエラーオブジェクトが入り data は undefined", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.GET("/pets", {
        params: { query: { limit: -1 } },
      });

      expect(response.status).toBe(400);
      expect(data).toBeUndefined();
      expect(error).toBeDefined();
      expect(error!.code).toBe(400);
      expect(error!.message).toBe("Invalid limit parameter");
    });
  });

  describe("GET /pets/{petId} - ペット詳細取得", () => {
    it("存在するペットの場合、data にペットオブジェクトが入る", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.GET("/pets/{petId}", {
        params: { path: { petId: 1 } },
      });

      expect(response.status).toBe(200);
      expect(error).toBeUndefined();
      expect(data).toEqual({
        id: 1,
        name: "Pochi",
        species: "dog",
        age: 3,
      });
    });

    it("存在しないペットの場合、error に 404 エラーが入る", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.GET("/pets/{petId}", {
        params: { path: { petId: 999 } },
      });

      expect(response.status).toBe(404);
      expect(data).toBeUndefined();
      expect(error).toEqual({
        code: 404,
        message: "Pet not found",
      });
    });
  });

  describe("POST /pets - ペット新規作成", () => {
    it("正しいリクエストボディで 201 が返る", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.POST("/pets", {
        body: { name: "Koro", species: "dog", age: 2 },
      });

      expect(response.status).toBe(201);
      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data!.name).toBe("Koro");
      expect(data!.species).toBe("dog");
      expect(data!.id).toBeTypeOf("number");
    });

    it("age を省略しても作成できる", async () => {
      const client = createTestClient();
      const { data, error } = await client.POST("/pets", {
        body: { name: "Shiro", species: "cat" },
      });

      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data!.name).toBe("Shiro");
    });
  });

  describe("PUT /pets/{petId} - ペット更新", () => {
    it("存在するペットを更新できる", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.PUT("/pets/{petId}", {
        params: { path: { petId: 1 } },
        body: { name: "Pochi-Updated" },
      });

      expect(response.status).toBe(200);
      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data!.name).toBe("Pochi-Updated");
      expect(data!.species).toBe("dog");
    });

    it("存在しないペットを更新しようとすると 404", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.PUT("/pets/{petId}", {
        params: { path: { petId: 999 } },
        body: { name: "Ghost" },
      });

      expect(response.status).toBe(404);
      expect(data).toBeUndefined();
      expect(error).toEqual({
        code: 404,
        message: "Pet not found",
      });
    });
  });

  describe("DELETE /pets/{petId} - ペット削除", () => {
    it("存在するペットを削除すると 204 が返り data も error も undefined", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.DELETE("/pets/{petId}", {
        params: { path: { petId: 1 } },
      });

      expect(response.status).toBe(204);
      expect(data).toBeUndefined();
      expect(error).toBeUndefined();
    });

    it("存在しないペットを削除すると 404", async () => {
      const client = createTestClient();
      const { data, error, response } = await client.DELETE("/pets/{petId}", {
        params: { path: { petId: 999 } },
      });

      expect(response.status).toBe(404);
      expect(data).toBeUndefined();
      expect(error).toEqual({
        code: 404,
        message: "Pet not found",
      });
    });
  });
});

describe("openapi-fetch の data/error 型の絞り込み", () => {
  it("if (data) で絞り込むと data の型が確定する", async () => {
    const client = createTestClient();
    const { data, error } = await client.GET("/pets/{petId}", {
      params: { path: { petId: 1 } },
    });

    if (data) {
      expect(error).toBeUndefined();
      const name: string = data.name;
      const species: "dog" | "cat" | "bird" = data.species;
      expect(name).toBe("Pochi");
      expect(species).toBe("dog");
    }
  });

  it("if (error) で絞り込むと error の型が確定する", async () => {
    const client = createTestClient();
    const { data, error } = await client.GET("/pets/{petId}", {
      params: { path: { petId: 999 } },
    });

    if (error) {
      expect(data).toBeUndefined();
      const code: number = error.code;
      const message: string = error.message;
      expect(code).toBe(404);
      expect(message).toBe("Pet not found");
    }
  });

  it("data と error は排他的である (discriminated union)", async () => {
    const client = createTestClient();
    const result = await client.GET("/pets/{petId}", {
      params: { path: { petId: 1 } },
    });

    const hasData = result.data !== undefined;
    const hasError = result.error !== undefined;
    expect(hasData).not.toBe(hasError);
  });
});

describe("openapi-fetch の response オブジェクト", () => {
  it("response は常に存在し、元の Response オブジェクトにアクセスできる", async () => {
    const client = createTestClient();
    const { response } = await client.GET("/pets");

    expect(response).toBeInstanceOf(Response);
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("エラー時も response オブジェクトにアクセスできる", async () => {
    const client = createTestClient();
    const { response } = await client.GET("/pets/{petId}", {
      params: { path: { petId: 999 } },
    });

    expect(response).toBeInstanceOf(Response);
    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });
});
