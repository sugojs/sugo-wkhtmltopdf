import { ChildProcess, spawn } from 'child_process';

const quote = (val: string) => {
  // escape and quote the value if it is a string and this isn't windows
  if (typeof val === 'string' && process.platform !== 'win32') {
    val = '"' + val.replace(/(["\\$`])/g, '\\$1') + '"';
  }

  return val;
};

export const wkhtmltopdf = (input: string, options: string[] = []) =>
  new Promise<Buffer>((resolve, reject) => {
    const isUrl = /^(https?|file):\/\//.test(input);
    const childArgs = [wkhtmltopdf.command].concat(options, [isUrl ? quote(input) : '-', '-']);
    let child: ChildProcess;
    if (process.platform === 'win32') {
      child = spawn(wkhtmltopdf.command, childArgs.slice(1));
    } else if (process.platform === 'darwin') {
      child = spawn('/bin/sh', ['-c', childArgs.join(' ') + ' | cat ; exit ${PIPESTATUS[0]}']);
    } else {
      child = spawn(wkhtmltopdf.shell, ['-c', childArgs.join(' ') + ' | cat ; exit ${PIPESTATUS[0]}']);
    }
    child.on('exit', (code: number) => {
      if (code !== 0) {
        reject(new Error('wkhtmltopdf exited with code ' + code));
      }
    });
    child.once('error', (err: Error) => reject(err));
    if (!isUrl) {
      child.stdin.on('error', (err: Error) => reject(err));
      child.stdin.end(input);
    }
    let buffer: Buffer = Buffer.from('');
    let stderrBuffer: Buffer = Buffer.from('');
    child.stdout.on('data', (data: string) => {
      const auxBuffer: Buffer = Buffer.from(data, 'utf8');
      buffer = Buffer.concat([buffer, auxBuffer]);
    });
    child.stderr.on('data', data => {
      const auxBuffer: Buffer = Buffer.from(data, 'utf8');
      stderrBuffer = Buffer.concat([stderrBuffer, auxBuffer]);
    });
    // child.stderr.on('end', () => {
    //   console.log(stderrBuffer.toString());
    // });
    child.stdout.on('end', () => resolve(buffer));
    child.stdout.on('finish', () => resolve(buffer));
    child.stdout.on('error', (err: Error) => reject(err));
  });

wkhtmltopdf.command = 'wkhtmltopdf';
wkhtmltopdf.shell = '/bin/bash';
export default wkhtmltopdf;
