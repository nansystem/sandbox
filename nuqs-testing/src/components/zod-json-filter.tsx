"use client";

import { useQueryState, parseAsJson } from "nuqs";
import { z } from "zod";

const filterSchema = z.object({
  q: z.string(),
  category: z.enum(["gelato", "sorbet", "all"]),
  page: z.number().int().positive(),
});

type Filter = z.infer<typeof filterSchema>;

const defaultFilter: Filter = {
  q: "",
  category: "all",
  page: 1,
};

export function ZodJsonFilter() {
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsJson(filterSchema).withDefault(defaultFilter)
  );

  return (
    <div>
      <input
        data-testid="search"
        type="text"
        value={filter.q}
        onChange={(e) => setFilter({ ...filter, q: e.target.value })}
      />
      <select
        data-testid="category"
        value={filter.category}
        onChange={(e) =>
          setFilter({
            ...filter,
            category: e.target.value as Filter["category"],
          })
        }
      >
        <option value="all">すべて</option>
        <option value="gelato">ジェラート</option>
        <option value="sorbet">ソルベ</option>
      </select>
      <button
        onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
      >
        次のページ
      </button>
      <button onClick={() => setFilter(defaultFilter)}>リセット</button>
      <p data-testid="state">
        {filter.q}|{filter.category}|{filter.page}
      </p>
    </div>
  );
}
