/**
 *  @file
 *  @author zhouminghui
 *  2018.12.5
 *  整理页面可读性
 *  NUM_ROWS 显示行数
 */
/* eslint-disable fecs-camelcase */
import React from 'react';
import ReactDOM from 'react-dom';

import {PullToRefresh, ListView} from 'antd-mobile';

// import checkStatus from '../../../utils/checkStatus';
import {txIdOmit} from '../../../utils/utils';
import {hashHistory} from 'react-router';
import {SCROLLFOOTER} from '../../../constants';
import {get} from '../../../utils/apisauce';

import style from './TransactionsContent.scss';

// 交易失败 失败的交易不会上链
// 偶发  列表下拉后数据无法切换  刷新即可切换  待查看原因 【已修复】

let pageIndex = 0;
const NUM_ROWS = 20;

function getTxs(callback, walletAddress, pageIndex) {
    // fetch(`/block/api/address/transactions?${query}`, {
    // TODO: Error Logic
    // 后续这里也需要拆分开
    get('api/address/transactions', {
    // get('api/token/txs', {
        limit: NUM_ROWS, // 13
        page: pageIndex, // 0
        order: 'desc', // asc
        address: walletAddress,
        // TODO, need deal with other contract About token, such lick resource contract.
        contract_address: window.defaultConfig.mainTokenContract
    }).then(result => {
        callback(result);
    }).catch(error => {
        console.log('error:', error);
    });
}

export default class TransactionsContent extends React.Component {
    constructor(props) {
        super(props);

        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
        });

        this.hide = {
            display: 'none'
        };

        this.show = {
            display: 'block'
        };

        this.state = {
            open: false,
            dataSource,
            refreshing: true,
            isLoading: true,
            height: document.documentElement.clientHeight,
            useBodyScroll: false,
            searchShow: this.props.searchShow,
            walletAddress: this.props.address,
            walletData: null
        };
    }

    componentDidUpdate() {
        if (this.state.useBodyScroll) {
            document.body.style.overflow = 'auto';
        }
        else {
            document.body.style.overflow = 'hidden';
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.address !== state.walletAddress) {
            return {
                walletAddress: props.address
            };
        }

        if (props.searchShow !== state.searchShow) {
            return {
                searchShow: props.searchShow
            };
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.address !== this.props.address) {
            const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
            pageIndex = 0;
            getTxs(result => {
                this.rData = result.transactions;
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.rData),
                    height: hei,
                    refreshing: false,
                    isLoading: false,
                    walletData: result.transactions
                });
            }, this.state.walletAddress, pageIndex);
        }
    }

    componentDidMount() {
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
        pageIndex = 0;
        getTxs(result => {
            this.rData = result.transactions;
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.rData),
                height: hei,
                refreshing: false,
                isLoading: false,
                walletData: result.transactions
            });
        }, this.state.walletAddress, pageIndex);
    }

    componentWillUnmount() {
        this.setState = function () {};
    }

    onRefresh() {
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
        this.setState({
            refreshing: true,
            isLoading: true
        });
        pageIndex = 0;
        getTxs(result => {
            this.rData = result.transactions;
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.rData),
                height: hei,
                refreshing: false,
                isLoading: false,
                walletData: result.transactions
            });
        }, this.state.walletAddress, pageIndex);
    }

    onEndReached(event) {
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        // console.log('onEndReached: ', this.state.isLoading, this.state.hasMore);
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }
        // console.log('reach end', event);
        this.setState({
            isLoading: true
        });

        getTxs(result => {
            // 测试上千条数据
            // this.rData = [...this.rData, ...this.rData];
            this.rData = [...this.state.walletData, ...result.transactions];

            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.rData),
                isLoading: false,
                walletData: this.rData
            });
        }, this.state.walletAddress, ++pageIndex);
    }

    render() {
        const row = (rowData, sectionID, rowID) => {
            let item = this.state.walletData[rowID];
            // console.log(item);
            let isIncome = item.params_to === this.state.walletAddress ? true : false;
            let quantity = item.quantity;
            let iconClass = style.icon + ' ' + (isIncome ? style.iconIn : '');
            let txId = item.tx_id;
            const contractAddress = item.address_to;
            let status = item.tx_status;
            if (status.toLowerCase().includes('failed')) {
                iconClass = style.icon + ' ' + style.iconFailed;
            }
            txId = txIdOmit(txId);

            const txDetailURL = '/transactiondetail?'
                + `contract_address=${contractAddress}`
                + `&txid=${item.tx_id}`
                + `&token=${window.defaultConfig.mainTokenName}`;
            // TODO: search for mutli chain.
            return (
                <div key={rowID}
                     className={style.txList}
                    onClick={() => hashHistory.push(txDetailURL)}
                >
                    <div className={style.leftContainer}>
                        <div className={iconClass}>
                        </div>
                        <div>
                            <div className={style.address}>
                                {txId}
                            </div>
                            {/* <div className={style.time}>2018-09-08</div> */}
                            {/* <div className = {style.defeated} >交易失败</div> */}
                        </div>
                    </div>
                    <div className={style.rightContainer}>
                        <div className={style.balance}>{quantity}</div>
                        {/* <div className={style.tenderValuation}>≈</div> */}
                    </div>
                </div>
            );

        };

        return (
            <div
                className={style.transactionContainer + ' ' + 'transaction-list-container'}
                style = {this.state.searchShow ? this.hide : this.show}
            >
                <ListView
                    initialListSize={NUM_ROWS}
                    key={this.state.useBodyScroll ? '0' : '1'}
                    ref={el => this.lv = el}
                    dataSource={this.state.dataSource}
                    renderFooter={() => SCROLLFOOTER(this.state.isLoading, this.state.hasMore)}
                    renderRow={row}
                    useBodyScroll={this.state.useBodyScroll}
                    style={this.state.useBodyScroll ? {} : {
                        height: '100%',
                        margin: '5px 0'
                    }}

                    pullToRefresh={<PullToRefresh
                        refreshing={this.state.refreshing}
                        onRefresh={() => this.onRefresh()}
                    />}
                    onEndReached={() => this.onEndReached()}
                    pageSize={10}
                />
            </div>
        );
    }

}
