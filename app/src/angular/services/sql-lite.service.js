'use strict';

const Wallet = requireAppModule('angular/classes/wallet');

function SqlLiteService($rootScope, $log, $q, $interval, $timeout, RPCService, EVENTS) {
    'ngInject';

    $log.debug('SqlLiteService Initialized');

    let ID_ATTRIBUTE_TYPES_STORE = {};
    let TOKENS_STORE = {};
    let TOKEN_PRICES_STORE = {};
    let WALLETS_STORE = {};
    let APP_SETTINGS = {};
    let COUNTRIES = [];
    let EXCHANGE_DATA = [];

    let tokenPriceUpdaterInterval = null;

    class SqlLiteService {

        constructor() {
            if (RPCService.ipcRenderer) {
                this.loadData().then((resp) => {
                    $log.info("DONE", ID_ATTRIBUTE_TYPES_STORE, TOKENS_STORE, TOKEN_PRICES_STORE, WALLETS_STORE);
                    //this.startTokenPriceUpdaterListener();
                }).catch((error) => {
                    $log.error(error);
                });
            } else {
                defer.reject({ message: 'electron RPC not available' });
            }

            $rootScope.$on("$destroy", () => {
                this.stopTokenPriceUpdaterListener();
            });
        }

        /**
         * Load
         */
        loadData() {
            let promises = [];

            promises.push(this.loadAppSettings());
            promises.push(this.loadIdAttributeTypes());
            promises.push(this.loadTokens());
            //promises.push(this.loadTokenPrices());
            promises.push(this.loadWallets());
            promises.push(this.loadCountries());
            //promises.push(this.loadExchangeData());

            return $q.all(promises).then((data) => {
                $rootScope.$broadcast(EVENTS.APP_DATA_LOAD);
            });
        }

        /**
         *
         */
        loadTokens() {
            return RPCService.makeCall('token_findAll', null).then((tokens) => {
                if (tokens) {
                    for (let i in tokens) {
                        let item = tokens[i];
                        TOKENS_STORE[item.symbol] = item;
                    }
                }
            });
        }

        loadIdAttributeTypes() {
            return RPCService.makeCall('idAttributeType_findAll', null).then((idAttributeTypes) => {
                if (idAttributeTypes) {
                    for (let i in idAttributeTypes) {
                        let item = idAttributeTypes[i];
                        item.entity = JSON.parse(item.entity);
                        ID_ATTRIBUTE_TYPES_STORE[item.key] = item;
                    }
                }
            });
        }

        loadTokenPrices() {
            return RPCService.makeCall('getTokenPrices', null).then((tokenPrices) => {
                if (tokenPrices) {
                    for (let i in tokenPrices) {
                        let item = tokenPrices[i];
                        TOKEN_PRICES_STORE[item.id] = item;
                    }
                    $log.info("TOKEN_PRICES", "LOADED", TOKEN_PRICES_STORE);
                }
            });
        }

        loadWallets() {
            return RPCService.makeCall('wallet_findAllWallets', null).then((wallets) => {
                if (wallets) {
                    for (let i in wallets) {
                        let item = wallets[i];
                        WALLETS_STORE[item.publicKey] = item;
                    }
                }
            });
        }

        loadAppSettings() {
            return RPCService.makeCall('getAppSettings', null).then((appSettings) => {
                APP_SETTINGS = appSettings;
            });
        }

        loadCountries() {
            return RPCService.makeCall('getCountries', null).then((data) => {
                if (data && data.length) {
                    COUNTRIES = data;
                }
            });
        }

        /**
         * Load Exchange Data
         */
        loadExchangeData() {
            return RPCService.makeCall('exchangeMarket_findAll', null).then((data) => {
                if (data && data.length) {
                    EXCHANGE_DATA = data;
                    $log.info("EXCHANGE_DATA", "LOADED", EXCHANGE_DATA);
                }
            })
        }

        /**
         *
         */
        startTokenPriceUpdaterListener() {
            tokenPriceUpdaterInterval = $interval(() => {
                this.loadTokenPrices();
            }, 35000)
        }

        stopTokenPriceUpdaterListener() {
            $interval.cancel(tokenPriceUpdaterInterval);
        }

        /**
         * wallets
         */
        getWalletPublicKeys() {
            return Object.keys(WALLETS_STORE);
        }

        getWallets() {
            return WALLETS_STORE;
        }

        getTokens() {
            return TOKENS_STORE;
        }

        /**
         * app_settings
         */
        getAppSettings() {
            return APP_SETTINGS;
        }

        setAppSettings(appSettings) {
            APP_SETTINGS = appSettings;
        }

        saveAppSettings(appSettings) {
            APP_SETTINGS = appSettings;
            return RPCService.makeCall('saveAppSettings', appSettings);
        }

        /**
         * countries
         */
        getCountries() {
            return COUNTRIES;
        }

        /**
         * id_attribute_types
         */
        getIdAttributeTypes() {
            return ID_ATTRIBUTE_TYPES_STORE;
        }

        /**
         * get exchange data
         */
        getExchangeData() {
            return EXCHANGE_DATA;
        }

        /**
         *
         */
        registerActionLog(actionText, title) {
            let theAction = {
                walletId: $rootScope.wallet.id,
                title: title || "untitled",
                content: actionText
            }
            return RPCService.makeCall('actionLog_add', theAction);
        }

        /**
         * token_prices
         */
        getTokenPrices() {
            return TOKEN_PRICES_STORE;
        }

        getTokenPriceBySymbol(symbol) {
            for (let i in TOKEN_PRICES_STORE) {
                if (TOKEN_PRICES_STORE[i].symbol.toUpperCase() === symbol.toUpperCase()) {
                    return TOKEN_PRICES_STORE[i];
                }
            }
            return null;
        }
        /**
         *
         * wallet settings
         */
        insertTransactionHistory(data) {
            return RPCService.makeCall('insertTransactionHistory', data);
        }

        getTransactionsHistoryByWalletId(walletId) {
            return RPCService.makeCall('getTransactionsHistoryByWalletId', { walletId: walletId });
        }

        getTransactionsHistoryByWalletIdAndTokenId(walletId, tokenId) {
            return RPCService.makeCall('getTransactionsHistoryByWalletIdAndTokenId', { walletId: walletId, tokenId: tokenId });
        }


        insertWalletToken(data) {
            return RPCService.makeCall('insertWalletToken', data);
        }

        insertNewWalletToken(data, balance, walletId) {
            return RPCService.makeCall('insertNewWalletToken', { data: data, balance: balance, walletId: walletId });
        }

        updateWalletToken(data) {
            return RPCService.makeCall('updateWalletToken', data);
        }

    }

    return new SqlLiteService();
}

module.exports = SqlLiteService;
