/** Standard envelope returned by Neocore backends (`{ data, message }`). */
export interface ServiceResponseInterface<T> {
  data: T;
  message: string;
}

/** Standard paginated payload returned inside `data`. */
export interface PaginationResponseInterface<T> {
  page: number;
  records: T;
  total: number;
  totalPage: number;
}
