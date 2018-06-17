// type TransportType = 'WebSocketTransport'|'ServerSentEventsTransport'|'LongPollingTransport'|'NullTransport';

export const enum TransportType {
  WebSocketTransport = 'WebSocketTransport',
  ServerSentEventsTransport = 'ServerSentEventsTransport',
  LongPollingTransport = 'LongPollingTransport',
  NullTransport = 'NullTransport',
}
export interface IConfig {
  url: string;
  transport?: string;
  logging?: boolean;
}
