import { Config } from "@/app/types";

const config: Config = {
  aggregatorUrl: process.env.NEXT_PUBLIC_AGGREGATOR_URL || "",
  mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "",
  hotjarSiteId: Number(process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || ""),
  contactSupportUrl: process.env.NEXT_PUBLIC_CONTACT_SUPPORT_URL || "",
  nextAuthUrl: process.env.NEXTAUTH_URL || "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET || "",
};

export default config;
