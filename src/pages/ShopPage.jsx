import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CategoryFilter, {
  GENDER_FILTERS,
  SLOT_FILTERS,
} from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';

export default function ShopPage({
  products = [],
  onAddToCart,
  onOpenProductModal,
  onToggleWishlist,
  wishlist = [],
}) {
  const [params, setParams] = useSearchParams();
  const gender =
    GENDER_FILTERS.find((f) => f.id === params.get('cat'))?.id || 'all';
  const category =
    SLOT_FILTERS.find((f) => f.id === params.get('type'))?.id || 'all';
  const size = params.get('size') || '',
    saved = params.get('saved') === '1';
  const sort = params.get('sort') || 'featured',
    urlQuery = params.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => setQuery(urlQuery), [urlQuery]);
  const update = (key, value) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value && value !== 'all' && value !== 'featured')
          next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  function clear() {
    setQuery('');
    setParams({});
  }
  const sizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes || []))],
    [products],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (gender !== 'all' && gender !== p.person && gender !== p.gender)
        return false;
      const type = /jeans|denim/i.test(p.name)
        ? 'jeans'
        : ['wide', 'trouser'].includes(p.style)
          ? 'trouser'
          : p.style;
      if (category !== 'all' && category !== type && category !== p.slot)
        return false;
      if (saved && !wishlist.includes(p.id)) return false;
      if (
        size &&
        (!p.sizes?.includes(size) ||
          !(Number(p.stockPerSize?.[size] ?? p.stock) > 0))
      )
        return false;
      return (
        !q ||
        [
          p.name,
          p.description,
          p.colorName,
          ...(p.colors || []).map((c) => (typeof c === 'string' ? c : c.name)),
        ].some((x) => x?.toLowerCase().includes(q))
      );
    });
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, gender, category, saved, wishlist, size, sort]);
  return (
    <div className="min-h-screen py-8 sm:py-12 bg-white dark:bg-onyx-950 text-black dark:text-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12">
        <header className="collection-intro">
          <div className="collection-copy">
            <p className="atelier-kicker">
              FOOLISH ARC &nbsp; / &nbsp; Permanent edition
            </p>
            <h1>The collection</h1>
            <p>
              Explore the cuts, colours and textures of the atelier. Use our precision fit finder to find your bespoke size.
            </p>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-fit-finder'));
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A6E3E] hover:underline cursor-pointer"
            >
              <span>📏 Find Your Size</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <img src="/images/editorial_camel_banner.jpg" alt="" />
        </header>
        <CategoryFilter
          activeGender={gender}
          activeSlot={category}
          onSelectGender={(v) => update('cat', v)}
          onSelectSlot={(v) => update('type', v)}
        />
        <div className="collection-controls">
          <label>
            Size{' '}
            <select
              aria-label="Available size"
              value={size}
              onChange={(e) => update('size', e.target.value)}
            >
              <option value="">Any size</option>
              {sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <input
            type="search"
            placeholder="Search collection…"
            aria-label="Search collection"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={(e) => update('q', e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
          <button
            aria-pressed={saved}
            onClick={() => update('saved', saved ? '' : '1')}
          >
            ♥ Wishlist ({wishlist.length})
          </button>
          <select
            aria-label="Sort garments"
            value={sort}
            onChange={(e) => update('sort', e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
        <div className="flex justify-between items-center my-4 text-xs">
          <p className="atelier-kicker" role="status">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </p>
          {(params.size > 0 || query) && (
            <button className="underline" onClick={clear}>
              Clear all filters
            </button>
          )}
        </div>
        {filtered.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onQuickView={onOpenProductModal}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p>No garments matched your filters.</p>
            <button onClick={clear} className="mt-3 underline">
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
