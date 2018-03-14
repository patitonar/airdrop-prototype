import React, { Component } from 'react'
import './App.css'

import contract from 'truffle-contract'

import AirdropContract from './contracts/Airdrop'
import getWeb3 from './utils/getWeb3'

class App extends Component {

  constructor (props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      wip: false,
      formReceipts: '',
      formAmount: '',
      formAddress: ''
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
      Airdrop.deployed().then((instance) => {
        AirdropInstance = instance

        this.setState({wip: true})

        return AirdropInstance.runAirdrop(
          this.state.formReceipts.split('\n'),
          this.state.formAmount,
          this.state.formAddress,
          {from: accounts[0]}
        )
      }).then(result => console.log(result))
        .then(() => {
          const recipients = this.state.formReceipts.split('\n')
          recipients.forEach(address =>{
            AirdropInstance.balanceOf(this.state.formAddress, address)
              .then(result => console.log(address, result.toString()))
          })
        })
        .finally(() => {
        this.setState({wip: false})
      })
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
          <textarea name="receipts" cols="45" rows="10" value={this.state.formReceipts} onChange={this.handleChange('formReceipts')}></textarea>
          <label htmlFor="token_address">Token address</label>
          <input type="text" name="address" size="45" value={this.state.formAddress} onChange={this.handleChange('formAddress')}/>
          <label htmlFor="amount">Amount</label>
          <input type="text" name="amount" size="45" value={this.state.formAmount} onChange={this.handleChange('formAmount')}/>
          <button onClick={() => this.instantiateContract()}>Submit</button>
        </div>
        {this.state.wip && <div className="App-wip"></div>}
      </div>
    )
  }
}

export default App
