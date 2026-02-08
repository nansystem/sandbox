"use client";

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
  parseAsArrayOf,
} from "nuqs";

export function ParserDemo() {
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [active] = useQueryState("active", parseAsBoolean.withDefault(false));
  const [tags] = useQueryState(
    "tags",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  return (
    <div>
      <p data-testid="q">{q}</p>
      <p data-testid="page">{page + 1}</p>
      <p data-testid="active">{String(active === true)}</p>
      <p data-testid="tags">{tags.join(",")}</p>
    </div>
  );
}
