'use server';
/**
 * @fileOverview This file implements an AI-powered tool for sellers to analyze market trends.
 *
 * - getSellerDemandInsights - A function that provides market trend analysis and suggests high-demand areas or optimal listing categories.
 * - SellerDemandInsightsInput - The input type for the getSellerDemandInsights function.
 * - SellerDemandInsightsOutput - The return type for the getSellerDemandInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SellerDemandInsightsInputSchema = z.object({
  sellerId: z.string().describe('The unique identifier of the seller.'),
  currentListingsCategories: z
    .array(z.string())
    .describe('A list of product categories the seller currently lists or has listed.'),
  recentSearchTerms: z
    .array(z.string())
    .optional()
    .describe('Recent search terms used by the seller, if available, for personalized insights.'),
  sellerLocation: z
    .object({
      latitude: z.number().describe("The latitude of the seller's primary location."),
      longitude: z.number().describe("The longitude of the seller's primary location."),
    })
    .optional()
    .describe('The geographic location of the seller, used to identify local market trends.'),
});
export type SellerDemandInsightsInput = z.infer<typeof SellerDemandInsightsInputSchema>;

const SellerDemandInsightsOutputSchema = z.object({
  highDemandAreas: z
    .array(
      z.object({
        areaName: z.string().describe('The name of the high-demand geographic area.'),
        demandScore: z
          .number()
          .describe('A score indicating the level of demand in this area (e.g., 1-100).'),
        reason: z.string().describe('Explanation for why this area is considered high-demand.'),
      })
    )
    .describe('A list of geographic areas identified as having high product demand.'),
  optimalListingCategories: z
    .array(
      z.object({
        categoryName: z.string().describe('The name of the optimal product category.'),
        demandScore: z
          .number()
          .describe('A score indicating the level of demand for this category (e.g., 1-100).'),
        reason: z.string().describe('Explanation for why this category is considered optimal.'),
      })
    )
    .describe('A list of product categories identified as optimal for selling.'),
  generalMarketTrends: z
    .string()
    .describe('A summary of general market trends and strategic recommendations.'),
});
export type SellerDemandInsightsOutput = z.infer<typeof SellerDemandInsightsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'sellerDemandInsightsPrompt',
  input: {schema: SellerDemandInsightsInputSchema},
  output: {schema: SellerDemandInsightsOutputSchema},
  prompt: `You are an AI-powered market analyst for LocalBid Exchange, an online marketplace.
Your goal is to provide sellers with actionable insights into market trends, high-demand areas, and optimal listing categories to maximize their sales.

Analyze the provided seller information and internal platform data to identify patterns and make data-driven recommendations.

Seller ID: {{{sellerId}}}
Current Listing Categories: {{{currentListingsCategories}}}
{{#if recentSearchTerms}}Recent Search Terms: {{{recentSearchTerms}}}{{/if}}
{{#if sellerLocation}}Seller Location: Latitude {{{sellerLocation.latitude}}}, Longitude {{{sellerLocation.longitude}}}{{/if}}

Based on this information, previous transactions on the platform, and user search data (which you implicitly have access to), identify:
1.  **High-Demand Geographic Areas**: Suggest specific areas where products similar to the seller's current listings or general market demand is high. Provide a demand score and a brief reason.
2.  **Optimal Listing Categories**: Recommend product categories that the seller should focus on, either because they align with existing demand or represent new opportunities. Provide a demand score and a brief reason.
3.  **General Market Trends**: Summarize overarching market trends relevant to the seller's profile and strategic recommendations for improving their sales.

Ensure your suggestions are practical and directly applicable to a seller on LocalBid Exchange. Focus on concrete categories and locations rather than vague concepts.`,
});

const sellerDemandInsightsFlow = ai.defineFlow(
  {
    name: 'sellerDemandInsightsFlow',
    inputSchema: SellerDemandInsightsInputSchema,
    outputSchema: SellerDemandInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function getSellerDemandInsights(
  input: SellerDemandInsightsInput
): Promise<SellerDemandInsightsOutput> {
  return sellerDemandInsightsFlow(input);
}
