import { describe, expect, it, jest } from '@jest/globals';
import { handler404, handlerError } from './handlers';

describe('handler', () => {
  it('should handle 404', async () => {
    /** @type any */ // overwriting type for testing purposes
    const res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
    handler404(null, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.render).toHaveBeenCalledWith('error', {
      title: 'Síða fannst ekki',
    });
  });

  it('should handle error', async () => {
    /** @type any */ // overwriting type for testing purposes
    const res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
    const err = new Error('error');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    handlerError(err, null, res, null);

    expect(spy).toHaveBeenCalledWith('error occured', err, null);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('error', {
      title: 'Villa kom upp',
    });

    spy.mockRestore();
  });
});