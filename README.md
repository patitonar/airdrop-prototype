# airdrop-prototype
A DApp for Airdrops

####Pre-requisites
[Nodejs 8.9.4](https://nodejs.org/download/release/v8.9.4/)<br />
[Yarn](https://yarnpkg.com/lang/en/docs/install/)<br />
[Ganache](https://github.com/trufflesuite/ganache-cli) - or any other Ethereum RPC client <br />
[MetaMask](https://metamask.io/)

#### Clone repo
```
$ git clone https://github.com/patitonar/airdrop-prototype.git
```

#### Install dependencies
Install app dependencies
```
$ yarn
```

Install ganache-cli
```
npm install -g ganache-cli
```

#### Running the app
Start ganache-cli
```
$ ganache-cli
```

Deploy the contracts
```
$ truffle migrate
```

Create Symbolic Link to contracts. This is required only the first time.
```
$ yarn contractLink
```

Start the app
```
$ yarn start
```