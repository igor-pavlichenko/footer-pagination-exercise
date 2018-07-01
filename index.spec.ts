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

    it('should return string with 1 page only', () => {
      const result = pagination(1, 1, 1, 1);
      expect(result).to.equal('[1]');
    });

  });

});
