import React, { Component } from 'react'
import './App.css'

import contract from 'truffle-contract'

import ExampleTokenJson from './contracts/ExampleToken'
import AirdropJson from './contracts/Airdrop'
import getWeb3 from './utils/getWeb3'

import Balances from './components/Balances'

class App extends Component {

  constructor (props) {
    super(props)

    this.state = {
      web3: null,
      tokenSymbol: null,
      ownerAddress: '',
      balances: [],
      formReceipts: '',
      formAmount: '',
      formAddress: '',
      tokenInstance: null,
      airdropInstance: null,
      fbMsg: '',
      msgCurrentAction: '',
      wip: false,
      noContractsDeployed: false
    }
  }

  async componentWillMount () {
    let web3
    try {
      web3 = (await getWeb3).web3
    } catch (error) {
      return console.log('Error finding web3')
    }

    const ownerAddress = (await web3.eth.getAccounts())[0]
    this.setState({
      web3,
      ownerAddress
    })

    const TokenContract = contract(ExampleTokenJson)
    TokenContract.setProvider(web3.currentProvider)
    const AirdropContract = contract(AirdropJson)
    AirdropContract.setProvider(web3.currentProvider)

    Promise
      .all([TokenContract.deployed(), AirdropContract.deployed()])
      .then(async ([TokenInstance, AirdropInstance]) => {
        await this.setState({
          tokenInstance: TokenInstance,
          formAddress: TokenInstance.address,
          airdropInstance: AirdropInstance,
          tokenSymbol: await TokenInstance.symbol()
        })
        this.showBalances()
      })
      .catch(() => this.setState({noContractsDeployed: true}))
  }

  async runAirdrop () {
    this.setState({wip: true})

    try {
      //await this.transferToReceipts()
      await this.transferToContract()
      this.setState({fbMsg: 'Transaction successfull!'})
    } catch (error) {
      this.setState({fbMsg: error.msg || 'Transaction failed!'})
      process.env.NODE_ENV === 'development' && console.log(error)
    }
    this.showBalances()
    this.setState({wip: false})
  }

  async transferToContract () {
    const {airdropInstance, tokenInstance, ownerAddress, formReceipts, formAmount} = this.state
    const totalAmount = formReceipts.trim().split('\n').filter(item => item).length * formAmount

    this.setState({fbMsg: `Sending ${totalAmount} tokens to airdrop contract...`})
    try {
      await tokenInstance.addTokens(airdropInstance.address, totalAmount, {from: ownerAddress})
    } catch (error) {
      return Promise.reject(error)
    }

    return this.transferToReceipts()
  }

  async transferToReceipts () {
    const {airdropInstance, ownerAddress, formAmount, formAddress} = this.state

    const formReceipts = this.state.formReceipts.split('\n').filter(item => item)

    this.setState({fbMsg: `Airdropping ${formAmount} tokens to ${formReceipts.length} receipts...`})

    try {
      await airdropInstance.runAirdropPublic(
        formReceipts,
        formAmount,
        formAddress,
        {from: ownerAddress}
      )
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async showBalances () {
    const {tokenInstance, formReceipts} = this.state

    try {
      const receipts = formReceipts.split('\n').filter(item => item)
      const receiptsResults = await tokenInstance.getBalances(receipts)

      const balances = receiptsResults.map((amount, index) =>
        ({address: receipts[index], amount: amount.toNumber()})
      )
      this.setState({balances})

    } catch (error) {
      console.log('Show balances error:', error)
    }
  }

  handleInputChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  render () {
    const {
      formReceipts, formAddress, formAmount, wip, noContractsDeployed, fbMsg, balances, msgCurrentAction
    } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Ethereum Airdrop</h1>
        </header>
        <div className="App-form">
          <label htmlFor="receipts">Receipt addresses</label>
          <textarea name="receipts" cols="45" rows="10" value={formReceipts}
                    onChange={this.handleInputChange('formReceipts')}/>
          <label htmlFor="token_address">Token address</label>
          <input type="text" name="address" size="45" value={formAddress}
                 onChange={this.handleInputChange('formAddress')}/>
          <label htmlFor="amount">Amount</label>
          <input type="text" name="amount" size="45" value={formAmount}
                 onChange={this.handleInputChange('formAmount')}/>
          <button onClick={() => this.runAirdrop()}>Submit</button>
        </div>
        {noContractsDeployed && <h2>Contracts were not found on selected network</h2>}
        {fbMsg && <h3>{fbMsg}</h3>}
        {!!balances.length && <Balances data={balances}/>}
        {wip && <div>{msgCurrentAction}</div>}
        {wip && <div className="App-wip"/>}
      </div>
    )
  }
}

export default App
