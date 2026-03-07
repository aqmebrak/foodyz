-- Remove leading numbered prefixes (e.g. "1. ", "2. ") from the start of
-- each paragraph in recipe instructions. Paragraphs are separated by \n\n.
UPDATE "Recipe"
SET instructions = regexp_replace(instructions, '(^|\n\n)\d+\.\s*', '\1', 'g')
WHERE instructions ~ '\d+\.\s';
