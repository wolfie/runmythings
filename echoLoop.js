const fs = require("fs");
console.log(
  "Running this code:\n" + fs.readFileSync(__filename, { encoding: "utf-8" })
);

let i = 0;

const echoLoop = () => {
  console.log(`${(++i).toString().padStart(4, "0")}: ${Math.random()}`);
  setTimeout(echoLoop, Math.random() * 1500 + 500);
};

echoLoop();
