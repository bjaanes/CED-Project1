import React from "react";

export default function(props) {
  let name = "stranger";
  switch (props.user) {
    case props.alice:
      name = "Alice";
      break;
    case props.bob:
      name = "Bob";
      break;
    case props.carol:
      name = "Carol";
      break;
  }

  return <div>Hello, {name}!</div>;
};
