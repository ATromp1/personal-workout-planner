/**
 * Open Food Facts integration.
 * Free, no API key, no rate limits within reasonable use.
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

const BASE = "https://world.openfoodfacts.org";

/* Normalize an Open Food Facts product object into our shape:
   { id, name, brand, kcalPer100, proteinPer100, defaultGrams, barcode }

   Energy handling: OFF has multiple energy fields with inconsistent units
   across products. The only fields with reliably-known units are
   `energy-kcal_100g` (kcal) and `energy-kj_100g` (kJ).
   The generic `energy_100g` is ambiguous and should NOT be trusted.

   Sanity check: pure fat is 900 kcal/100g, the absolute ceiling for food.
   A value above 900 is almost certainly kJ leaking through. */
function normalize(p) {
  if (!p) return null;
  const nutr = p.nutriments || {};

  let kcal = null;
  if (nutr["energy-kcal_100g"] != null) {
    kcal = Number(nutr["energy-kcal_100g"]);
  } else if (nutr["energy-kj_100g"] != null) {
    kcal = Number(nutr["energy-kj_100g"]) / 4.184;
  }
  // Reject if no reliable energy data
  if (kcal == null || isNaN(kcal)) return null;
  // Sanity: if it's clearly a kJ value masquerading as kcal (>900), convert
  if (kcal > 900) kcal = kcal / 4.184;
  // After correction, reject anything still implausible
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
