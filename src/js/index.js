import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";
import "./../css/index.css";
import Split from "./split";

const promisify = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userAccount: 0x0,
      userBalance: 0,
      userOwed: 0
    };
    if (typeof web3 !== "undefined") {
      console.log("Using web3 detected from external source like Metamask");
      this.web3 = new Web3(web3.currentProvider);
    } else {
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:7545")
      );
    }

    const MyContract = this.web3.eth.contract(
      JSON.parse(
        '[ { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "pendingWithdrawls", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "sender", "type": "address" }, { "indexed": true, "name": "recipient1", "type": "address" }, { "indexed": true, "name": "recipient2", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "amountToRecipient1", "type": "uint256" }, { "indexed": false, "name": "amountToRecipient2", "type": "uint256" } ], "name": "LogSplitFunds", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "receiver", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "LogWithdrawal", "type": "event" }, { "constant": false, "inputs": [ { "name": "recipient1", "type": "address" }, { "name": "recipient2", "type": "address" } ], "name": "splitEther", "outputs": [ { "name": "amountToRecipient1", "type": "uint256" }, { "name": "amountToRecipient2", "type": "uint256" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]'
      )
    );

    this.state.ContractInstance = MyContract.at(
      "0x16420fd34b44d91217871bd6088cdb09db19bdb3"
    );

    const filter = web3.eth.filter("latest");
    filter.watch((err, res) => {
      if (err) {
        console.log(`Watch error: ${err}`);
      } else {
        web3.eth.getBalance(this.state.userAccount, (err, bal) => {
          this.setState({ userBalance: bal });
        });

        this.state.ContractInstance.pendingWithdrawls(
          this.state.userAccount,
          (err, _userOwed) => {
            this.setState({ userOwed: _userOwed });
          }
        );
      }
    });

    this.split = this.split.bind(this);
    this.withdraw = this.withdraw.bind(this);
  }

  componentDidMount() {
    this.updateState();
    //this.setupListeners();
  }

  async updateState() {
    console.log(this.web3.eth.accounts[0]);
    this.setState({ userAccount: this.web3.eth.accounts[0] });

    this.setState({
      userBalance: await promisify(cb =>
        this.web3.eth.getBalance(this.web3.eth.accounts[0], cb)
      )
    });

    this.setState({
      userOwed: await promisify(cb =>
        this.state.ContractInstance.pendingWithdrawls(this.web3.eth.accounts[0], cb)
      )
    });
  }

  split(recipient1, recipient2, ether) {
    this.state.ContractInstance.splitEther(recipient1, recipient2,
      { from: this.state.userAccount, value: this.web3.toWei(ether) },
      (err, txHash) => {
        console.log(err);
        console.log(txHash);
      }
    );
  }

  withdraw() {
    this.state.ContractInstance.withdraw({ from: this.state.userAccount }, (err, txHash) => {
      console.log(err);
      console.log(txHash);
    });
  }

  render() {
    return (
      <div className="splitter-app">
        <h1>Welcome to the Ether Splitter!</h1>
        <h2>You can split ether between 2 accounts or withdraw any amount which you are owed (any Ether split to you)</h2>
        <div>
          Your Balance: {this.web3.fromWei(this.state.userBalance).toString(10)} Ether
        </div>
        <div>
          You are owed: {this.web3.fromWei(this.state.userOwed).toString(10)}
        </div>
        <button onClick={this.withdraw}>Withdraw {this.web3.fromWei(this.state.userOwed).toString(10)}</button>
        <br />
        <h2>Split up some of your Ether</h2>
        <Split
          onClick={this.split}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
