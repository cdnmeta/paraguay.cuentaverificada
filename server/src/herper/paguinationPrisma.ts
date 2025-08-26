type CursorPaginationParams<T> = {
  where?: T;            // Filtros opcionales (any o interface)
  orderBy?: any;        // Ordenamiento, ejemplo: { id: 'asc' }
  take?: number;        // Cuántos traer
  cursor?: any;         // Cursor, ejemplo: { id: 45 }
  select?: any;         // Opcional: campos a seleccionar
  include?: any;       // Opcional: relaciones a incluir
};


export const getTakeCursorForPrisma = (query: any) => {
  const take = Number(query?.take) || 10;
  const cursor = query?.cursor ? { id: Number(query.cursor) } : undefined;
  return { take, cursor };
};

export async function cursorPaginatePrisma<T>(
  model: any,                   // Prisma model (ej: prisma.comercio)
  params: CursorPaginationParams<T>
) {
  const { where, orderBy, take = 10, cursor, select, include } = params;
  const results = await model.findMany({
    where,
    orderBy,
    include,
    take,
    skip: cursor ? 1 : 0,
    cursor,
    select,
  });

  // El "nextCursor" es el id del último resultado (si hay más)
  const nextCursor = results.length === take ? results[results.length - 1]?.id : null;

  return {
    data: results,
    nextCursor,
    hasMore: !!nextCursor,
  };
}
