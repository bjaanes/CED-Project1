import React from "react";

export default class Withdraw extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick() {
    if (this.props.user === this.props.bob) {
      this.props.onClick(this.props.bob);
    } else if (this.props.user === this.props.carol) {
      this.props.onClick(this.props.carol);
    }
  }

  render() {
    if (this.props.user === this.props.bob || this.props.user === this.props.carol) {
      let owed = 0;
      if (this.props.user === this.props.bob) {
        owed = this.props.bobOwed;
      } else if (this.props.user === this.props.carol) {
        owed = this.props.carolOwed;
      }

      return (
        <div>
          <button onClick={this.handleOnClick}>Withdraw {owed}</button>
        </div>
      );
    } else {
      return <div />;
    }
  }
}
