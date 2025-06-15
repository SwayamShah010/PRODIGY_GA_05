'use server';

/**
 * @fileOverview An AI agent that suggests style images.
 *
 * - suggestStyleImages - A function that suggests style images.
 * - SuggestStyleImagesInput - The input type for the suggestStyleImages function.
 * - SuggestStyleImagesOutput - The return type for the suggestStyleImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStyleImagesInputSchema = z.object({
  contentDescription: z
    .string()
    .describe('The description of the content image.'),
});
export type SuggestStyleImagesInput = z.infer<typeof SuggestStyleImagesInputSchema>;

const SuggestStyleImagesOutputSchema = z.object({
  styleImageSuggestions: z
    .array(z.string())
    .describe('An array of suggested style image descriptions.'),
});
export type SuggestStyleImagesOutput = z.infer<typeof SuggestStyleImagesOutputSchema>;

export async function suggestStyleImages(input: SuggestStyleImagesInput): Promise<SuggestStyleImagesOutput> {
  return suggestStyleImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStyleImagesPrompt',
  input: {schema: SuggestStyleImagesInputSchema},
  output: {schema: SuggestStyleImagesOutputSchema},
  prompt: `You are an AI assistant that suggests style images based on the content of the image.
  The user will provide a description of the content image, and you should suggest 3 different styles that could be applied to the content image.
  These suggestions should be in the form of a description of the style, such as "Impressionist painting", "Pencil sketch", or "Cyberpunk illustration".

  Content Description: {{{contentDescription}}}
  `,
});

const suggestStyleImagesFlow = ai.defineFlow(
  {
    name: 'suggestStyleImagesFlow',
    inputSchema: SuggestStyleImagesInputSchema,
    outputSchema: SuggestStyleImagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
