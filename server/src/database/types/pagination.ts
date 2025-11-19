export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationCalc {
  page: number;
  limit: number;
  offset: number;
}


export interface PaginationMetaInput {
  page: number;
  limit: number;
  total: number;
}

export function buildPagination(
  query: PaginationInput,
  defaultLimit = 10,
  maxLimit = 100,
): PaginationCalc {
  const page = query.page && query.page > 0 ? query.page : 1;

  let limit = query.limit && query.limit > 0 ? query.limit : defaultLimit;
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}




export function buildPaginationMeta({ page, limit, total }: PaginationMetaInput) {
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

