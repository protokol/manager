import { PaginationMeta } from '@app/@shared/interfaces/table.types';

const getMetaFixture = (length: number = 100): PaginationMeta => ({
  totalCountIsEstimate: false,
  self: '',
  previous: undefined,
  next: undefined,
  last: '',
  first: '',
  count: length,
  totalCount: length,
  pageCount: length,
});

export { getMetaFixture };
