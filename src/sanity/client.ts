import { createClient } from "@sanity/client";
import { sanityConfig } from "./config";

export const sanityClient = createClient({
  ...sanityConfig,
  useCdn: false,
});

export const sanityWriteClient = createClient({
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
