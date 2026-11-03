// FORME Vector Mannequin & Garment Layering Engine
let serial = 0;
export const PEOPLE = ['women', 'men', 'kids'];
export const SLOTS = ['top', 'bottom', 'outer', 'dress'];
export const STYLES = {
  top: ['knit', 'tee', 'shirt'],
  bottom: ['trouser', 'wide', 'shorts'],
  outer: ['blazer', 'coat'],
  dress: ['dress']
};

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

export const hex = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
function validAsset(a) {
  return a && typeof a.src === 'string' && a.src.length <= 3500000 &&
    /^(?:data:image\/(?:png|webp);base64,[A-Za-z0-9+/=]+|\/images\/[a-zA-Z0-9_./-]+\.(?:png|webp|jpe?g))$/i.test(a.src) &&
    ['x','y','width','height'].every(k=>Number.isFinite(a[k]) && a[k]>=-200 && a[k]<=900) && a.width>0 && a.height>0;
}

export const money = (v) => 'Rs. ' + Math.round(Number(v) || 0).toLocaleString('en-US');

export function tint(color, amount) {
  if (!color || !hex(color)) return color;
  const n = parseInt(color.slice(1), 16);
  return (
    '#' +
    [n >> 16, (n >> 8) & 255, n & 255]
      .map((v) => Math.max(0, Math.min(255, v + amount)).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function validateCatalog(data) {
  if (!data || !Array.isArray(data.products) || data.products.length > 500) {
    throw new Error('Choose a catalog with up to 500 products.');
  }
  const ids = new Set();
  const products = data.products.map((p) => {
    if (!p || typeof p.id !== 'string' || !p.id || p.id.length > 100 || ids.has(p.id)) {
      throw new Error('Every product needs a unique ID.');
    }
    ids.add(p.id);
    if (
      typeof p.name !== 'string' ||
      !p.name.trim() ||
      p.name.length > 70 ||
      !PEOPLE.includes(p.person) ||
      !SLOTS.includes(p.slot)
    ) {
      throw new Error('A product has an invalid name, collection, or category.');
    }
    if (typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price < 0 || p.price > 1000000) {
      throw new Error('Product prices must be valid numbers.');
    }
    if (!Array.isArray(p.colors) || p.colors.length < 1 || p.colors.length > 12) {
      throw new Error('Each product needs 1–12 colours.');
    }
    const colors = p.colors.map((c) => {
      if (!c || typeof c.name !== 'string' || c.name.length > 30 || !hex(c.hex)) {
        throw new Error('Invalid product colour.');
      }
      return { name: c.name, hex: c.hex };
    });
    const result = {
      id: p.id,
      name: p.name.trim(),
      person: p.person,
      slot: p.slot,
      style: p.style,
      price: p.price,
      description: String(p.description || '').slice(0, 160),
      colors
    };
    if (p.style === 'custom') {
      if(!validAsset(p.asset)) throw new Error('Invalid garment image or placement.');
      result.asset = { ...p.asset };
    } else if (!STYLES[p.slot].includes(p.style)) {
      throw new Error('The preview shape does not match the category.');
    }
    return result;
  });
  const theme = data.theme || {};
  return {
    version: 1,
    theme: {
      brand: String(theme.brand || 'FOOLISH ARC').trim().slice(0, 24) || 'FOOLISH ARC',
      olive: hex(theme.olive) ? theme.olive : '#364634',
      camel: hex(theme.camel) ? theme.camel : '#C69F6F'
    },
    products
  };
}

export function equip(outfit, product, variant = 0) {
  const next = { ...outfit };
  if (product.slot === 'dress') {
    delete next.top;
    delete next.bottom;
  }
  if (product.slot === 'top' || product.slot === 'bottom') {
    delete next.dress;
  }
  next[product.slot] = { id: product.id, variant };
  return next;
}

export function defs(id, color) {
  return `<defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".15">
      <stop stop-color="${tint(color, -28)}"/>
      <stop offset=".22" stop-color="${tint(color, 13)}"/>
      <stop offset=".48" stop-color="${color}"/>
      <stop offset=".75" stop-color="${tint(color, 3)}"/>
      <stop offset="1" stop-color="${tint(color, -24)}"/>
    </linearGradient>
    <pattern id="${id}-rib" width="4" height="4" patternUnits="userSpaceOnUse">
      <path d="M1 0V4" stroke="#fff" stroke-opacity=".13" stroke-width=".7"/>
      <path d="M3 0V4" stroke="#000" stroke-opacity=".045" stroke-width=".7"/>
    </pattern>
  </defs>`;
}

export function garment(p, variant = 0, person = p.person) {
  if (p.style === 'custom' && validAsset(p.asset)) {
    return `<image href="${esc(p.asset.src)}" x="${p.asset.x}" y="${p.asset.y}" width="${p.asset.width}" height="${p.asset.height}" preserveAspectRatio="none"/>`;
  }
  const id = 'garment-' + (++serial);
  const candidate=(p.colors?.[variant] || p.colors?.[0])?.hex;
  const color=hex(candidate) ? candidate : '#364634';
  const fill = `url(#${id})`;
  const line = tint(color, -34);
  const shine = tint(color, 22);
  let silhouette = '';
  let detail = '';
  const seams = (paths) =>
    `<g fill="none" stroke="${line}" stroke-opacity=".43" stroke-width="1.2" stroke-linecap="round">${paths}</g>`;

  if (p.style === 'knit' || p.style === 'tee' || p.style === 'shirt') {
    const short = p.style === 'tee';
    silhouette = short
      ? 'M174 129 Q164 132 148 139 L129 155 L110 214 L139 224 L153 192 L151 285 Q198 298 249 285 L247 192 L261 224 L290 214 L271 155 L252 139 Q235 132 226 129 Q202 147 174 129Z'
      : 'M174 129 Q164 132 146 140 L132 158 L109 302 L131 309 L154 201 L150 287 Q199 300 250 287 L246 201 L269 309 L291 302 L268 158 L253 140 Q236 132 226 129 Q202 148 174 129Z';
    detail = seams(
      '<path d="M153 157Q164 175 154 201M247 157Q235 175 246 201M157 278Q201 289 243 278M163 206L160 263M237 206L241 263"/>'
    );
    if (p.style === 'knit') {
      detail += `<path d="${silhouette}" fill="url(#${id}-rib)"/><path d="M174 130Q201 150 226 130" fill="none" stroke="${line}" stroke-width="5" stroke-opacity=".4"/><path d="M111 294L133 301M267 301L289 294M151 279Q199 293 250 279" fill="none" stroke="${line}" stroke-width="5" stroke-opacity=".2"/>`;
    }
    if (short) {
      detail += seams(
        '<path d="M174 130Q201 155 226 130M112 208L141 217M259 217L288 208"/>'
      );
    }
    if (p.style === 'shirt') {
      detail += `<path d="M176 129L166 150L187 166L200 143L213 166L234 150L224 129L201 143Z" fill="${shine}" stroke="${line}" stroke-width=".6"/><path d="M200 146V287" stroke="${line}" stroke-opacity=".45"/><path d="M214 177H237V203Q224 211 214 203Z" fill="none" stroke="${line}" stroke-opacity=".4"/>${[171, 195, 219, 243, 267].map((y) => `<circle cx="202" cy="${y}" r="1.5" fill="${line}"/>`).join('')}`;
    }
  } else if (['trouser', 'wide', 'shorts'].includes(p.style)) {
    silhouette =
      p.style === 'wide'
        ? 'M152 282Q200 292 248 282L261 597Q241 609 211 600L200 365L189 600Q159 609 139 597Z'
        : p.style === 'shorts'
        ? 'M152 282Q200 290 248 282L256 412L210 419L200 354L190 419L144 412Z'
        : 'M152 282Q200 290 248 282L244 435L239 597Q223 603 207 597L200 366L193 597Q177 603 161 597L156 435Z';
    detail = seams(
      '<path d="M152 295Q200 302 248 295M171 298Q169 323 153 329M229 298Q231 323 247 329M200 299V350Q208 347 208 333V300M161 287L160 301M238 287L239 301"/>'
    );
    detail +=
      p.style === 'shorts'
        ? seams('<path d="M146 402L188 409M212 409L254 402"/>')
        : seams('<path d="M176 330L175 581M224 330L225 581"/>');
    detail += `<circle cx="201" cy="293" r="2.4" fill="${line}"/><path d="M156 301Q149 365 158 411M243 302Q250 362 242 409" fill="none" stroke="${shine}" stroke-opacity=".35" stroke-width="3"/>`;
  } else if (p.style === 'blazer' || p.style === 'coat') {
    const end = p.style === 'coat' ? 455 : 359;
    silhouette = `M174 127L143 140Q134 144 128 169L101 329L126 336L151 208L145 ${end}Q169 ${end + 9} 192 ${end - 3}L200 225L208 ${end - 3}Q231 ${end + 9} 255 ${end}L249 208L274 336L299 329L272 169Q266 144 257 140L226 127L201 225Z`;
    detail =
      `<path d="M175 127L163 158L178 166L169 180L200 230L187 153Z" fill="${shine}" stroke="${line}" stroke-opacity=".4"/><path d="M225 127L237 158L222 166L231 180L200 230L213 153Z" fill="${shine}" stroke="${line}" stroke-opacity=".4"/>` +
      seams(
        `<path d="M155 283L181 285M219 285L245 283M139 168L124 317M261 168L276 317M153 ${end - 10}L185 ${end - 9}M215 ${end - 9}L247 ${end - 10}"/>`
      ) +
      [257, 285].map((y) => `<circle cx="211" cy="${y}" r="3" fill="${line}"/>`).join('');
  } else if (p.style === 'dress') {
    silhouette =
      'M174 130L151 140L132 191L154 203L166 178L170 251L136 507Q200 531 264 507L230 251L234 178L246 203L268 191L249 140L226 130Q201 150 174 130Z';
    detail =
      seams(
        '<path d="M174 130Q200 153 226 130M170 251Q200 259 230 251M171 260L154 500M229 260L246 500M189 272L181 511M211 272L219 511M140 498Q201 520 260 498"/>'
      ) +
      `<path d="M171 250Q201 258 229 250" stroke="${line}" stroke-width="6" fill="none" stroke-opacity=".3"/><rect x="193" y="248" width="14" height="9" rx="2" fill="none" stroke="${shine}" stroke-width="2"/>`;
  }
  const sx = person === 'men' ? 1.07 : person === 'kids' ? 0.95 : 1;
  return `${defs(id, color)}<g transform="translate(200 0) scale(${sx} 1) translate(-200 0)"><path d="${silhouette}" fill="${fill}" stroke="${line}" stroke-opacity=".35" stroke-width=".7"/>${detail}</g>`;
}

export function mannequin(person = 'women', items = []) {
  const id = 'body-' + (++serial);
  const isKid = person === 'kids';
  const sx = person === 'men' ? 1.07 : isKid ? 0.95 : 1;
  const body = `<g transform="translate(200 0) scale(${sx} 1) translate(-200 0)" fill="url(#${id})" stroke="#a9a591" stroke-opacity=".28" stroke-width=".8">
    <path d="M150 142Q133 141 130 168L116 246L106 319Q100 333 106 350L111 356L113 341L116 357L120 351L121 329L137 255L163 169Z"/>
    <path d="M250 142Q267 141 270 168L284 246L294 319Q300 333 294 350L289 356L287 341L284 357L280 351L279 329L263 255L237 169Z"/>
    <path d="M159 284Q145 316 156 383L162 457L162 592L157 620Q168 635 185 620L189 459L201 355L211 459L215 620Q232 635 243 620L238 592L238 457L244 383Q255 316 241 284Z"/>
    <path d="M185 101L184 121Q181 129 151 139Q143 153 153 190L164 245Q165 267 153 291Q200 316 247 291Q235 267 236 245L247 190Q257 153 249 139Q219 129 216 121L215 101Z"/>
    <path d="M164 602Q174 607 186 603L186 624Q182 634 163 636L144 636Q139 634 144 628L157 618Z"/>
    <path d="M214 603Q226 607 236 602L243 618L256 628Q261 634 256 636L237 636Q218 634 214 624Z"/>
  </g>`;

  const head = `<ellipse cx="200" cy="76" rx="${isKid ? 34 : 28}" ry="${isKid ? 39 : 40}" fill="url(#${id}-head)"/><path d="M178 102Q199 117 220 101" fill="none" stroke="#aea895" stroke-width=".6" stroke-opacity=".4"/>`;
  const selected = items
    .filter((a) => a && a.product)
    .slice()
    .sort((a, b) => SLOTS.indexOf(a.product.slot) - SLOTS.indexOf(b.product.slot));

  const layers = ['bottom', 'top', 'dress', 'outer']
    .map((slot) =>
      selected
        .filter((a) => a.product.slot === slot)
        .map((a) => garment(a.product, a.variant || 0, person))
        .join('')
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 700" role="img" aria-label="${esc(person)} mannequin outfit preview">
    <defs>
      <linearGradient id="${id}">
        <stop stop-color="#aaa693"/>
        <stop offset=".2" stop-color="#e9e5d7"/>
        <stop offset=".48" stop-color="#f0ecde"/>
        <stop offset=".72" stop-color="#d2ccba"/>
        <stop offset="1" stop-color="#aca796"/>
      </linearGradient>
      <radialGradient id="${id}-head" cx=".29" cy=".3" r=".8">
        <stop stop-color="#f3eee2"/>
        <stop offset=".6" stop-color="#dcd6c5"/>
        <stop offset="1" stop-color="#b3ad99"/>
      </radialGradient>
      <radialGradient id="${id}-shadow" cx=".5" cy=".5" r=".5">
        <stop stop-color="#364634" stop-opacity=".25"/>
        <stop offset="1" stop-color="#364634" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="200" cy="658" rx="105" ry="17" fill="url(#${id}-shadow)"/>
    <ellipse cx="200" cy="647" rx="72" ry="11" fill="#a7ae9440"/>
    <path d="M128 638V647Q200 670 272 647V638Z" fill="#c7cdba"/>
    <ellipse cx="200" cy="638" rx="72" ry="11" fill="#e3e7d8"/>
    <g transform="${isKid ? 'translate(0 118) scale(1 .82)' : 'translate(0 0)'}">
      ${body}${head}${layers}
    </g>
  </svg>`;
}

export function thumb(p, variant = 0) {
  let box = {
    top: '90 115 220 210',
    bottom: '120 270 160 345',
    outer: p.style === 'coat' ? '80 110 240 370' : '80 110 240 270',
    dress: '110 120 180 415'
  }[p.slot] || '90 115 220 210';

  if (p.style === 'shorts') box = '125 270 150 160';
  if (p.style === 'custom' && validAsset(p.asset)) {
    box = `${p.asset.x - 10} ${p.asset.y - 10} ${p.asset.width + 20} ${p.asset.height + 20}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" aria-hidden="true">${garment(p, variant, p.person || 'women')}</svg>`;
}
