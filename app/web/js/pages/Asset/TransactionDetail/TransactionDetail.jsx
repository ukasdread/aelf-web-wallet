/**
 * @file TransactionDetail.js
 * @author huangzongzhe
 * 2018.07.27
 */

/* eslint-disable fecs-camelcase */
import React, {Component} from 'react';
import {Toast, Tag} from 'antd-mobile';
import style from './TransactionDetail.scss';
import {hashHistory} from 'react-router';

import { BigNumber } from 'bignumber.js';

import NavNormal from '../../NavNormal/NavNormal';

import AelfButton from './../../../components/Button/Button';
import addressPrefixSuffix from './../../../utils/addressPrefixSuffix';

import {
    getParam,
    initAelf,
    getPageContainerStyle
} from '../../../utils/utils';
// import deserializeParams from '../../../utils/deserializeParams';

import {FormattedMessage} from 'react-intl';

// React component
export default class TransactionDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chainStatus: {}
        };

        const stringTemp = hashHistory.getCurrentLocation().search || window.location.href;
        this.txid = getParam('txid', stringTemp);
        this.tokenName = getParam('token', stringTemp);
        this.decimals = getParam('decimals', stringTemp);
        this.contractAddress = getParam('contract_address', stringTemp);

        this.aelf = initAelf({
            chainOnly: true,
            tokenName: this.tokenName,
            contractAddress: this.contractAddress
        });
    }

    componentDidMount() {
        this.getChainStatus();
    }

    getChainStatus() {
        this.aelf.aelf.chain.getChainStatus().then(result => {
            this.setState({
                chainStatus: result
            });
        });
    }

    getTxInfo() {
        let txid = this.txid;
        let tokenName = this.tokenName;
        let contractAddress = this.contractAddress;

        let txInfo = {
            txState: false,
            txResult: null,
            txid,
            tokenName,
            contractAddress
        };
        try {
            if (txid && contractAddress) {
                let result = this.aelf.aelf.chain.getTxResult(txid, {sync: true});
                if (result.error) {
                    txInfo.txResult = result.error;
                }
                else {
                    txInfo.txResult = result;
                    txInfo.txState = true;
                }
            }
            else {
                const URL = window.location.href;
                txInfo.txResult = 'No (txid=xxx) or No (contract_address=xxx), Please check your URL： ' + URL;
            }
        }
        catch (e) {
            // Toast.fail(e.message || e.Error, 10, ()=>{}, false);
            // Toast.fail(e.message || e.Error, 10, ()=>{}, false);
            txInfo.txResult = e;
        }
        return txInfo;
    }

    // 如果有地址，则显示icon，如果只是分享，不显示icon
    renderAmount(from, to, amount) {
        const walletInfo = JSON.parse(localStorage.getItem('lastuse')) || {};
        const {address} = walletInfo;

        const isOut = address === from;

        const amountTemp = (new BigNumber(amount)).div(Math.pow(10, this.decimals)).toFixed(+this.decimals);
        const amountStr
          = (isNaN(amountTemp) ? '-' : amountTemp) + this.tokenName;

        return <div className={style.list + ' ' + style.banner}>
            <div className={style.icon + ' ' + (isOut ? style.out : style.in)}></div>
            <div>
                <div className={style.balance}>{amountStr}</div>
                {/* <div className={style.tenderValuation}>法币价值【暂无】</div> */}
                {/* <div className={style.tenderValuation}>{amount}</div> */}
            </div>
        </div>;
    }

    // TODO: 解析proto数据
    renderTransfer(txResult) {
        let {Transaction} = txResult;
        let params = Transaction.Params || [];
        const {MethodName} = Transaction;

        // const contractAddress = Transaction.To;
        // Demo:
        // input: CiAKHrbOcdaZjxh7cmWNzzSRSHvijvAerPnIVpz2QCkWFBIDRUxGGKCcAQ==
        // output: {to: "E5x5tUoandnGSvFsFjF6Tqz", symbol: "ELF", amount: 10000, amountStr: "10000"}
        // const paramsDeserialized = deserializeParams(params, contractAddress, {
        //     method: 'transfer'
        // });
        const paramsDeserialized = JSON.parse(params);
        const {
            amount,
            to,
            toChainId,
            fromChainId
        } = paramsDeserialized;

        let amounHtml = this.renderAmount(Transaction.From, to, amount);

        console.log('Transaction.Meth', Transaction, params);

        let addressFromShow = Transaction.From;
        let addressToShow = to;
        if (MethodName === 'CrossChainTransfer') {
            addressFromShow = addressPrefixSuffix(addressFromShow);
            addressToShow = addressPrefixSuffix(addressToShow, toChainId);
        }
        else if (MethodName === 'CrossChainTransfer') {
            const fromAddress = Transaction.From;
            addressFromShow = addressPrefixSuffix(fromAddress, fromChainId);
            addressToShow = addressPrefixSuffix(addressToShow);
        }
        else {
            addressFromShow = addressPrefixSuffix(addressFromShow);
            addressToShow = addressPrefixSuffix(addressToShow);
        }

        return <div>
            {amounHtml}

            <div className={style.list}>
                <div className={style.title}>From</div>
                <div className={style.text}>{addressFromShow}</div>
            </div>
            <div className={style.list}>
                <div className={style.title}>To</div>
                <div className={style.text}>{addressToShow}</div>
            </div>
        </div>;
    }

    renderNotTransfer(txResult) {
        let {Transaction} = txResult;
        let method = Transaction.MethodName;

        return <div>
            <div className={style.list}>
                <div className={style.title}>Transaction Type</div>
                <div className={style.text}>{method}</div>
            </div>
            <div className={style.list}>
                <div className={style.title}>Not assets transfer. Raw data FYI</div>
                <div className={style.text}>{JSON.stringify(txResult)}</div>
            </div>
        </div>;
    }

    renderNavHtml() {
        let hideLeft = window.location.pathname.match(/^\/transactiondetail/) ? true : false;
        let NavHtml = (
            <NavNormal
                navTitle={<FormattedMessage id = 'aelf.Transaction Details' />}
                hideLeft={hideLeft}
                rightContent={
                    <div
                        onClick={() => {
                            if (hideLeft) {
                                window.location.href = window.location.protocol + '//' + window.location.host;
                            }
                            else {
                                hashHistory.push('/assets');
                            }
                        }}
                    ><FormattedMessage id = 'aelf.Home' /></div>
                }
            />
        );

        return NavHtml;
    }

    renderBlockHeightHTML(blockNumber, status) {
        if (!['FAILED', 'MINED'].includes(status)) {
            return 'Unconfirmed';
        }

        const {chainStatus} = this.state;
        const {LastIrreversibleBlockHeight} = chainStatus;

        let blockHeightHTML = blockNumber;
        if (LastIrreversibleBlockHeight) {
            const confirmedBlocks = LastIrreversibleBlockHeight - blockNumber;
            const isIB = confirmedBlocks >= 0;
            blockHeightHTML = (
              <div>
                  {blockNumber} {isIB
                ? <span className={style.blockHeightConfirmed}>({confirmedBlocks} Block Confirmations)</span>
                : (<Tag small>Unconfirmed</Tag>)}
              </div>);
        }
        return blockHeightHTML;
    }

    renderTurnToExplorerHTML(txId) {
        const explorerURL = window.defaultConfig.explorerURL + '/tx/' + txId;

        return (<div className={style.bottom}>
            <AelfButton
              onClick={() => {
                  window.location = explorerURL;
              }}
              text = 'To Explorer'
            />
        </div>);
    }

    render() {
        let NavHtml = this.renderNavHtml();
        // 这个交易能拿到所有交易，非transfer交易也需要处理。
        let txInfo = this.getTxInfo();
        let {txResult, txid, txState, tokenName, contractAddress} = txInfo;

        let {
            Transaction,
            Status,
            BlockNumber
        } = txResult;

        let html = '';
        let notTransferHtml = '';
        let method = Transaction && Transaction.MethodName || '';
        if (Status !== 'NotExisted') {
            html = this.renderTransfer(txResult);
            if (method !== 'Transfer' && !method.includes('CrossChain')) {
                html = '';
                notTransferHtml = this.renderNotTransfer(txResult);
            }
        }

        const blockHeightHTML = this.renderBlockHeightHTML(BlockNumber, Status);
        const turnToExplorerHTML = this.renderTurnToExplorerHTML(txid);

        const containerStyle = getPageContainerStyle();
        let txInfoContainerStyle = Object.assign({}, containerStyle);
        txInfoContainerStyle.height -= 150;

        return (
            <div>
                {NavHtml}
                <div className={style.container} style={containerStyle}>
                    <div style={txInfoContainerStyle}>
                        <div style={{wordWrap: 'break-word', lineHeight: 1.5}}>
                            {html}
                            <div className={style.list}>
                                <div className={style.title}>Status</div>
                                <div className={style.text}>{Status}</div>
                            </div>
                            <div className={style.list}>
                                <div className={style.title}>Transaction ID</div>
                                <div className={style.text}>{txid}</div>
                            </div>
                            <div className={style.list}>
                                <div className={style.title}>Block Height</div>
                                <div className={style.text}>{blockHeightHTML}</div>
                            </div>
                            {notTransferHtml}
                        </div>
                    </div>
                    {turnToExplorerHTML}
                </div>
            </div>
        );
    }
}
