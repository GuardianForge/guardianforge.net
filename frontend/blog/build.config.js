const fs = require("fs")

let config = require("./build.config.json")

// if(fs.existsSync("./build.config.dev.json")) {
//   let devConfig = require("./build.config.dev.json")
//   config = devConfig
// }

module.exports = config