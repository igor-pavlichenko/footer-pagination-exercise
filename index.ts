import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
/**
 * We want a footer pagination so the user can navigate through the webapp.
 *
 * For the pages that we don’t want to link we want to show “...”
 *
 * Examples:
 *  - current_page = 4; total_pages = 5; boundaries = 1; around = 0
 *    - Expected result: 1 ... 4 5
 *  - current_page = 4; total_pages = 10; boundaries = 2; around = 2
 *    - Expected result: 1 2 3 4 5 6 ... 9 10
 *
 * @param currentPage _actual_ page
 * @param totalPages _total_ available pages
 * @param inputBoundaries how many pages we want to link in the beginning and in the end
 * @param inputAround how many pages we want to link before and after the actual page
 */
export const pagination = (
  currentPage: number,
  totalPages: number,
  inputBoundaries: number,
  inputAround: number,
) => {
  if (!Number.isSafeInteger(currentPage)
    || !Number.isSafeInteger(totalPages)
    || !Number.isSafeInteger(totalPages)
    || !Number.isSafeInteger(inputAround)) {
    return 'v8 limitation with Number.MAX_SAFE_INTEGER';
  }
  if (totalPages < 1 || inputBoundaries < 0 || inputAround < 0) {
    return '"inputBoundaries" & "inputAround" should not be negative'
      + 'AND "totalPages" should be greater than 0';
  }
  if (currentPage < 1 || currentPage > totalPages) {
    return 'currentPage out of bounds';
  }
  const MAX_ALLOWED_BOUNDARIES = 20;
  const MAX_ALLOWED_AROUND = 20;
  // do not allow big intervals of pages to be displayed
  // technically it is possible tho..
  let boundaries = inputBoundaries;
  if (inputBoundaries > MAX_ALLOWED_BOUNDARIES) {
    boundaries = MAX_ALLOWED_BOUNDARIES;
  }
  let around = inputAround;
  if (inputAround > MAX_ALLOWED_AROUND) {
    around = MAX_ALLOWED_AROUND;
  }

  // basic intervals calculations, just to avoid inefficient loops
  let boundariesIntervals = { left: null, right: null };
  if (boundaries) {
    boundariesIntervals = {
      left: {
        start: 1,
        end: boundaries,
      },
      right: {
        // +1 because pages start at 1, not 0
        start: (1 + totalPages) - boundaries,
        end: totalPages,
      },
    };
  }
  let aroundIntervals = { left: null, right: null };
  if (around) {
    aroundIntervals = {
      left: {
        start: currentPage - around,
        end: currentPage,
      },
      right: {
        start: currentPage,
        end: currentPage + around,
      },
    };
  }

  // stick all available page between
  // 'worst-case-scenario' boundaries and around ranges
  // in a set to discard duplicates
  const pagesSet = new Set<number>([currentPage]);
  [
    boundariesIntervals.left,
    aroundIntervals.left,
    aroundIntervals.right,
    boundariesIntervals.right,
  ].map((interval) => { // loop over our 'dirty' intervals and
    if (interval) { // if interval actually exists
      // naughty rxjs.. almost got me here
      // this is the part where we must enforce intervals that are
      // enough to cover whole range AND do not exceed boundaries of 1 - totalPages
      // rxjs's 'range(start, counter)' observable emits incremented numbers
      // starting at 'start'. The quantity of emitted numbers equals to 'counter'
      // therefore those values must be calculated very carefully
      const isEndOutsideBoundaries = interval.end > totalPages;
      const isStartOutsideBoundaries = interval.start < 1;
      const start = isStartOutsideBoundaries ? 1 : interval.start;
      const end = isEndOutsideBoundaries ? totalPages : interval.end;
      const count = (end + 1) - (start - 1);
      range(start, count)
        .pipe(
          // filter pages out of bounds
          filter(x => x >= 1 && x <= totalPages),
          // and those that are [for some reason, looking at you -> rxjs]
          // out of their own intervals
          filter(x => interval.start && x <= interval.end),
      )
        // add them to array after filters
        .subscribe(x => pagesSet.add(x));
    }
  });

  const uniquePagesSorted = [...pagesSet].sort((a, b) => a - b);
  // console.log('pagesSet: ', uniquePagesSorted);

  let finalResult = '';

  const { length } = uniquePagesSorted;
  uniquePagesSorted.map((page, i) => {
    const prevPage = uniquePagesSorted[i - 1];
    const nextPage = uniquePagesSorted[i + 1];

    let pageStr = ` ${page} `;

    // if it's the currentPage - wrap it in [ ]
    if (page === currentPage) {
      pageStr = ` [${page}] `;
    }

    // if it's not the page #1
    if (page !== 1) {
      // AND it's at index 0 - means there are pages hidden before it
      if (i === 0) {
        pageStr = ` ... ${pageStr} `;
      } else if (page !== (prevPage + 1)) {
      // if the previous page broke sequence
        pageStr = ` ... ${pageStr} `;
      }
    }

    // if it's not the last page
    if (page !== totalPages) {
      // if it's at the last index of array - means there are hidden pages after it
      if (i === length - 1) {
        pageStr = ` ${pageStr} ...`;
      } else if (i < (length - 1) && page !== (nextPage - 1)) {
      // if the next page will break sequence
        pageStr = ` ${pageStr} ...`;
      }
    }

    finalResult += pageStr;
  });

  // replace duplicated spaces with single space and remove spaces from edges
  finalResult = finalResult
    .replace(/\s+/g, ' ') // replace extended white spaces with single space
    .replace('... ...', '...') // replace duplicated dots ... ...
    .replace('... ...', '...') // this is a bit ugly, I know :\
    .trim();
  return finalResult;
};
