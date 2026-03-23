import { SearchBar } from "@/components/shared/SearchBar";

import { selectClass } from "./types";

interface RecipeFiltersProps {
  query: string;
  selectedTag: string;
  difficulty: string;
  status: string;
  maxPrepTime: string;
  maxCookTime: string;
  maxServings: string;
  uniqueTags: string[];
  onQueryChange: (v: string) => void;
  onTagChange: (v: string) => void;
  onDifficultyChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onMaxPrepTimeChange: (v: string) => void;
  onMaxCookTimeChange: (v: string) => void;
  onMaxServingsChange: (v: string) => void;
}

export function RecipeFilters({
  query: _query,
  selectedTag,
  difficulty,
  status,
  maxPrepTime,
  maxCookTime,
  maxServings,
  uniqueTags,
  onQueryChange,
  onTagChange,
  onDifficultyChange,
  onStatusChange,
  onMaxPrepTimeChange,
  onMaxCookTimeChange,
  onMaxServingsChange,
}: RecipeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <SearchBar placeholder="Filter by title…" onSearch={onQueryChange} className="max-w-xs" />
      <select className={selectClass} value={selectedTag} onChange={(e) => onTagChange(e.target.value)}>
        <option value="">All tags</option>
        {uniqueTags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select className={selectClass} value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)}>
        <option value="">All levels</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </select>
      <select className={selectClass} value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="">Any status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      <select className={selectClass} value={maxPrepTime} onChange={(e) => onMaxPrepTimeChange(e.target.value)}>
        <option value="">Prep: any</option>
        <option value="15">Prep ≤ 15 min</option>
        <option value="30">Prep ≤ 30 min</option>
        <option value="60">Prep ≤ 60 min</option>
      </select>
      <select className={selectClass} value={maxCookTime} onChange={(e) => onMaxCookTimeChange(e.target.value)}>
        <option value="">Cook: any</option>
        <option value="15">Cook ≤ 15 min</option>
        <option value="30">Cook ≤ 30 min</option>
        <option value="60">Cook ≤ 60 min</option>
        <option value="120">Cook ≤ 120 min</option>
      </select>
      <select className={selectClass} value={maxServings} onChange={(e) => onMaxServingsChange(e.target.value)}>
        <option value="">Servings: any</option>
        <option value="2">≤ 2</option>
        <option value="4">≤ 4</option>
        <option value="6">≤ 6</option>
        <option value="8">≤ 8</option>
      </select>
    </div>
  );
}
