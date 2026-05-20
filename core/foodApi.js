/**
 * Open Food Facts integration.
 * Free, no API key, no rate limits within reasonable use.
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

const BASE = "https://world.openfoodfacts.org";

/* Normalize an Open Food Facts product object into our shape:
   { id, name, brand, kcalPer100, proteinPer100, defaultGrams, barcode }

   Energy handling: OFF data is community-contributed and sometimes wrong.
   Strategy:
     1. If both kcal and kJ are present, cross-check. If kJ/4.184 differs
        from the stored kcal by >15%, trust the kJ (less often miskeyed —
        on EU packaging, kJ is the primary value).
     2. If only kcal is present, use it (with sanity bounds).
     3. If only kJ is present, convert.
     4. The legacy `energy_100g` field has ambiguous units across products,
        so we ignore it entirely.

   Sanity: pure fat is 900 kcal/100g, the absolute ceiling for any food. */
function normalize(p) {
  if (!p) return null;
  const nutr = p.nutriments || {};

  const kcalField = nutr["energy-kcal_100g"];
  const kjField   = nutr["energy-kj_100g"];
  const kcalNum = kcalField != null ? Number(kcalField) : null;
  const kjNum   = kjField   != null ? Number(kjField)   : null;

  let kcal = null;
  if (kcalNum != null && !isNaN(kcalNum) && kjNum != null && !isNaN(kjNum)) {
    // Both present — cross-check
    const kcalFromKj = kjNum / 4.184;
    const diff = Math.abs(kcalNum - kcalFromKj) / Math.max(kcalFromKj, 1);
    if (diff > 0.15) {
      // Mismatch — trust the kJ value (kcal field is often miskeyed)
      kcal = kcalFromKj;
    } else {
      kcal = kcalNum;
    }
  } else if (kcalNum != null && !isNaN(kcalNum)) {
    kcal = kcalNum;
  } else if (kjNum != null && !isNaN(kjNum)) {
    kcal = kjNum / 4.184;
  }
  if (kcal == null || isNaN(kcal)) return null;
  // Sanity: implausible final value, skip the product
  if (kcal < 0 || kcal > 950) return null;

  const protein = nutr["proteins_100g"];
  if (protein == null) return null;

  const name = (p.product_name_nl || p.product_name || "").trim();
  if (!name) return null;

  const brand = (p.brands || "").split(",")[0].trim();
  const serving = p.serving_quantity ? Number(p.serving_quantity) : null;

  return {
    id: p.code || p._id,
    name,
    brand,
    kcalPer100: Math.round(kcal),
    proteinPer100: Math.round(Number(protein) * 10) / 10,
    defaultGrams: serving || 100,
    barcode: p.code || null
  };
}

/* Lookup by barcode. Returns the product or null if not found / no macros. */
export async function lookupBarcode(code) {
  const url = `${BASE}/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,product_name_nl,brands,nutriments,serving_quantity`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1) return null;
  return normalize(data.product);
}

/* Free-text search, biased toward Dutch products. */
export async function searchProducts(query, max = 20) {
  if (!query || !query.trim()) return [];
  const url = `${BASE}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${max}&tagtype_0=countries&tag_contains_0=contains&tag_0=netherlands&fields=code,product_name,product_name_nl,brands,nutriments,serving_quantity`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const products = (data.products || []).map(normalize).filter(Boolean);
  return products;
}
