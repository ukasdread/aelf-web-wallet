/*
 * huangzongzhe
 * 2018.07.26
 */
import React, { Component } from 'react'
import { WhiteSpace, List, Button } from 'antd-mobile'
import style from './Home.scss'
import { hashHistory } from 'react-router'
import getParam from '../../../utils/getParam' // 还有类似方法的话，合并一下。

import initAelf from '../../../utils/initAelf'
import hexToString from '../../../utils/hexToString'

const Item = List.Item;
const aelf = initAelf();
const walletAddress = JSON.parse(localStorage.getItem('lastuse')).address;
// React component
// TODO, 这里以后考虑使用ListView
// https://mobile.ant.design/components/list-view-cn/#components-list-view-demo-basic
class Home extends Component {
    constructor() {
        super();
        this.state = {
        };
    }

    // getCid from url. -> get Balance -> getTransactions
    getBalance() {
        return aelf.contractMethods.BalanceOf(walletAddress);;
    }

    getTokenName() {
        return aelf.contractMethods.TokenName();
    }

  
    render() {
        let test = hashHistory.getCurrentLocation().search;
        let balance = parseInt(this.getBalance().return, 16);
        let tokenName = hexToString(this.getTokenName().return);

        return (
            <div>
                <h3>tokenName: {tokenName}</h3>
                <h3>balance: {balance}</h3>
                <List>
                    <Item extra={'支出'}>23333</Item>
                </List>
                <List>
                    <Item extra={'收入'}>6666</Item>
                </List>

                <div className={style.transfer}>
                    <Button
                        onClick={() => hashHistory.push('/assettransfer')}
                    >转账</Button>
                </div>
            </div>
        );
    }
}

export default Home