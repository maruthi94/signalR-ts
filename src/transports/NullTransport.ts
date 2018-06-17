import Transport from './Transport';
/**
 * A default, empty transport.
 */
export default class NullTransport extends Transport {
  static supportsKeepAlive = false;

  constructor(client: any, treaty: any, url: string, log = false) {
    super('null', client, treaty, log);
  }
  start(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  stop(): void {
    throw new Error('Method not implemented.');
  }
  send(data?: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
