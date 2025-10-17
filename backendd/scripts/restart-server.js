const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting server...');

// Kill any existing node processes
if (process.platform === 'win32') {
  spawn('taskkill', ['/f', '/im', 'node.exe'], { stdio: 'inherit' });
} else {
  spawn('pkill', ['-f', 'node'], { stdio: 'inherit' });
}

// Wait a moment then start the server
setTimeout(() => {
  const serverPath = path.join(__dirname, 'server.js');
  const server = spawn('node', [serverPath], { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
  
  console.log('✅ Server restarted successfully!');
}, 2000);
