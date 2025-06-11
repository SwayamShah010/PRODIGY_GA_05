
// This is an AI-powered artistic style transfer flow.
'use server';

/**
 * @fileOverview Applies the artistic style of one image to the content of another using Genkit.
 *
 * - styleTransfer - A function that handles the style transfer process.
 * - StyleTransferInput - The input type for the styleTransfer function.
 * - StyleTransferOutput - The return type for the styleTransfer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {PartData} from 'genkit';

const StyleTransferInputSchema = z.object({
  contentImage: z
    .string()
    .describe(
      "The content image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  styleImage: z
    .string()
    .describe(
      "The style image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type StyleTransferInput = z.infer<typeof StyleTransferInputSchema>;

const StyleTransferOutputSchema = z.object({
  stylizedImage: z
    .string()
    .describe(
      "The stylized image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type StyleTransferOutput = z.infer<typeof StyleTransferOutputSchema>;

export async function styleTransfer(input: StyleTransferInput): Promise<StyleTransferOutput> {
  return styleTransferFlow(input);
}

// This prompt is configured for image generation.
// It takes contentImage and styleImage as input.
const styleTransferPrompt = ai.definePrompt(
  {
    name: 'styleTransferPrompt',
    input: {schema: StyleTransferInputSchema},
    // The prompt is now a function that receives the input and constructs the PartData array.
    prompt: (input: StyleTransferInput): PartData[] => [
      {media: {url: input.contentImage}}, // Directly use the data URI from input
      {text: 'Apply the style of the following image to the content image.'},
      {media: {url: input.styleImage}},   // Directly use the data URI from input
    ],
    config: {
      // Both TEXT and IMAGE are required for image generation models.
      responseModalities: ['TEXT', 'IMAGE'] as const,
    },
  }
);

const styleTransferFlow = ai.defineFlow(
  {
    name: 'styleTransferFlow',
    inputSchema: StyleTransferInputSchema,
    outputSchema: StyleTransferOutputSchema, 
  },
  async (flowInput: StyleTransferInput) => {
    // Call the defined prompt function with the input.
    // We must override the model to use the image generation capable one.
    const response = await styleTransferPrompt(flowInput, {
      model: 'googleai/gemini-2.0-flash-exp',
    });

    // The 'media' object in the response will contain the generated image.
    if (!response.media || !response.media.url) {
      throw new Error('Style transfer did not return an image.');
    }

    return {stylizedImage: response.media.url};
  }
);
