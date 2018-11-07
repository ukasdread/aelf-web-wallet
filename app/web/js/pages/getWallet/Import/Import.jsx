import React, { Component } from 'react'
import { Button, WhiteSpace, List, TextareaItem, InputItem, Toast, Tabs, Radio, Flex } from 'antd-mobile'
import AelfButton from '../../../components/Button/Button'
import Svg from '../../../components/Svg/Svg'

import style from './Import.scss'

import { hashHistory } from 'react-router'
import passwordCheck from '../../../utils/passwordCheck'
import moneyKeyboardWrapProps from '../../../utils/moneyKeyboardWrapProps'
import insertWalletInfo from '../../../utils/walletStorage'
import Password from '../../../components/Password/Password'
import WalletName from '../WalletName/WalletName'
import getPageContainerStyle from '../../../utils/getPageContainerStyle'

import Agreement from '../Agreement/Agreement'

import aelf from 'aelf-sdk'


const tabs = [
  { title: '助记词' },
  { title: '私钥' }
];
// React component
class Import extends Component {
    constructor() {
        super();
        this.state = {
            mnemonic: '',
            privateKey: '',
            agreementDisplay: false,
            tabNClass: style.tabTitle + ' ' + style.tabSelected,
            tabPClass: style.tabTitle,
            textNClass: style.textareaContainer + ' ' + style.textSelected,
            textPClass: style.textareaContainer
        };
        this.failMessage = '请填入助记词或者私钥';
    }

    createAndGO() {
        let password = this.state.password;
        if (!password) {
            Toast.fail('No password', 2);
            return;
        }
        if (!this.state.walletName) {
            Toast.fail('No walletName', 2);
            return;
        }

        if (!this.state.mnemonic && !this.state.privateKey) {
            Toast.fail('Please input your privateKey or mnemonic', 3);
            return;
        }

        let mnemonicWallet = aelf.wallet.getWalletByMnemonic(this.state.mnemonic || '');
        let privateKeyWallet = aelf.wallet.getWalletByPrivateKey(this.state.privateKey || '');

        // if (!privateKeyWallet && !mnemonicWallet) {
        if (!mnemonicWallet) {
            this.setState({mnemonicError: 'invalid mnemonic'})
        } else {
            this.setState({mnemonicError: ''})
        }

        // if (!mnemonicWallet && !privateKeyWallet) {
        if (!privateKeyWallet) {
            this.setState({privateKeyError: 'invalid privateKey'})
        } else {
            this.setState({privateKeyError: ''})
        }

        if (!privateKeyWallet && !mnemonicWallet) {
            Toast.fail('导入失败');
            return;
        }

        let walletInfo = mnemonicWallet || privateKeyWallet; // 助记词钱包优先
        walletInfo.walletName = this.state.walletName;
        let result = insertWalletInfo(walletInfo, password);

        if (result) {
            Toast.info('导入成功，跳转到首页中', 3, () => {
                hashHistory.push('/assets');
            });
        } else {
            Toast.fail('(꒦_꒦) ...Fail, please check the form. Or call Huang Zongzhe');
        }
        
    }

    inputMnemonic(mnemonic) {
        this.setState({
            mnemonic: mnemonic.target.value,
            mnemonicError: ''
        });
    }

    inputPrivateKey(privateKey) {
        this.setState({
            privateKey: privateKey.target.value,
            privateKeyError: ''
        });
    }

    setPassword(password) {
        this.setState({
            password: password
        });
    }

    setWalletName(walletName) {
        this.setState({
            walletName: walletName
        });
    }

    tabClickN () {
        this.setState({
            tabNClass: style.tabTitle + ' ' + style.tabSelected,
            tabPClass: style.tabTitle,
            textNClass: style.textareaContainer + ' ' + style.textSelected,
            textPClass: style.textareaContainer,
            privateKey: ''
        });
        this.failMessage = '请填入助记词';
    }

    tabClickP () {
        this.setState({
            tabPClass: style.tabTitle + ' ' + style.tabSelected,
            tabNClass: style.tabTitle,
            textPClass: style.textareaContainer + ' ' + style.textSelected,
            textNClass: style.textareaContainer,
            mnemonic: ''
        });
        this.failMessage = '请填入私钥';
    }

    setAgreement() {
        this.setState({agree: true});
    }

    toggleAgreement() {
        this.setState({
            agreementDisplay: !this.state.agreementDisplay
        });
    }
  
    render() {
        let createButtonText = '开始导入';
        let createButton =
            <AelfButton
                text={createButtonText}
                style={{
                    opacity: 0.5
                }}
            ></AelfButton>;
        if (this.state.password && this.state.walletName && this.state.agree) {
            createButton =
                <AelfButton
                    text={createButtonText}
                    onClick={() => this.createAndGO()}
                ></AelfButton>;
        }

        let agreementHtml = <Svg icon="radio_select12"></Svg>;
        if (this.state.agree) {
            agreementHtml = <Svg icon="radio_selected12"></Svg>
        }

        let containerStyle = getPageContainerStyle();

        return (
            <div className={style.container} style={containerStyle}>
                <div>
                    <div style={{
                        padding: '0 24px'
                    }}>
                        <div className={style.tabTitleContainer}>

                            <div
                                className={this.state.tabNClass}
                                onClick={() => this.tabClickN()}
                            >
                                <div>助记词</div>
                                <div className={style.tabSelectedLine}></div>
                            </div>

                            <div
                                className={this.state.tabPClass}
                                onClick={() => this.tabClickP()}
                            >
                                <div>私钥</div>
                                <div className={style.tabSelectedLine}></div>
                            </div>
                        </div>
                        <div>
                            <div className={this.state.textNClass}>
                                <textarea name="" id="" rows="6"
                                          value={this.state.mnemonic}
                                          onChange={mnemonic => this.inputMnemonic(mnemonic)}
                                          placeholder="此处填写助记词, 用空格分隔"
                                          className={style.textarea}>
                                </textarea>
                            </div>

                            <div className={this.state.textPClass}>
                                <textarea name="" id="" rows="6"
                                          value={this.state.privateKey}
                                          onChange={privateKey => this.inputPrivateKey(privateKey)}
                                          placeholder="此处填写私钥"
                                          className={style.textarea}>
                                </textarea>
                            </div>
                        </div>

                    </div>
                    <p className={style.title}>助记词和私钥都可以，不过导入私钥将不会生成助记词</p>

                    <WalletName
                        setWalletName={walletName => this.setWalletName(walletName)}
                    ></WalletName>

                    <Password
                        setPassword={password => this.setPassword(password)}
                    ></Password>

                    <WhiteSpace />

                    <Flex style={{ padding: '0 24px 0 24px' }}>

                        <Flex.Item style={{ padding: '15px 0', color: '#FFF', flex: 'none', opacity: 0.5 }}>
                            我已仔细阅读并同意<span
                            className="aelf-blue"
                            style={{
                                color: '#26B7FF'
                            }}
                            onClick={() => this.toggleAgreement()}
                        >《服务及隐私条款》</span>
                        </Flex.Item>
                        <Flex.Item>
                            <div onClick={() => this.setAgreement()}>
                                {agreementHtml}
                            </div>
                        </Flex.Item>
                    </Flex>

                    <Agreement
                        agreementDisplay={this.state.agreementDisplay}
                        toggleAgreement={() => this.toggleAgreement()}
                    ></Agreement>
                </div>

                <div className={style.bottom}>
                    {createButton}
                </div>
            </div>
        );
    }
}

export default Import