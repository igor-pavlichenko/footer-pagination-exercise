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
  if (currentPage < 1 || currentPage > totalPages) {
    return 'currentPage out of bounds';
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
    start: boundariesApplied ? 1 : 0,
    // if boundaries are bigger than current page - limit the interval to current page
    end: boundariesApplied ? (
      (boundariesApplied < currentPage)
        ? boundariesApplied
        : currentPage - 1)
      : 0,
  };
  const leftSideAround = {
    // if boundaries are bigger than current page - care to avoid starting at negative numbers
    start: aroundApplied ? (
      (aroundApplied < currentPage)
        ? currentPage - aroundApplied
        : 1)
      : 0,
    end: aroundApplied ? currentPage - 1 : 0,
  };

  const rightSideBoundary = { start: 0, end: 0 };
  if (boundariesApplied) {
    // if current page isn't the last
    if (currentPage !== totalPages) {
      // then boundary starts n pages before totalPages which is the end
      rightSideBoundary.start = totalPages - (boundariesApplied - 1);
      // but if start is less than currentPage then it starts right after currentPage
      if (rightSideBoundary.start < currentPage) {
        rightSideBoundary.start = currentPage + 1;
      }
      // and ends at the last page which is = totalPages
      rightSideBoundary.end = totalPages;
      // but if after adding the amount, the END exceeds totalPages then just
      // make it = totalPages
    }
  }

  const rightSideAround = { start: 0, end: 0 };
  if (aroundApplied) {
    // if current page isn't the last page
    if (currentPage !== totalPages) {
      // then around starts at the page after currentPage
      rightSideAround.start = 1 + currentPage;
      // and ends specified pages after it
      rightSideAround.end = currentPage + aroundApplied;
      // but if after adding the amount, the END exceeds totalPages then just
      // make it = totalPages
      if (rightSideAround.end > totalPages) rightSideAround.end = totalPages;
    }
  }


  console.log(`leftSideBoundary: ${leftSideBoundary.start} - ${leftSideBoundary.end}`);
  console.log(`leftSideAround: ${leftSideAround.start} - ${leftSideAround.end}`);
  console.log(`rightSideAround: ${rightSideAround.start} - ${rightSideAround.end}`);
  console.log(`rightSideBoundary: ${rightSideBoundary.start} - ${rightSideBoundary.end}`);

  // get boundary pages for both sides
  // boundaries are sliced from external limits (far from current page)
  const boundariesLeftSide = [];
  if (leftSideBoundary.start && leftSideBoundary.end) {
    for (let i = leftSideBoundary.start; i <= leftSideBoundary.end; i++) {
      boundariesLeftSide.push(i);
    }
  }

  const boundariesRightSide = [];
  if (rightSideBoundary.start && rightSideBoundary.end) {
    for (let i = rightSideBoundary.start; i <= rightSideBoundary.end; i++) {
      boundariesRightSide.push(i);
    }
  }

  // get pages around the current page
  const aroundLeftSide = [];
  if (leftSideAround.start && leftSideAround.end) {
    for (let i = leftSideAround.start; i <= leftSideAround.end; i++) {
      aroundLeftSide.push(i);
    }
  }

  const aroundRightSide = [];
  if (rightSideAround.start && rightSideAround.end) {
    for (let i = rightSideAround.start; i <= rightSideAround.end; i++) {
      // console.log('pushing i: ', i);
      aroundRightSide.push(i);
    }
  }

  console.log('boundariesLeftSide: ', boundariesLeftSide);
  console.log('boundariesRightSide: ', boundariesRightSide);
  console.log('aroundLeftSide: ', aroundLeftSide);
  console.log('aroundRightSide: ', aroundRightSide);


  // filter duplicates and sort them
  const leftSideNoDuplicates = [...new Set<number>(
    [...boundariesLeftSide, ...aroundLeftSide].sort((a, b) => a - b),
  )];
  const rightSideNoDuplicates = [...new Set<number>(
    [...boundariesRightSide, ...aroundRightSide].sort((a, b) => a - b),
  )];
  console.log('\n');
  console.log('leftSideNoDuplicates: ', leftSideNoDuplicates);
  console.log('rightSideNoDuplicates: ', rightSideNoDuplicates);


  // add '...' when boundaries are hidden
  let leftSideString = '';
  if (leftSideNoDuplicates.length > 0) {
    // if there are no boundaries pages to left of current page
    if (!boundariesLeftSide.length) {
      // then if by going back 'around' pages from currentPage we
      // don't break the inferior limit
      if (currentPage - aroundApplied > 1) {
        // means there are pages to omit
        leftSideString += '...';
      }
    }
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
    // if there are no pages AROUND to left side
    if (!aroundLeftSide.length) {
      // check for boundaries
      // if closest page from boundaries is not current page
      if (((boundariesLeftSide.slice(-1)[0] + 1) !== currentPage)) {
        leftSideString += ' ...';
      }

    }
  }

  let rightSideString = '';
  // if there are pages to be printed AFTER currentPage
  if (rightSideNoDuplicates.length > 0) {
    // if there is stuff to concat after currentPage and it's not 'pages around'
    if (!aroundRightSide.length) {
      // then we must check whether the first page of the array comes
      // immediately after current page OR there are pages in between that
      // should be omitted with ...
      if (currentPage + 1 !== rightSideNoDuplicates[0]) {
        rightSideString += ' ...';
      }
    }
    // build the string that follows [currentPage]
    rightSideNoDuplicates.map((page, i) => {
      const prevPage = rightSideNoDuplicates[i - 1];
      let joinToken = ' ';
      if (prevPage && page - prevPage !== 1) {
        joinToken = ' ... ';
      }
      rightSideString += `${joinToken}${page}`;
    });
    // if there are no boundaries
    if (!boundariesRightSide.length) {
      // then there are around
      // only omit pages if after adding 'around' to current page number
      // it doesn't exceeds totalPages limit
      if (currentPage + aroundApplied < totalPages) {
        rightSideString += ' ...';
      }
    }
  }


  const finalResult = `${leftSideString} [${currentPage}]${rightSideString}`;


  return finalResult.trim();
};

// 1) - run ts-node
// 2) - copy-paste the import statement below and hit enter
// import { pagination } from './index'
// 3) - you can now run the pagination() function
// console.log('final result: ', pagination(500, 1000, 5, 5));
// console.log('final result: ', pagination(13, 20, 30, 30));
// console.log('final result: ', pagination(10, 20, 0, 2)); // 0 boundaries
// console.log('final result: ', pagination(10, 20, 2, 0)); // 0 around
// console.log('final result: ', pagination(20, 20, 0, 3));
// console.log('final result: ', pagination(1, 20, 0, 3));

// console.log('final result: ', pagination(4, Number.MAX_SAFE_INTEGER, 2, 2));
// console.log('final result: ', pagination(1, Number.MAX_SAFE_INTEGER, 2, 2));
// console.log('final result: ', pagination(4, 10, 99, 2));
// console.log('final result: ', pagination(2, 5, 1, 0));
// console.log('final result: ', pagination(4, 5, 0, 1));
console.log('final result: ', pagination(2, 5, 0, 1));

// console.log('final result: ', pagination(4, 10, 2, 0));

// console.log('final result: ', pagination(4, 5, 1, 0));

// console.log('final result: ', pagination(10, 20, 30, 3));
// console.log('final result: ', pagination(10, 20, 3, 30));
// console.log('final result: ', pagination(10, 20, 30, 30));
// console.log('final result 1: ', pagination(10, 99999, 3, 3));
// console.log('final result 2: ', pagination(10, 999999, 3, 3));
// console.log('final result 3: ', pagination(10, 9999999, 3, 3));
// console.log('final result 4: ', pagination(10, 99999999, 3, 3)); // slows down here
// console.log('final result 5: ', pagination(10, 999999999, 3, 3)); // crashes here
// console.log('final result 6: ', pagination(10, Number.MAX_SAFE_INTEGER, 3, 3));

