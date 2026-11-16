import React, { useEffect } from "react";
import { setHeadTags, removeJsonLd } from "../utils/seoHead";

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

    return () => {
      if (jsonLd) {
        removeJsonLd();
      }
    };
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
