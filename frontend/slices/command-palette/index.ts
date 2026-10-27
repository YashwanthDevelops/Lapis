// Renderless kitab-portable core (consume with explicit `groups` prop).
export { CommandPalette as CommandPaletteCore } from "./components/CommandPalette";
// Lapis-bound consumer wrapper — back-compat default for the dashboard mount.
export { LapisCommandPalette as CommandPalette } from "./adapters/LapisCommandPalette";
export { ShortcutsDialog } from "./components/ShortcutsDialog";
export type {
  CommandGroup,
  CommandItem,
  CommandPaletteLabels,
  SearchModalLabels,
} from "./lib/types";
export { DEFAULT_PALETTE_LABELS, DEFAULT_SEARCH_LABELS } from "./lib/types";
