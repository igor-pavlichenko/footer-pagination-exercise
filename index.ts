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
  // console.log('currentPage: ', currentPage);
  // console.log('totalPages: ', totalPages);
  // console.log('boundaries: ', boundaries);
  // console.log('around: ', around);
  const leftSide = [];
  const rightSide = [];
  // split pages to left and to right of currentPage
  for (let page = 1; page <= totalPages; page++) {
    if (page < currentPage) {
      leftSide.push(page);
    }
    if (page > currentPage) {
      rightSide.push(page);
    }
  }

  // get boundary pages for both sides
  // boundaries are sliced from external limits (far from current page)
  const boundariesStart = leftSide.slice(0, boundaries);
  const boundariesEnd = rightSide.slice(rightSide.length - boundaries);


  // get pages around the current page
  const aroundStart = leftSide.slice(leftSide.length - around);
  const aroundEnd = rightSide.slice(0, around);


  // filter duplicates and sort them
  const leftSideNoDuplicates = [...new Set<number>(
    [...boundariesStart, ...aroundStart].sort((a, b) => a - b),
  )];
  const rightSideNoDuplicates = [...new Set<number>(
    [...boundariesEnd, ...aroundEnd].sort((a, b) => a - b),
  )];


  // let allPages = '';

  // leftSide.map(page => allPages += page + ' ');
  // allPages += `[${currentPage}] `;
  // rightSide.map(page => allPages += page + ' ');
  // console.log('all pages with current highlighted: ', allPages);


  let leftSideString = '';
  // build the string that precedes the [currentPage]
  leftSideNoDuplicates.map((page, i) => {
    // the logic is
    // while iterating pages to concatenate them all in a single string
    // to compare previous page to current and
    // if the difference between prev page and current is greater than 1
    // means it's a sequence breaking - add the three dots
    const prevPage = leftSideNoDuplicates[i - 1];
    let joinString = ' ';
    if (prevPage && page - prevPage > 1) {
      joinString = ' ... ';
    }
    leftSideString += `${joinString}${page}`;
  });

  let rightSideString = '';
  // build the string that follows [currentPage]
  rightSideNoDuplicates.map((page, i) => {
    const prevPage = rightSideNoDuplicates[i - 1];
    let joinString = ' ';
    if (prevPage && page - prevPage !== 1) {
      joinString = ' ... ';
    }
    rightSideString += `${joinString}${page}`;
  });
  // concat the selected page
  const finalResult = `${leftSideString} [${currentPage}]${rightSideString}`;


  return finalResult.trim();
};


// import { pagination } from './index'
// console.log('final result: ', pagination(10, 20, 2, 3));
