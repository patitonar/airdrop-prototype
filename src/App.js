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
      storageValue: 0,
      web3: null,
      balances: [],
      wip: false,
      fbMsg: '',
      formReceipts: '',
      formAmount: '',
      formAddress: ''
    }
  }

  componentWillMount () {
    getWeb3
      .then(results =>{
          this.setState({web3: results.web3})
          const token = contract(ExampleToken)
          token.setProvider(results.web3.currentProvider)
          token.deployed().then(instance => this.setState({formAddress: instance.address}))
      })
      .catch(() => console.log('Error finding web3.'))
  }

  instantiateContract () {
    const Airdrop = contract(AirdropContract)
    Airdrop.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      Airdrop.deployed()
        .then(AirdropInstance => {

          this.setState({wip: true})

          const ExampleTokenContract = contract(ExampleToken)
          ExampleTokenContract.setProvider(this.state.web3.currentProvider)

          // todo:
          // In dev mode we send load to contract and then run
          // contract transactions to every receipt address.
          // In prod mode you can go straight to transferToReceipts()
          this.transferToReceipts(AirdropInstance, accounts[0])
          //this.loadAndSend(AirdropInstance, ExampleTokenContract, accounts[0])
            .then(() => {
              this.showBalances(AirdropInstance)
              this.setState({fbMsg: 'Transaction successfull!'})
            })
            .catch(err => {
              this.setState({fbMsg: err.msg || 'Transaction failed!'})
              console.log(err)
            })
            .finally(() => this.setState({wip: false}))
        })
    })
  }

  async loadAndSend (AirdropInstance, ExampleTokenContract, ownerAddress) {
    return await ExampleTokenContract.deployed()
      .then(async ExampleTokenInstace => {
        const totalAmount = this.state.formReceipts.trim().split('\n').length * this.state.formAmount

        return await ExampleTokenInstace.balanceOf(ownerAddress)
          .then(async ownerBalance => {
            if (totalAmount > ownerBalance.toNumber()) {
              return Promise.reject({msg: 'Owner balance is not enough!'})
            }
            return await ExampleTokenInstace.transfer(AirdropInstance.address, totalAmount, {from: ownerAddress})
              .then(async () => await this.transferToReceipts(AirdropInstance, ownerAddress))
          })
      })
  }

  async transferToReceipts (AirdropInstance, ownerAddress) {
    return await AirdropInstance.runAirdrop(
      this.state.formReceipts.split('\n'),
      this.state.formAmount,
      this.state.formAddress,
      {from: ownerAddress})
  }

  showBalances(AirdropInstance) {
    try {
      const recipients = this.state.formReceipts.split('\n')
      const promises = []
      const balances = []
      recipients.forEach(address => {
        promises.push(
          AirdropInstance.balanceOf(this.state.formAddress, address)
            .then(result => {
              balances.push({address: address, amount: result.toNumber()})
            })
        )
      })
      Promise
        .all(promises)
        .then(() => this.setState({balances}))
    } catch (err) {
      console.log("showBalances() error:", err)
    }
  }

  handleInputChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  render () {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Ethereum Airdrop</h1>
        </header>
        <div className="App-form">
          <label htmlFor="receipts">Receipt addresses</label>
          <textarea name="receipts" cols="45" rows="10" value={this.state.formReceipts}
                    onChange={this.handleInputChange('formReceipts')}/>
          <label htmlFor="token_address">Token address</label>
          <input type="text" name="address" size="45" value={this.state.formAddress}
                 onChange={this.handleInputChange('formAddress')}/>
          <label htmlFor="amount">Amount</label>
          <input type="text" name="amount" size="45" value={this.state.formAmount}
                 onChange={this.handleInputChange('formAmount')}/>
          <button onClick={() => this.instantiateContract()}>Submit</button>
        </div>
        {this.state.fbMsg && <h3>{this.state.fbMsg}</h3>}
        <Balances data={this.state.balances}/>
        {this.state.wip && <div className="App-wip"/>}
      </div>
    )
  }
}

export default App
