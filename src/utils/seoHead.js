// Preferred host — must match Search Console / owner decision.
// Current canonicals and sitemap.xml use non-www. Confirm with owner before deploying.
export const SITE_HOST = "https://foolisharc.com";

export const SITE_NAME = "FOOLISH ARC";

export const DEFAULT_IMAGE = `${SITE_HOST}/images/editorial_camel_banner.jpg`;

export const PAGE_META = {
  home: {
    title: "FOOLISH ARC Pakistan | Men's & Women's Modern Clothing",
    description:
      "Discover men's and women's clothing at FOOLISH ARC. Explore contemporary shirts, denim, linen trousers and everyday fashion. Shop online in Pakistan.",
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
  const name = product.name || "Garment";
  const type = product.fitLine || product.category || "Apparel";
  const person = product.person || product.gender || "";
  const title = `${name} | ${type} for ${person} | FOOLISH ARC`;
  const description =
    product.description ||
    `Discover ${name} at FOOLISH ARC. ${type} for ${person}. Shop online in Pakistan.`;
  const canonical = `/product/${encodeURIComponent(product.id || product.slug || "")}`;
  const image =
    (product.images && product.images[0]) ||
    product.image ||
    DEFAULT_IMAGE;
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

let currentCanonical = null;
let currentJsonLdId = null;

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
  }

  // Meta description
  setMeta("description", description);
  setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  // Open Graph
  setMeta("og:type", ogType, "property");
  setMeta("og:url", `${SITE_HOST}${canonical || ""}`, "property");
  setMeta("og:title", ogTitle || title, "property");
  setMeta("og:description", ogDescription || description, "property");
  setMeta("og:image", ogImage, "property");
  setMeta("og:image:alt", ogTitle || title || "", "property");
  setMeta("og:site_name", SITE_NAME, "property");

  // Twitter
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:url", `${SITE_HOST}${canonical || ""}`, "name");
  setMeta("twitter:title", twitterTitle || ogTitle || title, "name");
  setMeta("twitter:description", twitterDescription || ogDescription || description, "name");
  setMeta("twitter:image", twitterImage, "name");

  // Canonical
  const canonicalUrl = `${SITE_HOST}${canonical || ""}`;
  if (currentCanonical) {
    currentCanonical.remove();
  }
  const link = document.createElement("link");
  link.rel = "canonical";
  link.href = canonicalUrl;
  document.head.appendChild(link);
  currentCanonical = link;

  // JSON-LD
  if (currentJsonLdId) {
    const existing = document.getElementById(currentJsonLdId);
    if (existing) existing.remove();
  }
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    if (jsonLd.id) script.id = jsonLd.id;
    currentJsonLdId = jsonLd.id;
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

export function removeJsonLd(id) {
  if (id) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
  }
  currentJsonLdId = null;
}
