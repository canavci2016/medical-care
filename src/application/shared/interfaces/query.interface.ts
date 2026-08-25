export interface Query<T = number> {
  notIn?: T[];
  in?: T[];
  eq?: T;
  neq?: T;
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  like?: T;
  notLike?: T;
  notNull?: boolean;
}

export type OrderDirection = 'asc' | 'desc';
