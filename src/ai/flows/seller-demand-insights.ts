"use server";
/**
 * @fileOverview AI-powered tool for sellers to analyze market trends.
 */

import { ai, runWithModelSafe } from "@/ai/genkit";
import { z } from "genkit";

const maxDuration = 120; // Internal constraint, not exported

const SellerDemandInsightsInputSchema = z.object({
  sellerId: z.string().describe("The unique identifier of the seller."),
  currentListingsCategories: z
    .array(z.string())
    .describe(
      "A list of product categories the seller currently lists or has listed.",
    ),
  recentSearchTerms: z
    .array(z.string())
    .optional()
    .describe(
      "Recent search terms used by the seller, if available, for personalized insights.",
    ),
  sellerLocation: z
    .object({
      latitude: z
        .number()
        .describe("The latitude of the seller's primary location."),
      longitude: z
        .number()
        .describe("The longitude of the seller's primary location."),
    })
    .optional()
    .describe(
      "The geographic location of the seller, used to identify local market trends.",
    ),
});
export type SellerDemandInsightsInput = z.infer<
  typeof SellerDemandInsightsInputSchema
>;

const SellerDemandInsightsOutputSchema = z.object({
  highDemandAreas: z
    .array(
      z.object({
        areaName: z
          .string()
          .describe("The name of the high-demand geographic area."),
        demandScore: z
          .number()
          .describe(
            "A score indicating the level of demand in this area (1-100).",
          ),
        reason: z
          .string()
          .describe("Explanation for why this area is considered high-demand."),
      }),
    )
    .describe(
      "A list of geographic areas identified as having high product demand.",
    ),
  optimalListingCategories: z
    .array(
      z.object({
        categoryName: z
          .string()
          .describe("The name of the optimal product category."),
        demandScore: z
          .number()
          .describe(
            "A score indicating the level of demand for this category (1-100).",
          ),
        reason: z
          .string()
          .describe("Explanation for why this category is considered optimal."),
      }),
    )
    .describe(
      "A list of product categories identified as optimal for selling.",
    ),
  generalMarketTrends: z
    .string()
    .describe(
      "A summary of general market trends and strategic recommendations.",
    ),
});
export type SellerDemandInsightsOutput = z.infer<
  typeof SellerDemandInsightsOutputSchema
>;

const prompt = ai.definePrompt({
  name: "sellerDemandInsightsPrompt",
  input: { schema: SellerDemandInsightsInputSchema },
  output: { schema: SellerDemandInsightsOutputSchema },
  prompt: `You are an AI market analyst for 'The Exchange'.
Analyze current supply and demand to provide data-driven insights.

Seller Location: Latitude {{{sellerLocation.latitude}}}, Longitude {{{sellerLocation.longitude}}}
Listing Focus: {{{currentListingsCategories}}}

1. Identify High-Demand Areas nearby.
2. Recommend categories that are moving fast.
3. Provide a Strategic Trend summary.`,
});

export async function getSellerDemandInsights(
  input: SellerDemandInsightsInput,
): Promise<SellerDemandInsightsOutput> {
  const result = await runWithModelSafe((config) => prompt(input, config));

  if (result.ok && result.output?.output) {
    return result.output.output as SellerDemandInsightsOutput;
  }

  // Graceful Fallback
  return {
    highDemandAreas: [],
    optimalListingCategories: [],
    generalMarketTrends:
      "The market analysis service is temporarily busy. Strategic trends remain stable. Check back in a moment for localized hotspot data.",
  };
}

const sellerDemandInsightsFlow = ai.defineFlow(
  {
    name: "sellerDemandInsightsFlow",
    inputSchema: SellerDemandInsightsInputSchema,
    outputSchema: SellerDemandInsightsOutputSchema,
  },
  async (input) => {
    return getSellerDemandInsights(input);
  },
);
