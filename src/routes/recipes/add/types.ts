import { z } from 'zod';
import type { validationSchemaRecipe } from '../validationSchemaRecipe';

export type FormValues = z.infer<typeof validationSchemaRecipe>;
