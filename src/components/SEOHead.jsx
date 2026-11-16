import React, { useEffect } from "react";
import { setHeadTags } from "../utils/seoHead";

export default function SEOHead({
  title,
  description,
  canonical,
  ogType = "website",
  ogTitle,
  ogDescription,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  noIndex = false,
  jsonLd,
}) {
  useEffect(() => {
    setHeadTags({
      title,
      description,
      canonical,
      ogType,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      noIndex,
      jsonLd,
    });
  }, [
    title,
    description,
    canonical,
    ogType,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    noIndex,
    jsonLd,
  ]);

  return null;
}
