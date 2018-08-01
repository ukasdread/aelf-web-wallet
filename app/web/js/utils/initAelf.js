/*
 * huangzongzhe,hzz780
 * 2018.07.30
 * init aelf
 */
import Aelf from 'aelf-sdk'
import config from '../config/config.js'

// 如果传入了password，则使用私人账户来操作。
// 如果传入了password, 需要在组件内方法执行initAelf
function init (options = {}) {
	// let options = {
	// 	password: password,
	// 	contractAddress: contractAddress,
	// 	chainOnly: true / false
	// }
	let {password, contractAddress, chainOnly} = options;
	let wallet = '';
	if (password) {
		let walletAddress = JSON.parse(localStorage.getItem('lastuse')).address;
	    let walletInfoList = JSON.parse(localStorage.getItem('walletInfoList'));
	    let AESEncryptoPrivateKey = walletInfoList[walletAddress].AESEncryptoPrivateKey;

	    let privateKey = '';
	    try {
	        privateKey = Aelf.wallet.AESDecrypto(AESEncryptoPrivateKey, password);
	    } catch (e) {
	    	return error('wrong password, program crash.');
	    }
	    if (!privateKey) {
            return error('wrong password.');
        }
        wallet = Aelf.wallet.getWalletByPrivateKey(privateKey);
	} else {
		// 公共账户用来进行查询操作。需要转账操作时,再使用用户的账户。
		wallet = Aelf.wallet.getWalletByPrivateKey('f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71');
	}
	console.log('wallet: ', wallet);

	let aelf = new Aelf(new Aelf.providers.HttpProvider(config.httpProvider));
	aelf.chain.connectChain();
	let contractMethods = chainOnly 
		? {} : aelf.chain.contractAt(contractAddress || config.mainContract, wallet);
	return {
		aelf: aelf,
		contractMethods: contractMethods
	};
}

export default init

// TODO, 整理一套返回格式。
function error (msg) {
	return {
		errormsg: msg
	};
}