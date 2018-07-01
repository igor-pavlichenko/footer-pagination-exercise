import { pagination } from './index';
import { expect } from 'chai';
import 'mocha';

describe('footer pagination', () => {

  describe('trivial anti-dummy tests', () => {

    it('should return string with 1 page only', () => {
      const result = pagination(1, 1, 1, 1);
      expect(result).to.equal('[1]');
    });

  });

  describe('more specific use-cases', () => {

    it('example #1 from pdf', () => {
      const result = pagination(4, 5, 1, 0);
      expect(result).to.equal('1 ... [4] 5');
    });

    it('example #2 from pdf', () => {
      const result = pagination(4, 10, 2, 2);
      expect(result).to.equal('1 2 3 [4] 5 6 ... 9 10');
    });

  });

});
