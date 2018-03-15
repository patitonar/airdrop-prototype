import React, { Component } from 'react'
import './App.css'

import contract from 'truffle-contract'

import AirdropContract from './contracts/Airdrop'
import ExampleToken from './contracts/ExampleToken'
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
      formAddress: ExampleToken.networks['5777'].address
    }
  }

  componentWillMount () {
    getWeb3
      .then(results =>
        this.setState({
          web3: results.web3
        })
      ).catch(() => console.log('Error finding web3.'))
  }

  instantiateContract () {
    const Airdrop = contract(AirdropContract)
    Airdrop.setProvider(this.state.web3.currentProvider)

    let AirdropInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      Airdrop.deployed()
        .then((instance) => {
          AirdropInstance = instance

          this.setState({wip: true})

          return AirdropInstance.runAirdrop(
            this.state.formReceipts.split('\n'),
            this.state.formAmount,
            this.state.formAddress,
            {from: accounts[0]}
          )
        })
        .then(() => {
          const recipients = this.state.formReceipts.split('\n')
          const balances = []
          const promises = []
          recipients.forEach(address => {
            promises.push(
              AirdropInstance.balanceOf(this.state.formAddress, address)
                .then(result => {
                  balances.push({address: address, amount: result.toNumber()})
                })
            )
          })
          Promise.all(promises)
            .then(() => this.setState({balances, fbMsg: 'Transaction successfull!'}))
        })
        .catch(() => this.setState({fbMsg: 'Transaction failed!'}))
        .finally(() => this.setState({wip: false}))
    })
  }

  handleChange = name => event => {
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
                    onChange={this.handleChange('formReceipts')}/>
          <label htmlFor="token_address">Token address</label>
          <input type="text" name="address" size="45" value={this.state.formAddress}
                 onChange={this.handleChange('formAddress')}/>
          <label htmlFor="amount">Amount</label>
          <input type="text" name="amount" size="45" value={this.state.formAmount}
                 onChange={this.handleChange('formAmount')}/>
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
