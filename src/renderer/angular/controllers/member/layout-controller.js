const EthUnits = require('../../classes/eth-units');
const EthUtils = require('../../classes/eth-utils');
const Token = require('../../classes/token');


function MemberLayoutController($rootScope, $scope, $log, $mdDialog, $mdSidenav, $interval, $timeout, $state, Web3Service, EtherScanService) {
    'ngInject'

    $scope.showScrollStyle = false;

    var OSName = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

    if (OSName === 'Windows') {
        $scope.showScrollStyle = true;
    }

    $log.info('MemberLayoutController');

    /**
     *
     */
    $scope.openRightSidenav = () => {
        $mdSidenav('right').toggle().then(() => {
            $log.debug("toggle " + "right" + " is done");
        });
    }

    $rootScope.wallet.syncEthTransactionsHistory();
    Web3Service.syncTokensTransactionHistory();

    let addBalaceChageListener = () => {
        $rootScope.$on('balance:change', (event, symbol, value, valueInUsd) => {
            $timeout(() => {
                $rootScope.refreshTxHistory(symbol);
            }, 4000);
        });
    };

    addBalaceChageListener();

    /*
    $rootScope.goToSelfkeyIco = (event) => {
        let ico = null;
        let icos = ConfigFileService.getIcos();
        for (let i in icos) {
            for (let j in icos[i]) {
                if (['key', 'KEY'].indexOf(icos[i][j].symbol) !== -1) {
                    ico = icos[i][j];
                    break;
                }
            }
        }
        if (ico) {
            $state.go('member.marketplace.ico-item', { selected: ico });
        }
    }
    */

};
MemberLayoutController.$inject = ["$rootScope", "$scope", "$log", "$mdDialog", "$mdSidenav", "$interval", "$timeout", "$state", "Web3Service", "EtherScanService"];
module.exports = MemberLayoutController;
