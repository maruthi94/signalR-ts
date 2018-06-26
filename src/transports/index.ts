import ServerSentEventsTransport from './ServerSentEventsTransport';
import LongPollingTransport from './LongPollingTransport';
import WebSocketTransport from './WebSocketTransport';
import NullTransport from './NullTransport';

export function AvailableTransports() {
  return [
    WebSocketTransport,
    ServerSentEventsTransport,
    LongPollingTransport,
    NullTransport,
  ];
}
