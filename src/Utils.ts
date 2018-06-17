// type TransportType = 'WebSocketTransport'|'ServerSentEventsTransport'|'LongPollingTransport'|'NullTransport';

export enum TransportType {
  WebSocketTransport = 'WebSocketTransport',
  ServerSentEventsTransport = 'ServerSentEventsTransport',
  LongPollingTransport = 'LongPollingTransport',
  NullTransport = 'NullTransport',
}
export interface IConfig {
  url: string;
  transport: TransportType;
  logging: boolean;
}
