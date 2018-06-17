// @ts-ignore
import request from 'superagent';
import { CLIENT_PROTOCOL_VERSION } from './Constants';
import Client, { CLIENT_CONFIG_DEFAULTS } from './Client';
import HubProxy from './HubProxy';
import Protocol from './Protocol';
import PromiseMaker from './PromiseMaker';
import { each as _each, isString, isArray } from 'lodash';
import { IConfig } from './Utils';
import { Logger } from './Logger';

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
  invocationCallbackId: number | undefined;
  invocationCallbacks: any;
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

    this.received((minData: any) => {
      if (!minData || !minData.length) {
        return;
      } else if (minData.I !== undefined) {
        const callback = this.invocationCallbacks[minData.I];
        if (callback) {
          this.invocationCallbacks[minData.I] = null;
          delete this.invocationCallbacks[minData.I];
          callback(minData);
        }
      } else {
        _each(minData, (md) => {
          const data = Protocol.expandClientHubInvocation(md);
          const hubName =
            data.Hub && isString(data.Hub) ? data.Hub.toLowerCase() : '';
          const proxy = this.proxies[hubName];
          if (proxy) {
            this._logger.info(
              `\`${data.Hub}\` proxy found, invoking \`${data.Method}\`.`
            );
            const funcs = proxy.observers[data.Method];
            if (funcs && isArray(funcs) && funcs.length > 0) {
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
    });
  }

  /**
   * Creates a new hub proxy based on th' actual hub moniker.
   * @param {string} hubName The name of the hub that the proxy will be created for.
   * @returns {*|HubProxy} If th' proxy already exists, it return that individual proxy, else it creates a new one.
   * @function
   * @public
   */
  createHubProxy(hubName: string) {
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
    // TODO: figure out why this is needed/not needed
    // .then(() => request
    //  .get(`${this._config.url}/start`)
    //  .query({clientProtocol: CLIENT_PROTOCOL_VERSION})
    //  .query({connectionData: JSON.stringify(this.connectionData)})
    //  .query({connectionToken: this._transport.connectionToken})
    //  .query({transport: this._transport.name})
    //  .use(PromiseMaker)
    //  .promise());
  }

  /**
   * Overridden negotiate method that adds connectionData to th' initial query. ConnectionData holds th' names 'o th' current connected hubs.
   * @returns {Promise} Returns the
   * @private
   * @function
   */
  _negotiate() {
    return request
      .get(`${this._config.url}/negotiate`)
      .query({ clientProtocol: CLIENT_PROTOCOL_VERSION })
      .query({ connectionData: JSON.stringify(this.connectionData) })
      .use(PromiseMaker)
      .promise();
  }
}
