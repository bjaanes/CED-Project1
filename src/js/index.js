import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";
import "./../css/index.css";
import UserGreeting from "./user_greeting";
import Split from "./split";
import Withdraw from "./withdraw";

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
      aliceBalance: 0,
      bobBalance: 0,
      carolBalance: 0,
      bobOwed: 0,
      carolOwed: 0
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
        '[ { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "pendingWithdrawls", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "carol", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "bob", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "alice", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_bob", "type": "address" }, { "name": "_carol", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [], "name": "splitEther", "outputs": [ { "name": "toBob", "type": "uint256" }, { "name": "toCarol", "type": "uint256" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]'
      )
    );

    this.state.ContractInstance = MyContract.at(
      "0x60a1a9c5bd4edf0c1a77cd3c0e4c759bb2966314"
    );

    const filter = web3.eth.filter("latest");
    filter.watch((err, res) => {
      if (err) {
        console.log(`Watch error: ${err}`);
      } else {
        web3.eth.getBalance(this.state.alice, (err, bal) => {
          this.setState({ aliceBalance: bal });
        });

        web3.eth.getBalance(this.state.bob, (err, bal) => {
          this.setState({ bobBalance: bal });
        });

        web3.eth.getBalance(this.state.carol, (err, bal) => {
          this.setState({ carolBalance: bal });
        });

        this.state.ContractInstance.pendingWithdrawls(
          this.state.bob,
          (err, _bobOwed) => {
            this.setState({ bobOwed: _bobOwed });
          }
        );

        this.state.ContractInstance.pendingWithdrawls(
          this.state.carol,
          (err, _carolOwed) => {
            this.setState({ carolOwed: _carolOwed });
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
    if (!this.state.alice) {
      this.setState({
        alice: await promisify(cb => this.state.ContractInstance.alice(cb))
      });
    }
    if (!this.state.bob) {
      this.setState({
        bob: await promisify(cb => this.state.ContractInstance.bob(cb))
      });
    }
    if (!this.state.carol) {
      this.setState({
        carol: await promisify(cb => this.state.ContractInstance.carol(cb))
      });
    }

    this.setState({
      aliceBalance: await promisify(cb =>
        this.web3.eth.getBalance(this.state.alice, cb)
      )
    });
    this.setState({
      bobBalance: await promisify(cb =>
        this.web3.eth.getBalance(this.state.bob, cb)
      )
    });
    this.setState({
      carolBalance: await promisify(cb =>
        this.web3.eth.getBalance(this.state.carol, cb)
      )
    });

    this.setState({
      bobOwed: await promisify(cb =>
        this.state.ContractInstance.pendingWithdrawls(this.state.bob, cb)
      )
    });
    this.setState({
      carolOwed: await promisify(cb =>
        this.state.ContractInstance.pendingWithdrawls(this.state.carol, cb)
      )
    });

    console.log(this.state);

    this.setState({ userAccount: this.web3.eth.accounts[0] });
  }

  split(ether) {
    this.state.ContractInstance.splitEther(
      { from: this.state.alice, value: this.web3.toWei(ether) },
      (err, txHash) => {
        console.log(err);
        console.log(txHash);
      }
    );
  }

  withdraw(account) {
    this.state.ContractInstance.withdraw({ from: account }, (err, txHash) => {
      console.log(err);
      console.log(txHash);
    });
  }

  render() {
    return (
      <div>
        <UserGreeting
          user={this.state.userAccount}
          alice={this.state.alice}
          bob={this.state.bob}
          carol={this.state.carol}
        />
        <div>
          Alice's Balance:{" "}
          {this.web3.fromWei(this.state.aliceBalance).toString(10)}
        </div>
        <div>
          Bob' Balance: {this.web3.fromWei(this.state.bobBalance).toString(10)}
        </div>
        <div>
          Carol's Balance:{" "}
          {this.web3.fromWei(this.state.carolBalance).toString(10)}
        </div>
        <div>
          Owed to Carol: {this.web3.fromWei(this.state.carolOwed).toString(10)}
        </div>
        <div>
          Owed to Bob: {this.web3.fromWei(this.state.bobOwed).toString(10)}
        </div>
        <Split
          user={this.state.userAccount}
          alice={this.state.alice}
          onClick={this.split}
        />
        <Withdraw
          user={this.state.userAccount}
          bob={this.state.bob}
          carol={this.state.carol}
          bobOwed={this.web3.fromWei(this.state.bobOwed).toString(10)}
          carolOwed={this.web3.fromWei(this.state.carolOwed).toString(10)}
          onClick={this.withdraw}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
