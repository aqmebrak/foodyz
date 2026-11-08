"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { joinSteps, pasteIntoSteps, splitSteps } from "@/lib/steps";
import type { RecipeFormValues } from "@/lib/validations/recipe";

interface StepItem {
  id: number;
  text: string;
}

let nextId = 1;
const toItems = (texts: string[]): StepItem[] =>
  texts.map((text) => ({ id: nextId++, text }));

const iconButton =
  "size-11 shrink-0 text-ink hover:bg-steam disabled:opacity-30";

interface StepsEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

function StepsEditor({
  value,
  onChange,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ref,
}: StepsEditorProps) {
  const [items, setItems] = useState<StepItem[]>(() => {
    const parsed = splitSteps(value);
    return toItems(parsed.length ? parsed : [""]);
  });
  const areas = useRef(new Map<number, HTMLTextAreaElement>());
  const focusId = useRef<number | null>(null);

  // Sync when the form value changes from outside (draft restore, reset).
  useEffect(() => {
    if (joinSteps(items.map((i) => i.text)) !== value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(toItems(splitSteps(value).length ? splitSteps(value) : [""]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (focusId.current !== null) {
      areas.current.get(focusId.current)?.focus();
      focusId.current = null;
    }
  });

  function commit(next: StepItem[]) {
    setItems(next);
    onChange(joinSteps(next.map((i) => i.text)));
  }

  function updateText(id: number, text: string) {
    commit(items.map((i) => (i.id === id ? { ...i, text } : i)));
  }

  function addStep() {
    const item = toItems([""])[0];
    focusId.current = item.id;
    commit([...items, item]);
  }

  function removeStep(id: number) {
    const next = items.filter((i) => i.id !== id);
    commit(next.length ? next : toItems([""]));
  }

  function moveStep(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>, index: number) {
    const result = pasteIntoSteps(
      items.map((i) => i.text),
      index,
      e.clipboardData.getData("text"),
    );
    if (!result) return;
    e.preventDefault();
    const next = toItems(result.steps);
    focusId.current = next[result.focusIndex].id;
    commit(next);
  }

  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={item.id} className="flex gap-3">
          <span
            aria-hidden
            className="mt-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-basil text-sm font-semibold tabular-nums text-on-basil"
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Textarea
              ref={(el) => {
                if (el) areas.current.set(item.id, el);
                else areas.current.delete(item.id);
                if (index === 0 && typeof ref === "function") ref(el);
              }}
              aria-label={`Step ${index + 1}`}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
              value={item.text}
              rows={3}
              placeholder={index === 0 ? "Describe this step" : undefined}
              className="min-h-[5.5rem] bg-card text-[17px] leading-relaxed md:text-[17px]"
              onChange={(e) => updateText(item.id, e.target.value)}
              onPaste={(e) => handlePaste(e, index)}
              onBlur={onBlur}
            />
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                className={iconButton}
                aria-label={`Move step ${index + 1} up`}
                disabled={index === 0}
                onClick={() => moveStep(index, -1)}
              >
                <ArrowUp className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={iconButton}
                aria-label={`Move step ${index + 1} down`}
                disabled={index === items.length - 1}
                onClick={() => moveStep(index, 1)}
              >
                <ArrowDown className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="size-11 shrink-0 text-paprika hover:bg-paprika/10 hover:text-paprika"
                aria-label={`Remove step ${index + 1}`}
                onClick={() => removeStep(item.id)}
              >
                <Trash2 className="size-5" />
              </Button>
            </div>
          </div>
        </li>
      ))}
      <li>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full border-basil text-basil hover:bg-basil/10"
          onClick={addStep}
        >
          <Plus className="size-5" />
          Add step
        </Button>
      </li>
    </ol>
  );
}

interface InstructionsSectionProps {
  control: Control<RecipeFormValues>;
}

export function InstructionsSection({ control }: InstructionsSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="border-b pb-2 text-base font-semibold text-foreground">
        Steps
      </h2>
      <FormField
        control={control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <StepsEditor
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>
              One box per step. Pasting text with blank lines splits it into
              steps.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
