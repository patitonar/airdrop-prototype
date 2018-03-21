import React, { Component } from 'react'
import './App.css'

import contract from 'truffle-contract'

import ExampleToken from './contracts/ExampleToken'
import AirdropContract from './contracts/Airdrop'
import getWeb3 from './utils/getWeb3'

import Balances from './components/Balances'

class App extends Component {

  constructor (props) {
    super(props)

    this.state = {
      web3: null,
      ownerAddress: '',
      balances: [],
      tokenSymbol: null,
      ownerBalance: null,
      contractBalance: null,
      wip: false,
      fbMsg: '',
      msgCurrentAction: '',
      formReceipts: '',
      formAmount: '',
      formAddress: '',
      tokenInstance: null,
      airdropInstance: null,
      noContractsDeployed: false
    }
  }

  componentWillMount () {
    getWeb3
      .then(results => {
        this.setState({web3: results.web3})
        results.web3.eth.getAccounts((error, accounts) => this.setState({ownerAddress: accounts[0]}))

        const contractsPromises = []

        const Token = contract(ExampleToken)
        Token.setProvider(results.web3.currentProvider)
        contractsPromises.push(
          Token.deployed()
            .then(instance => {
              this.setState({
                tokenInstance: instance,
                formAddress: instance.address
              })
              return instance.symbol()
            })
            .then(symbol => this.setState({tokenSymbol: symbol}))
        )
        const Airdrop = contract(AirdropContract)
        Airdrop.setProvider(results.web3.currentProvider)
        contractsPromises.push(
          Airdrop.deployed()
            .then(instance =>
              this.setState({
                airdropInstance: instance
              })
            )
        )

        Promise
          .all(contractsPromises)
          .catch(() => this.setState({noContractsDeployed: true}))
          .finally(() => this.showBalances())
      })
      .catch(() => console.log('Error finding web3'))
  }

  runAirdrop () {
    this.setState({wip: true})

    // todo:
    // In dev mode we send load to contract and then run
    // contract transactions to every receipt address.
    // In prod mode you can go straight to transferToReceipts()
    //this.transferToReceipts(AirdropInstance, accounts[0])

    this.loadAndSend()
      .then(() => this.setState({fbMsg: 'Transaction successfull!'}))
      .catch(err => {
        this.setState({fbMsg: err.msg || 'Transaction failed!'})
        process.env.NODE_ENVIRONMENT === 'development' && console.log(err)
      })
      .finally(() => {
        this.showBalances()
        this.setState({wip: false})
      })
  }

  loadAndSend () {
    const {tokenInstance, ownerAddress, formReceipts, formAmount, contractBalance} = this.state

    const totalAmount = formReceipts.trim().split('\n').filter(item => item).length * formAmount

    return tokenInstance.balanceOf(ownerAddress)
      .then(async ownerBalance => {
        if (totalAmount > contractBalance && totalAmount > ownerBalance.toNumber()) {
          this.setState({fbMsg: 'Adding tokens to owner address...'})
          // todo:
          // return Promise.reject() when prod env
          return await tokenInstance.addTokens(ownerAddress, totalAmount - ownerBalance.toNumber(), {from: ownerAddress})
            .then(async () => {
              this.setState({ownerBalance: totalAmount})
              return await this.transferTokens(totalAmount)
            })
          //return Promise.reject({msg: 'Owner balance is not enough!'})
        } else {
          return await this.transferTokens(totalAmount)
        }
      })
      .then(promise => promise)
  }

  transferTokens (totalAmount) {
    const {airdropInstance, tokenInstance, ownerAddress} = this.state

    return tokenInstance.balanceOf(airdropInstance.address)
      .then(async contractBalance => {
        const airdropBalance = contractBalance.toNumber()
        if (airdropBalance < totalAmount) {
          this.setState({fbMsg: 'Sending tokens to airdrop contract...'})
          const transferAmount = totalAmount - airdropBalance
          return await tokenInstance.transfer(airdropInstance.address, transferAmount, {from: ownerAddress})
            .then(() => {
              this.setState(prevState => ({
                contractBalance: totalAmount,
                ownerBalance: prevState.ownerBalance - transferAmount
              }))
              return this.transferToReceipts()
            })
        }
        return this.transferToReceipts()
      })
  }

  transferToReceipts () {
    const {airdropInstance, ownerAddress} = this.state

    this.setState({fbMsg: 'Airdropping tokens to receipts...'})
    return airdropInstance.runAirdrop(
      this.state.formReceipts.split('\n').filter(item => item),
      this.state.formAmount,
      this.state.formAddress,
      {from: ownerAddress})
  }

  showBalances () {
    const {airdropInstance, tokenInstance, ownerAddress, formReceipts} = this.state
    if (!tokenInstance || !airdropInstance) {
      return console.log('Error: no contracts instances found')
    }
    try {
      const recipients = formReceipts.split('\n').filter(item => item)
      const promises = []
      const balances = []
      let ownerBalance
      let contractBalance
      recipients.forEach(address => {
        promises.push(
          tokenInstance.balanceOf(address)
            .then(result => balances.push({address: address, amount: result.toNumber()}))
        )
      })
      promises.push(
        tokenInstance.balanceOf(ownerAddress)
          .then(async result => ownerBalance = await result.toNumber())
      )
      promises.push(
        tokenInstance.balanceOf(airdropInstance.address)
          .then(async result => contractBalance = await result.toNumber())
      )
      Promise
        .all(promises)
        .then(() =>
          this.setState({
            balances,
            ownerBalance,
            contractBalance
          })
        )
    } catch (err) {
      console.log('Show balances error:', err)
    }
  }

  handleInputChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  render () {
    const {
      ownerBalance, contractBalance, formReceipts, formAddress, formAmount, noContractsDeployed, fbMsg,
      balances, wip, msgCurrentAction, tokenSymbol
    } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Ethereum Airdrop</h1>
        </header>
        <div>
          <p>Owner tokens balance: {Number.isInteger(ownerBalance) ? `${ownerBalance} ${tokenSymbol}` : '-'}</p>
          <p>Airdrop contract tokens
            balance: {Number.isInteger(contractBalance) ? `${contractBalance} ${tokenSymbol}` : '-'}</p>
        </div>
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
