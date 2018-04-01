import React from "react";

export default class Split extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleOnClick() {
    this.props.onClick(this.state.value);
  }

  render() {
    if (this.props.user !== this.props.alice) {
      return <div />;
    } else {
      return (
        <div>
          <input
            type="number"
            step="0.01"
            value={this.state.value}
            onChange={this.handleChange}
          />
          <button onClick={this.handleOnClick}>Split with Bob and Carol</button>
        </div>
      );
    }
  }
}
