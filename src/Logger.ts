interface ILogger {
  log(primaryMessage: string, ...supportingData: any[]): void;
  debug(primaryMessage: string, ...supportingData: any[]): void;
  error(primaryMessage: string, ...supportingData: any[]): void;
  info(primaryMessage: string, ...supportingData: any[]): void;
  warn(primaryMessage: string, ...supportingData: any[]): void;
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
    throw new Error('Method not implemented.');
  }
  debug(primaryMessage: string, ...supportingData: any[]): void {
    throw new Error('Method not implemented.');
  }
  error(primaryMessage: string, ...supportingData: any[]): void {
    throw new Error('Method not implemented.');
  }
  info(primaryMessage: string, ...supportingData: any[]): void {
    throw new Error('Method not implemented.');
  }
  warn(primaryMessage: string, ...supportingData: any[]): void {
    throw new Error('Method not implemented.');
  }

  emitMessage(msgType: LogType, msg: string, supportingDetails: any[]) {
    if (!this._enabled) {
      return;
    }

    if (supportingDetails.length > 0) {
      console[msgType](`${this._name.toUpperCase}: ${msg}`, supportingDetails);
    } else {
      console[msgType](`${this._name.toUpperCase}: ${msg}`);
    }
  }
}
