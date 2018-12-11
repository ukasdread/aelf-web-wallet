/**
 * @file 带抽屉导航
 *  @author huangzongzhe
 * 2018.08.30
 */
import React, {
    Component
} from 'react';
import {Drawer, NavBar, Icon, Toast} from 'antd-mobile';
import {hashHistory} from 'react-router';

import BottomTabBar from './../BottomTabBar/BottomTabBar';

import Svg from '../../components/Svg/Svg';

import {historyGoBack} from '../../utils/historyChange';
import getPageContainerStyle from '../../utils/getPageContainerStyle';

import {FormattedMessage} from 'react-intl';

import style from './NavWithDrawer.scss';
require('./NavWithDrawer.css'); // 样式调整在HomePage/HomePage.css中

export default class NavWithDrawer extends Component {
    constructor(props) {
        super(props);
        if (typeof this.props.onLeftClick === 'function') {
            this.onLeftClick = this.props.onLeftClick;
        }
        this.state = {
            open: false,
            hidden: true
        };
    }

    onOpenChange() {
        this.setState({
            open: !this.state.open
        });
    }

    siderbarClick(walletInfo) {
        let lastuse = {
            address: walletInfo.address,
            walletName: walletInfo.walletName
        };
        localStorage.setItem('lastuse', JSON.stringify(lastuse));
        this.setState({
            // lastuse: lastuse,
            open: !this.state.open
        });

        // 艹，这代码好恶心。
        let targetPath = `/assets?address=${walletInfo.address}`;
        let notSameWallet = !hashHistory.getCurrentLocation().pathname.match(targetPath);
        if (notSameWallet) {
            // historyReplace(targetPath);
            // setTimeout(() => {
            hashHistory.replace(window.location.hash.replace('#', ''));
            // }, 300);
        }
    }

    getSideBar() {
        // (e) => this.siderbarClick(index, e) react的事件机制
        // https://doc.react-china.org/docs/handling-events.html
        // TODO, 从storage获取数据并拼接。
        let walletInfoList = JSON.parse(localStorage.getItem('walletInfoList'));
        let listItems = [];
        let walletInUse = JSON.parse(localStorage.getItem('lastuse')).address;
        for (let address in walletInfoList) {
            let walletId = walletInfoList[address].walletId;
            let walletName = walletInfoList[address].walletName;
            let isSelected = walletId === walletInUse;
            listItems.push(
                (
                    <div
                        className={style.list + ' ' + (isSelected ? style.selected : '')}
                        key={address}
                        onClick={e => this.siderbarClick(walletInfoList[address], e)}
                    >
                        <div className={style.icon}></div>
                        <div>{walletName}</div>
                    </div>
                )
            );

            // 测试用
            // listItems.push(
            //     (
            //         <div
            //             className={style.list + ' ' + (isSelected ? style.selected : '')}
            //             key={address + '1'}
            //             onClick={(e) => this.siderbarClick(walletInfoList[address], e)}
            //         >
            //             <div className={style.icon}></div>
            //             <div>{walletName}</div>
            //         </div>
            //     )
            // );
            //
            // listItems.push(
            //     (
            //         <div
            //             className={style.list + ' ' + (isSelected ? style.selected : '')}
            //             key={address + '2'}
            //             onClick={(e) => this.siderbarClick(walletInfoList[address], e)}
            //         >
            //             <div className={style.icon}></div>
            //             <div>{walletName}</div>
            //         </div>
            //     )
            // );
            //
            // listItems.push(
            //     (
            //         <div
            //             className={style.list + ' ' + (isSelected ? style.selected : '')}
            //             key={address + '3'}
            //             onClick={(e) => this.siderbarClick(walletInfoList[address], e)}
            //         >
            //             <div className={style.icon}></div>
            //             <div>{walletName}</div>
            //         </div>
            //     )
            // );
            //
            // listItems.push(
            //     (
            //         <div
            //             className={style.list + ' ' + (isSelected ? style.selected : '')}
            //             key={address + '4'}
            //             onClick={(e) => this.siderbarClick(walletInfoList[address], e)}
            //         >
            //             <div className={style.icon}></div>
            //             <div>{walletName}</div>
            //         </div>
            //     )
            // );
        }

        let listContainerStyle = getPageContainerStyle();
        listContainerStyle.height -= 80;

        return (
            <div className={style.sideContainer}>
                <div style={listContainerStyle}>
                    {listItems}
                </div>
                <div className={style.addWallet}
                    onClick={() => hashHistory.push('/get-wallet/guide')}
                >
                    {/*<div>扫一扫</div>*/}
                    <div className={style.addWalletIcon}></div>
                    <div
                    >
                        <FormattedMessage
                            id='aelf.Create'
                            defaultMessage='Create'
                        />
                    </div>
                </div>
            </div>

        );
    }

    componentDidUpdate() {
        Toast.hide();
    }

    onLeftClick() {
        historyGoBack();
    }

    render() {
        // fix in codepen
        const sidebar = this.getSideBar();

        const lastuse = localStorage.getItem('lastuse');
        const walletInUseName = lastuse ? JSON.parse(localStorage.getItem('lastuse')).walletName
        : 'Please select wallet';
        let showLeftClick = this.props.showLeftClick;

        let isAssetsPage = hashHistory.getCurrentLocation().pathname.match('/assets');
        let qrcodeIcon = <Svg
            icon={'qrcode22'}
            style={{
                width: 22,
                height: 22
            }}
            onClick={() => {
                hashHistory.push('/qrcode');
            }}
        ></Svg>;

        let iconInNavBar = showLeftClick
            ? <Icon type="left" />
            : (isAssetsPage ? qrcodeIcon : '');

        let bottomHtml = <div className={style.bottomTabBar}>
            <BottomTabBar></BottomTabBar>
        </div>;
        if (this.props.hiddenBottom) {
            bottomHtml = '';
        }

        return (
            <div style={{height: '100%'}} className='aelf-drawer'>
                <NavBar icon={iconInNavBar}
                    onLeftClick={showLeftClick ? () => this.onLeftClick() : () => { }}
                    rightContent={[
                        <Svg key="1"
                            icon={'menu22'}
                            onClick={() => this.onOpenChange()}
                            style={{width: 22, height: 22}}
                        ></Svg>
                    ]}
                >{walletInUseName}</NavBar>
                <Drawer
                    position="right"
                    className='my-drawer'
                    style={{height: document.documentElement.clientHeight - 45 - 22}}
                    enableDragHandle
                    contentStyle={
                        {
                            color: '#A6A6A6',
                            textAlign: 'center',
                            padding: '11px 0px 50px 0px',
                            overflowX: 'hidden'
                        }
                    }
                    sidebar={sidebar}
                    open={this.state.open}
                    onOpenChange={() => this.onOpenChange()}
                >
                    {this.props.children}
                    {bottomHtml}
                </Drawer>
            </div>
        );
    }
}
