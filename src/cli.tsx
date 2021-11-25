#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./components/App";

const cli = meow(
  `
  Usage
    $ runmythings <cmd> [<cmd> [<cmd>]]

  Options
    --help      show this help
    --version   show version

  Examples
    $ runmythings "echo \\"hello world\\""
`
);

if (cli.input.length === 0) {
  console.error("At least one process required");
  console.error(cli.help);
  process.exit(1);
}
if (cli.input.length > 3) {
  console.error("No more than three processes supported");
  console.error(cli.help);
  process.exit(1);
}

console.log(cli.input);

render(<App commands={cli.input} />);
