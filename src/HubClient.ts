import Client, { CLIENT_CONFIG_DEFAULTS } from './Client';
import HubProxy from './HubProxy';
import Protocol from './Protocol';
import { IConfig } from './Utils';
import { Logger } from './Logger';
import { isString, isUndefined } from './Helper';

export const HUB_CLIENT_CONFIG_DEFAULTS = {
  logging: false,
  logger: null,
  hubClient: true,
};
/**
 * Th' Client that be used fer Hub connections.
 * @class
 */
export class HubClient extends Client {
  protected invocationCallbackId: any;
  protected invocationCallbacks: any;
  private proxies: any;
  /**
   * Uses passed in configuration settin's to initialize th' HubClient. Attatches event handlers that handle client invocations sent from th' ship,
   * as well as registerin' th' proxies fer each Hub on startup.
   * @param {Object} options The initial options defined by the user to initialize the HubClient with.
   * @constructor
   */
  constructor(options: IConfig) {
    super(options);
    this._config = Object.assign(
      {},
      CLIENT_CONFIG_DEFAULTS,
      HUB_CLIENT_CONFIG_DEFAULTS,
      options || {}
    );
    this._config.logger =
      this._config.logging === true
        ? new Logger('SignalR Hub-Client', true)
        : new Logger('SignalR Hub-Client');
    // Object to store hub proxies for this connection
    this.proxies = {};
    this.invocationCallbackId = 0;
    this.invocationCallbacks = {};
    this.connectionData = [];

    this.starting(() => {
      this._logger.info(`Registering Hub Proxies...`);
      // this._registerHubProxies();
    });

    this.received(this.receiveHandler.bind(this));
  }

  //#region public Methods
  /**
   * Creates a new hub proxy based on th' actual hub moniker.
   * @param {string} hubName The name of the hub that the proxy will be created for.
   * @returns {*|HubProxy} If th' proxy already exists, it return that individual proxy, else it creates a new one.
   * @function
   * @public
   */
  createHubProxy(hubName: string): HubProxy {
    const hubNameLower = hubName.toLowerCase();
    this.connectionData.push({ name: hubName });

    return (
      this.proxies[hubNameLower] ||
      (this.proxies[hubNameLower] = new HubProxy(
        this,
        hubNameLower,
        this._config.logging
      ))
    );
  }

  /**
   * Calls th' base client's start method, initializin' th' connection. Currently unknown if extra code be needed.
   * @param {Object} options Th' configuration to start th' client wit'.
   * @returns {Promise} Returns a promise signifying that the connection has been intialized.
   * @function
   * @public
   */
  start(options?: any) {
    return super.start(options);
  }

  //#endregion

  // #region private Methods
  private receiveHandler(minData: any) {
    if (!minData) {
      return;
    }
    if (!isUndefined(minData.I)) {
      const callback = this.invocationCallbacks[minData.I];
      if (callback) {
        this.invocationCallbacks[minData.I] = null;
        delete this.invocationCallbacks[minData.I];
        callback.method.call(callback.scope, minData);
      }
    } else {
      if (!minData.length) {
        return;
      }
      Array.isArray(minData) &&
        minData.forEach((md) => {
          const data = Protocol.expandClientHubInvocation(md);
          const hubName =
            data.Hub && isString(data.Hub) ? data.Hub.toLowerCase() : '';
          const proxy = this.proxies[hubName];
          if (proxy) {
            this._logger.info(
              `\`${data.Hub}\` proxy found, invoking \`${data.Method}\`.`
            );
            const funcs = proxy.observers[data.Method];
            if (funcs && Array.isArray(funcs) && funcs.length > 0) {
              const arrrrgs = [...data.Args].join(',');
              this._logger.info(`Invoking \`${data.Method}(${arrrrgs})\`. `);
              funcs.forEach((func: Function) => func(...data.Args));
            } else {
              this._logger.warn(
                `Client function not found for method \`${
                  data.Method
                }\` on hub \`${data.Hub}\`.`
              );
            }
          } else {
            this._logger.error(`Proxy for ${data.Hub} not found.`);
          }
        });
    }
  }
  // #endregion
}
