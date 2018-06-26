export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isObject(value: any): value is object {
  return typeof value === 'object';
}

export function isFunction(value: any): value is Function {
  return value instanceof Function || typeof value === 'function';
}

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

export function mapObj(value: object): Array<any> {
  const result: any[] = [];
  if (isUndefinedOrNull(value) && !isObject(value)) {
    return result;
  }

  for (const x of Object.keys(value)) {
    result.push(value[x]);
  }

  return result;
}

export function sumOfArr(value: any[]): number {
  if (isUndefinedOrNull(value) && Array.isArray(value) && value.length === 0) {
    return 0;
  }

  return value.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
}

export function isUndefinedOrNull(value: any): boolean {
  return typeof value === 'undefined' || value === null;
}

export interface INegotiationResponse {
  ConnectionId: string;
  ConnectionToken: string;
  DisconnectTimeout: number;
  KeepAliveTimeout: number;
  ProtocolVersion: string;
  TransportConnectTimeout: number;
  TryWebSockets: boolean;
  Url: string;
}

export interface EventObservers {
  [propName: string]: any;
}

export const TransportNameMap = {
  WebSocketTransport: 'webSockets',
  ServerSentEventsTransport: 'serverSentEvents',
  LongPollingTransport: 'longPolling',
  NullTransport: 'null',
};
