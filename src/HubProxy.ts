import Protocol from './Protocol';
import EventEmitter from './EventEmitter';
import { Logger } from './Logger';
import { isFunction, isUndefined } from './Helper';
/**
 * A proxy that can be used to invoke methods server-side.
 * @class
 */
export default class HubProxy extends EventEmitter {
  // funcs: any;
  // server: any;
  private _state: any;
  private _client: any;
  private _hubName: string;
  private _logger: any;

  /**
   * Initializes the proxy given the current client and the hub that the client is connected to.
   * @param {Client} client The current HubClient that is initialized.
   * @param {string} hubName The name of the hub that the user wishes to generate a proxy for.
   * @constructor
   */
  constructor(client: any, hubName: string, log = false) {
    super();
    this._state = {};
    this._client = client;
    this._hubName = hubName;
    this._logger = new Logger(hubName, log);
    // this.funcs = {};
    // this.server = {};
  }

  /**
   * Invokes a server hub method with the given arguments.
   * @param {string} methodName The name of the server hub method
   * @param {Object} args The arguments to pass into the server hub method.
   * @returns {*} The return statement invokes the send method, which sends the information the server needs to invoke the correct method.
   * @function
   */
  invoke(methodName: string, ...args: Array<any>): Promise<any> {
    const data: any = {
      H: this._hubName,
      M: methodName,
      A: args.map((a) => (isFunction(a) || isUndefined(a) ? null : a)),
      I: this._client.invocationCallbackId,
    };

    return new Promise((resolve, reject) => {
      const callback = (minResult: any) => {
        const result = Protocol.expandServerHubResponse(minResult);

        // Update the hub state
        this._state = Object.assign({}, this._state, result.State || {});

        if (result.Progress) {
          // TODO: Progress in promises?
        } else if (result.Error) {
          // Server hub method threw an exception, log it & reject the deferred
          if (result.StackTrace) {
            this._logger.error(`${result.Error}\n${result.StackTrace}.`);
          }
          // result.ErrorData is only set if a HubException was thrown
          const source = result.IsHubException ? 'HubException' : 'Exception';
          const error: any = new Error(result.Error);
          error.source = source;
          error.data = result.ErrorData;
          this._logger.error(
            `${this._hubName}.${methodName} failed to execute. Error: ${
              error.message
            }`
          );
          reject(error);
        } else {
          // Server invocation succeeded, resolve the deferred
          this._logger.info(`Invoked ${this._hubName}\.${methodName}`);
          if (result.Result) {
            resolve(result.Result);
          } else {
            resolve();
          }
        }
      };

      this._client.invocationCallbacks[
        this._client.invocationCallbackId.toString()
      ] = {
        scope: this,
        method: callback,
      };
      this._client.invocationCallbackId += 1;

      if (this._state !== {}) {
        data.S = this._state;
      }

      this._logger.info(`Invoking ${this._hubName}\.${methodName}`);

      this._client.send(data);
    });
  }
}
