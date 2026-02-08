"use client";

import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

export function ProductFilter() {
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(""),
    category: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
  });

  return (
    <div>
      <input
        data-testid="search"
        type="text"
        value={filters.q}
        onChange={(e) => setFilters({ q: e.target.value })}
      />
      <select
        data-testid="category"
        value={filters.category}
        onChange={(e) => setFilters({ category: e.target.value })}
      >
        <option value="">すべて</option>
        <option value="gelato">ジェラート</option>
        <option value="sorbet">ソルベ</option>
      </select>
      <button onClick={() => setFilters({ q: "チョコ", page: 1 })}>
        チョコで検索
      </button>
      <p data-testid="state">
        {filters.q}|{filters.category}|{filters.page}
      </p>
    </div>
  );
}
