import React from "react";

export default class Split extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      recipient1: "",
      recipient2: ""
    };

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleRecipient1Change = this.handleRecipient1Change.bind(this);
    this.handleRecipient2Change = this.handleRecipient2Change.bind(this);
  }

  handleValueChange(event) {
    this.setState({ value: event.target.value });
  }

  handleOnClick() {
    this.props.onClick(
      this.state.recipient1,
      this.state.recipient2,
      this.state.value
    );
  }

  handleRecipient1Change(event) {
    this.setState({ recipient1: event.target.value });
  }

  handleRecipient2Change(event) {
    this.setState({ recipient2: event.target.value });
  }

  render() {
    return (
      <div className="split-container">
        <div className="split-input-container">
          <label for="recipient1">Recipient 1</label>
          <input
            name="recipient1"
            id="recipient1"
            type="text"
            value={this.state.recipient1}
            onChange={this.handleRecipient1Change}
          />
        </div>
        <div className="split-input-container">
          <label for="recipient1">Recipient 2</label>
          <input
            type="text"
            value={this.state.recipient2}
            onChange={this.handleRecipient2Change}
          />
        </div>
        <div className="split-input-container">
          <label for="value">Ether to split</label>
          <input
            type="number"
            step="0.01"
            value={this.state.value}
            onChange={this.handleValueChange}
          />
        </div>
        <button onClick={this.handleOnClick}>Split</button>
      </div>
    );
  }
}
