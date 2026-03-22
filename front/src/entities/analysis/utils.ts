export type SeriesRecord = Record<
  string,
  Array<string | number | null | undefined>
>;

export const toChartData = <T extends SeriesRecord>(series: T) => {
  const keys = Object.keys(series);

  if (keys.length === 0) {
    return [];
  }

  const maxLength = Math.max(...keys.map((key) => series[key]?.length ?? 0));

  return Array.from({ length: maxLength }, (_, index) => {
    const row: Record<string, string | number | null | undefined> = {};

    for (const key of keys) {
      row[key] = series[key]?.[index];
    }

    return row;
  });
};
