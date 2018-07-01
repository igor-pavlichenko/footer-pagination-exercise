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
 * @param boundaries how many pages we want to link in the beginning and in the end
 * @param around how many pages we want to link before and after the actual page
 */
export const pagination = (
  currentPage: number,
  totalPages: number,
  boundaries: number,
  around: number,
) => {
  if (!Number.isSafeInteger(currentPage)
    || !Number.isSafeInteger(totalPages)
    || !Number.isSafeInteger(totalPages)
    || !Number.isSafeInteger(around)) {
    return 'v8 limitation with Number.MAX_SAFE_INTEGER';
  }
  const MAX_ALLOWED_BOUNDARIES = 20;
  const MAX_ALLOWED_AROUND = 20;
  // do not allow big intervals of pages to be displayed
  // technically it is possible tho..
  let boundariesApplied = boundaries;
  if (boundaries > MAX_ALLOWED_BOUNDARIES) {
    boundariesApplied = MAX_ALLOWED_BOUNDARIES;
    // console.log('using MAX allowed boundary: ', MAX_ALLOWED_BOUNDARIES);
  }
  let aroundApplied = around;
  if (around > MAX_ALLOWED_AROUND) {
    // console.log('using MAX allowed around: ', MAX_ALLOWED_AROUND);
    aroundApplied = MAX_ALLOWED_AROUND;
  }

  // calculate boundaries and around intervals using simple math
  const leftSideBoundary = {
    start: 1,
    // if boundaries are bigger than current page - limit the interval to current page
    end: (boundariesApplied < currentPage) ? boundariesApplied : currentPage - 1,
  };
  const leftSideAround = {
    // if boundaries are bigger than current page - care to avoid starting at negative numbers
    start: (aroundApplied < currentPage) ? currentPage - aroundApplied : 1,
    end: currentPage - 1,
  };

  const rightSideBoundary = {
    // we start from page 1 and not 0.. must skip 1
    start: (boundariesApplied < currentPage)
      ? totalPages - boundariesApplied + 1
      : currentPage + 1,
    end: totalPages,
  };
  const rightSideAround = {
    start: 1 + currentPage,
    end: (aroundApplied < currentPage) ? currentPage + aroundApplied : totalPages,
  };

  // get boundary pages for both sides
  // boundaries are sliced from external limits (far from current page)
  const boundariesLeftSide = [];
  for (let i = leftSideBoundary.start; i <= leftSideBoundary.end; i++) {
    boundariesLeftSide.push(i);
  }
  const boundariesRightSide = [];
  for (let i = rightSideBoundary.start; i <= rightSideBoundary.end; i++) {
    boundariesRightSide.push(i);
  }


  // get pages around the current page
  const aroundLeftSide = [];
  for (let i = leftSideAround.start; i <= leftSideAround.end; i++) {
    aroundLeftSide.push(i);
  }
  const aroundRightSide = [];
  for (let i = rightSideAround.start; i <= rightSideAround.end; i++) {
    aroundRightSide.push(i);
  }


  // filter duplicates and sort them
  const leftSideNoDuplicates = [...new Set<number>(
    [...boundariesLeftSide, ...aroundLeftSide].sort((a, b) => a - b),
  )];
  const rightSideNoDuplicates = [...new Set<number>(
    [...boundariesRightSide, ...aroundRightSide].sort((a, b) => a - b),
  )];


  // add '...' when boundaries are hidden
  let leftSideString = boundariesLeftSide.length ? '' : '...';
  // build the string that precedes the [currentPage]
  leftSideNoDuplicates.map((page, i) => {
    // the logic is
    // while iterating pages to concatenate them all in a single string
    // to compare previous page to current and
    // if the difference between prev page and current is greater than 1
    // means it's a sequence breaking - add the three dots
    const prevPage = leftSideNoDuplicates[i - 1];
    let joinToken = ' ';
    if (prevPage && page - prevPage > 1) {
      joinToken = ' ... ';
    }
    leftSideString += `${joinToken}${page}`;
  });
  // add '...' when around are hidden
  if (!aroundLeftSide.length) leftSideString += '...';


  let rightSideString = '';
  // build the string that follows [currentPage]
  rightSideNoDuplicates.map((page, i) => {
    const prevPage = rightSideNoDuplicates[i - 1];
    let joinToken = ' ';
    if (prevPage && page - prevPage !== 1) {
      joinToken = ' ... ';
    }
    rightSideString += `${joinToken}${page}`;
  });
  if (!boundariesRightSide.length) rightSideString += ' ...';

  // concat the selected page
  const finalResult = `${leftSideString} [${currentPage}]${rightSideString}`;


  return finalResult.trim();
};

// 1) - run ts-node
// 2) - copy-paste the import statement below and hit enter
// import { pagination } from './index'
// 3) - you can now run the pagination() function
console.log('final result: ', pagination(500, 1000, 5, 5));
console.log('final result: ', pagination(13, 20, 30, 30));
console.log('final result: ', pagination(10, 20, 0, 2));
// console.log('final result: ', pagination(21, 20, 2, 3));
// console.log('final result: ', pagination(10, 20, 30, 3));
// console.log('final result: ', pagination(10, 20, 3, 30));
// console.log('final result: ', pagination(10, 20, 30, 30));
// console.log('final result 1: ', pagination(10, 99999, 3, 3));
// console.log('final result 2: ', pagination(10, 999999, 3, 3));
// console.log('final result 3: ', pagination(10, 9999999, 3, 3));
// console.log('final result 4: ', pagination(10, 99999999, 3, 3)); // slows down here
// console.log('final result 5: ', pagination(10, 999999999, 3, 3)); // crashes here
// console.log('final result 6: ', pagination(10, Number.MAX_SAFE_INTEGER, 3, 3));

