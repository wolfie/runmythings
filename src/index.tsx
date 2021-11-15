#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./App";

const _cli = meow(
  `
Usage
	$ runmythings

Options
	--name  Your name

Examples
	$ runmythings --name=Jane
	Hello, Jane
`,
  {
    flags: {
      name: {
        type: "string",
      },
    },
  }
);

render(<App />);
