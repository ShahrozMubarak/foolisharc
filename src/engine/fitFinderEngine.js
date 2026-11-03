export function normalizeFitInputs(input = {}) {
  const factor = input.measurementUnit === 'in' ? 2.54 : 1;
  const cm = (key) => {
    const value =
      input.measurements?.[key + 'Cm'] ?? Number(input[key]) * factor;
    return Number.isFinite(value) && value > 0
      ? Math.round(value * 10) / 10
      : null;
  };
  return { chestCm: cm('chest'), waistCm: cm('waist'), hipCm: cm('hip') };
}

export function recommendProductSize(input, product) {
  const measurements = normalizeFitInputs(input);
  const fields =
    product?.slot === 'bottom' ? ['waist', 'hip'] : ['chest', 'waist'];
  const matches = [];
  for (const row of product?.sizeChart || []) {
    if (!product.sizes?.includes(row.size)) continue;
    const distances = [];
    let outside = false;
    for (const field of fields) {
      const value = measurements[field + 'Cm'];
      const low = row[field + 'Min'],
        high = row[field + 'Max'];
      if (
        value == null ||
        !Number.isFinite(low) ||
        !Number.isFinite(high) ||
        high < low
      )
        continue;
      if (value < low || value > high) outside = true;
      distances.push(
        Math.abs(value - (low + high) / 2) / Math.max(1, high - low),
      );
    }
    if (!outside && distances.length)
      matches.push({
        size: row.size,
        score: distances.reduce((a, b) => a + b, 0) / distances.length,
      });
  }
  matches.sort((a, b) => a.score - b.score);
  return matches.length
    ? { recommendedSize: matches[0].size, confidence: 'chart match' }
    : { recommendedSize: null, confidence: 'No matching chart range' };
}
