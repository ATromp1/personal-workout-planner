/**
 * Open Food Facts integration.
 * Free, no API key, no rate limits within reasonable use.
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

const BASE = "https://world.openfoodfacts.org";

/* Normalize an Open Food Facts product object into our shape:
   { id, name, brand, kcalPer100, proteinPer100, defaultGrams, barcode } */
function normalize(p) {
  if (!p) return null;
  const nutr = p.nutriments || {};
  let kcal = nutr["energy-kcal_100g"];
  if (kcal == null) {
    const kj = nutr["energy_100g"] || nutr["energy-kj_100g"];
    if (kj != null) kcal = kj / 4.184;
  }
  const protein = nutr["proteins_100g"];
  if (kcal == null || protein == null) return null;

  const name = (p.product_name_nl || p.product_name || "").trim();
  if (!name) return null;

  const brand = (p.brands || "").split(",")[0].trim();
  const serving = p.serving_quantity ? Number(p.serving_quantity) : null;

  return {
    id: p.code || p._id,
    name,
    brand,
    kcalPer100: Math.round(kcal),
    proteinPer100: Math.round(protein * 10) / 10,
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
