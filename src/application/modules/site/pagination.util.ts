type QueryValue = string | number | boolean | undefined | null;

type BasePagination = {
  totalPages: number;
};

export function buildPagination<
  TPagination extends BasePagination,
  TQuery extends Record<string, QueryValue>,
>(pagination: TPagination, query: TQuery) {
  const queryEntries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );

  const queryParams = Object.fromEntries(
    queryEntries.map(([key, value]) => [key, String(value)]),
  );

  return {
    ...pagination,
    query,
    pages: Array.from({ length: pagination.totalPages }, (_, i) => {
      const page = (i + 1).toString();

      return {
        page,
        url: `?${new URLSearchParams({
          ...queryParams,
          page,
        })}`,
      };
    }),
  };
}
