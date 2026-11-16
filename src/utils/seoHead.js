// Preferred host — must match Search Console / owner decision.
// Current canonicals and sitemap.xml use non-www. Confirm with owner before deploying.
export const SITE_HOST = "https://www.foolisharc.com";

export const SITE_NAME = "FOOLISH ARC";

export const DEFAULT_IMAGE = `${SITE_HOST}/images/editorial_camel_banner.jpg`;

export function toAbsoluteUrl(url) {
  if (!url) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

export const PAGE_META = {
  home: {
    title: "FOOLISH ARC | Official Store — Wear Less, Choose Pieces That Last Longer",
    description:
      "Official FOOLISH ARC Store. Architectural slow luxury pret, barrel denim, linen atelier tailoring and permanent wardrobe pieces. Wear Less, Choose Pieces That Last Longer. Shop online in Pakistan.",
    canonical: "/",
    ogType: "website",
  },
  shop: {
    title: "Men's & Women's Clothing Online in Pakistan | FOOLISH ARC",
    description:
      "Explore the full FOOLISH ARC collection — shirts, denim, linen trousers, tees and everyday slow-fashion pieces. Shop online in Pakistan with tracked delivery.",
    canonical: "/shop",
    ogType: "website",
  },
  shopWomen: {
    title: "Women's Shirts, Jeans & Trousers in Pakistan | FOOLISH ARC",
    description:
      "Explore women's shirts, denim, tops and tailored trousers at FOOLISH ARC. Discover relaxed silhouettes and versatile everyday clothing. Shop online in Pakistan.",
    canonical: "/shop?cat=women",
    ogType: "website",
  },
  shopMen: {
    title: "Men's Shirts, T-Shirts & Jeans in Pakistan | FOOLISH ARC",
    description:
      "Explore men's shirts, T-shirts, linen styles and contemporary denim at FOOLISH ARC. Discover versatile everyday clothing and shop online in Pakistan.",
    canonical: "/shop?cat=men",
    ogType: "website",
  },
  shopKids: {
    title: "Kids Pret & Everyday Wear in Pakistan | FOOLISH ARC",
    description:
      "Discover junior everyday organic tees and chino shorts at FOOLISH ARC. Thoughtful, comfortable clothing for kids crafted with natural fabrics.",
    canonical: "/shop?cat=kids",
    ogType: "website",
  },
  story: {
    title: "Atelier Story | Architectural Slow Luxury Pret | FOOLISH ARC",
    description:
      "FOOLISH ARC atelier in Gulberg, Lahore — architectural slow luxury pret, barrel denim and tailored garments crafted from Belgian linen and Mongolian cashmere. Private sittings by appointment.",
    canonical: "/story",
    ogType: "website",
  },
  contact: {
    title: "Contact FOOLISH ARC Atelier | Customer Care & Appointments",
    description:
      "Contact FOOLISH ARC customer care for order, sizing and product inquiries. Private atelier appointments in Gulberg, Lahore available by request.",
    canonical: "/contact",
    ogType: "website",
  },
};

export function productMeta(product) {
  const name = product?.name || "Garment";
  const type = product?.fitLine || product?.category || "Apparel";
  const person = product?.person || product?.gender || "";
  const title = `${name} | ${type} for ${person} | FOOLISH ARC`;
  const description =
    product?.description ||
    `Discover ${name} at FOOLISH ARC. ${type} for ${person}. Shop online in Pakistan.`;
  const canonical = `/product/${encodeURIComponent(product?.id || product?.slug || "")}`;
  const rawImage =
    (product?.images && product?.images[0]) ||
    product?.image ||
    DEFAULT_IMAGE;
  const image = toAbsoluteUrl(rawImage);
  return {
    title,
    description,
    canonical,
    ogType: "product",
    image,
    productName: name,
    product,
  };
}

const DYNAMIC_JSONLD_ID = "seo-dynamic-jsonld";

export function setHeadTags({
  title,
  description,
  canonical,
  ogType = "website",
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_IMAGE,
  twitterTitle,
  twitterDescription,
  twitterImage = DEFAULT_IMAGE,
  noIndex = false,
  jsonLd = null,
}) {
  // Title
  if (title) {
    document.title = title;
    setMeta("title", title);
  }

  // Meta description & robots
  setMeta("description", description);
  setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  const absOgImage = toAbsoluteUrl(ogImage);
  const absTwitterImage = toAbsoluteUrl(twitterImage || ogImage);
  const canonicalUrl = `${SITE_HOST}${canonical || ""}`;

  // Open Graph
  setMeta("og:type", ogType, "property");
  setMeta("og:url", canonicalUrl, "property");
  setMeta("og:title", ogTitle || title, "property");
  setMeta("og:description", ogDescription || description, "property");
  setMeta("og:image", absOgImage, "property");
  setMeta("og:image:alt", ogTitle || title || "", "property");
  setMeta("og:site_name", SITE_NAME, "property");

  // Twitter
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:url", canonicalUrl, "name");
  setMeta("twitter:title", twitterTitle || ogTitle || title, "name");
  setMeta("twitter:description", twitterDescription || ogDescription || description, "name");
  setMeta("twitter:image", absTwitterImage, "name");

  // Canonical - Mutate existing or create single element (prevents duplicate canonicals)
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) {
    canonicalEl.setAttribute("href", canonicalUrl);
  } else {
    canonicalEl = document.createElement("link");
    canonicalEl.rel = "canonical";
    canonicalEl.href = canonicalUrl;
    document.head.appendChild(canonicalEl);
  }

  // JSON-LD - Replace or remove dynamically to prevent duplicate or leaking product schemas
  const existingJsonLd = document.getElementById(DYNAMIC_JSONLD_ID);
  if (existingJsonLd) {
    existingJsonLd.remove();
  }
  if (jsonLd) {
    const script = document.createElement("script");
    script.id = DYNAMIC_JSONLD_ID;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function removeJsonLd() {
  const existing = document.getElementById(DYNAMIC_JSONLD_ID);
  if (existing) existing.remove();
}
