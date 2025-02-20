import { describe, expect, it, jest } from '@jest/globals';
import { Logger } from './logger';


describe('logger', () => {
  it('should log info', async () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    new Logger().info('info');
    expect(spy).toHaveBeenCalledWith('info');
    spy.mockRestore();
  });

  it('should log error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    new Logger().error('error');
    expect(spy).toHaveBeenCalledWith('error');
    spy.mockRestore();
  });

  it('should not log info if silent', async () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const silentLogger = new Logger(true);
    silentLogger.info('info');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should not log error if silent', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const silentLogger = new Logger(true);
    silentLogger.error('error');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});