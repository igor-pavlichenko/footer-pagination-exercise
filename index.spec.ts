import { pagination } from './index';
import { expect } from 'chai';
import 'mocha';

describe('footer pagination', () => {

  it('should return string with 1 page only', () => {
    const result = pagination(1, 1, 1, 1);
    expect(result).to.equal('[1]');
  });

  it('example #1 from pdf', () => {
    const result = pagination(4, 5, 1, 0);
    expect(result).to.equal('1 ... [4] 5');
  });
  it('example #1 from pdf mirrored', () => {
    const result = pagination(2, 5, 1, 0);
    expect(result).to.equal('1 [2] ... 5');
  });

  it('example #2 from pdf', () => {
    const result = pagination(4, 10, 2, 2);
    expect(result).to.equal('1 2 3 [4] 5 6 ... 9 10');
  });
  it('example #2 from pdf mirrored', () => {
    const result = pagination(7, 10, 2, 2);
    expect(result).to.equal('1 2 ... 5 6 [7] 8 9 10');
  });

  it('"currentPage" in the middle, large amount of pages, small "around" and "boundaries"', () => {
    const result = pagination(500, 1000, 5, 5);
    expect(result).to.equal(
      '1 2 3 4 5 ... 495 496 497 498 499 [500] 501 502 503 504 505 ... 996 997 998 999 1000',
    );
  });

  it('"boundaries" bigger than "totalPages"', () => {
    const result = pagination(4, 10, 99, 2);
    expect(result).to.equal('1 2 3 [4] 5 6 7 8 9 10');
  });

  it('"around" bigger than "totalPages"', () => {
    const result = pagination(4, 10, 2, 99);
    expect(result).to.equal('1 2 3 [4] 5 6 7 8 9 10');
  });

  it('both "around" and "boundaries" bigger than "totalPages"', () => {
    const result = pagination(4, 10, 99, 99);
    expect(result).to.equal('1 2 3 [4] 5 6 7 8 9 10');
  });

  it('current page at the edge (START) all pages visible', () => {
    const result = pagination(1, 5, 2, 2);
    expect(result).to.equal('[1] 2 3 4 5');
  });

  it('current page at the edge (END) all pages visible', () => {
    const result = pagination(5, 5, 2, 2);
    expect(result).to.equal('1 2 3 4 [5]');
  });

  it('current page at the edge (START), pages in the middle hidden', () => {
    const result = pagination(1, 10, 2, 2);
    expect(result).to.equal('[1] 2 3 ... 9 10');
  });

  it('currentPage out of bounds (greater)', () => {
    const result = pagination(11, 10, 2, 2);
    expect(result).to.equal('currentPage out of bounds');
  });
  it('currentPage out of bounds (less)', () => {
    const result = pagination(0, 10, 2, 2);
    expect(result).to.equal('currentPage out of bounds');
  });

  it('"boundaries" = 0', () => {
    const result = pagination(4, 10, 0, 2);
    expect(result).to.equal('... 2 3 [4] 5 6 ...');
  });

  it('"around" = 0', () => {
    const result = pagination(4, 10, 2, 0);
    expect(result).to.equal('1 2 ... [4] ... 9 10');
  });

  it('"boundaries" = 0 and currentPage at the edge (START)', () => {
    const result = pagination(1, 10, 0, 2);
    expect(result).to.equal('[1] 2 3 ...');
  });

  it('"boundaries" = 0 and currentPage at the edge (END)', () => {
    const result = pagination(10, 10, 0, 2);
    expect(result).to.equal('... 8 9 [10]');
  });

  it('"around" = 0 and currentPage at the edge (START)', () => {
    const result = pagination(1, 10, 2, 0);
    expect(result).to.equal('[1] ... 9 10');
  });

  it('"around" = 0 and currentPage at the edge (END)', () => {
    const result = pagination(10, 10, 2, 0);
    expect(result).to.equal('1 2 ... [10]');
  });

  it('big number of "totalPages"', () => {
    const result = pagination(4, Number.MAX_SAFE_INTEGER, 2, 2);
    expect(result).to.equal(
      `1 2 3 [4] 5 6 ... ${Number.MAX_SAFE_INTEGER - 1} ${Number.MAX_SAFE_INTEGER}`,
    );
  });

  it('big number of "totalPages", "currentPage" at the edge (START)', () => {
    const result = pagination(1, Number.MAX_SAFE_INTEGER, 2, 2);
    expect(result).to.equal(
      `[1] 2 3 ... ${Number.MAX_SAFE_INTEGER - 1} ${Number.MAX_SAFE_INTEGER}`,
    );
  });

  it('big number of "totalPages", "currentPage" at the edge (END)', () => {
    const result = pagination(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 2, 2);
    expect(result).to.equal(
      `1 2 ... ${Number.MAX_SAFE_INTEGER - 2} ${Number.MAX_SAFE_INTEGER - 1}` +
      ` [${Number.MAX_SAFE_INTEGER}]`,
    );
  });

  it('UNSAFE(much bigger) number of "totalPages"', () => {
    const unsafeInt = 99999999999999999999999999999999;
    const result = pagination(4, unsafeInt, 2, 2);
    expect(result).to.equal(
      'v8 limitation with Number.MAX_SAFE_INTEGER',
      /**
       * v8 and, therefore, node behave poorly when operating with numbers
       * greater than Number.MAX_SAFE_INTEGER
       * which equals to 9,007,199,254,740,991... ~9 quadrillions
       *
       * In sake of theoretical possibilities lets look at that number in a
       * context one google search about some VERY popular topic which might return
       * at most ~100,000,000 results. Splitting that in pages of 10 results per page
       * we get 10,000,000 pages - not even close.
       *
       * Or compare that to the Total number of Websites which, according
       * to http://internetlivestats.com, is 1,890,443,125 as of July 1, 2018.
       *
       *  9,007,199,254,740,991 - Number.MAX_SAFE_INTEGER
       *          1,890,443,125 - Total number of Websites
       *            100,000,000 - search results on a popular topic
       *             10,000,000 - pages needed to fit those results
       */
    );
  });
  // node behaves unexpectedly
  // 10,220,000,000
  // 9,007,199,254,740,991
});
