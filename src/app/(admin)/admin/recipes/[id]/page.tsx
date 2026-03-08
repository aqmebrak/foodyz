import { redirect } from "next/navigation";

// The standalone edit page has been removed — editing is done inline
// in the split view on /admin/recipes.
export default function EditRecipePage() {
  redirect("/admin/recipes");
}
