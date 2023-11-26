import watch from 'glob-watcher';
import { spawn } from 'child_process';
import killPort from 'kill-port';

const watcher = watch(['docs/**/*.md', 'utils']);

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'; // 跨平台处理npm命令
let webpackProcess = spawn(npmCmd, ['run', 'dev'], {
  shell: true, // 设置为true以运行shell命令
  stdio: 'inherit', // 将子进程的输入输出与父进程绑定，使其共享终端
});

webpackProcess.on('close', (code) => {
  console.log(`Webpack 进程退出 code: ${code}`);
});

let lock = false;

const handler = (path, stat) => {
  if (lock) return;
  lock = true;
  console.log(path);
  // 杀死之前的Webpack进程
  webpackProcess.kill();
  const defaultWebpackPort = 5173;
  killPort(defaultWebpackPort).then(() => {
    console.log(`端口 ${defaultWebpackPort} 关闭.`);
    webpackProcess = spawn(npmCmd, ['run', 'dev'], {
      shell: true, // 设置为true以运行shell命令
      stdio: 'inherit', // 将子进程的输入输出与父进程绑定，使其共享终端
    });
    lock = false;
  });
};

watcher
  .on('add', handler)
  .on('unlink', handler)
  .on('addDir', handler)
  .on('unlinkDir', handler);

console.log('文件监听器启动成功');
