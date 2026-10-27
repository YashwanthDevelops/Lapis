"use client";

import { useState } from "react";
import { CommandPalette as CommandPaletteCore } from "../components/CommandPalette";
import { useLapisCommandGroups } from "./lapis";

export function LapisCommandPalette() {
  const [query, setQuery] = useState("");
  const { groups, onHistorySelect } = useLapisCommandGroups(query);
  return (
    <CommandPaletteCore
      groups={groups}
      query={query}
      onQueryChange={setQuery}
      onHistorySelect={onHistorySelect}
    />
  );
}
