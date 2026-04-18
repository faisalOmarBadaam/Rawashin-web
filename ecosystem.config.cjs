/* global module */

module.exports = {
  apps: [
    {
      name: "rawashnWeb",
      cwd: "C:\\deploy\\rawashnWeb",
      script: ".\\node_modules\\next\\dist\\bin\\next",
      args: "start -p 3000",
      interpreter: "C:\\Program Files\\nodejs\\node.exe",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
