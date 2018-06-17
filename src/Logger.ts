interface ILogger {
  log(primaryMessage: string, ...supportingData: any[]): void;
  debug(primaryMessage: string, ...supportingData: any[]): void;
  error(primaryMessage: string, ...supportingData: any[]): void;
  info(primaryMessage: string, ...supportingData: any[]): void;
  warn(primaryMessage: string, ...supportingData: any[]): void;
}

enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Log = 'log',
  Warn = 'warn',
  Error = 'error',
}

type LogType = 'log' | 'debug' | 'error' | 'warn' | 'info';

export class Logger implements ILogger {
  private _name: string;
  private _enabled: boolean;
  constructor(name: string, enabled = false) {
    this._name = name;
    this._enabled = enabled;
  }
  log(primaryMessage: string, ...supportingData: any[]): void {
    this.emitMessage(LogLevel.Log, primaryMessage, supportingData);
  }
  debug(primaryMessage: string, ...supportingData: any[]): void {
    this.emitMessage(LogLevel.Debug, primaryMessage, supportingData);
  }
  error(primaryMessage: string, ...supportingData: any[]): void {
    this.emitMessage(LogLevel.Error, primaryMessage, supportingData);
  }
  info(primaryMessage: string, ...supportingData: any[]): void {
    this.emitMessage(LogLevel.Info, primaryMessage, supportingData);
  }
  warn(primaryMessage: string, ...supportingData: any[]): void {
    this.emitMessage(LogLevel.Warn, primaryMessage, supportingData);
  }

  emitMessage(msgType: LogType, msg: string, supportingDetails: any[]) {
    if (!this._enabled) {
      return;
    }

    if (supportingDetails.length > 0) {
      console[msgType](
        `${this._name.toUpperCase()}: ${msg}`,
        supportingDetails
      );
    } else {
      console[msgType](`${this._name.toUpperCase()}: ${msg}`);
    }
  }
}
