import * as index from './index';

describe('index', () => {
  it('should export redoc-try-out-module', () => {
    expect(index).toHaveProperty('RedocTryOutModule');
  });
});
