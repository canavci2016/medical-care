export interface Query {
  notIn?: number[];
  in?: number[];
  eq?: number;
  neq?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  notNull?: boolean;
}
