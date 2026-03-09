export const difficultyOptions = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

export const DEFAULT_FORM_VALUES = {
  title: "",
  slug: "",
  description: "",
  featuredImage: "",
  difficulty: "EASY" as const,
  prepTime: 15,
  cookTime: 30,
  servings: 4,
  published: false,
  instructions: "",
  ingredients: [],
  tags: [],
};
