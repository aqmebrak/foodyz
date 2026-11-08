/** Tiny module-level flag so a back link outside the form can ask before leaving. */
let dirty = false;

export function setUnsavedChanges(value: boolean) {
  dirty = value;
}

export function confirmLeave(): boolean {
  if (!dirty) return true;
  return window.confirm("You have unsaved changes. Leave without saving?");
}
