import { ChildProcess, spawn } from 'child_process';

const quote = (val: string) => {
  // escape and quote the value if it is a string and this isn't windows
  if (typeof val === 'string' && process.platform !== 'win32') {
    val = '"' + val.replace(/(["\\$`])/g, '\\$1') + '"';
  }

  return val;
};

export const wkhtmltopdf = (input: string, options: string[] = []) => {
  return new Promise<Buffer>((resolve, reject) => {
    const isUrl = /^(https?|file):\/\//.test(input);
    input = isUrl ? quote(input) : '-';
    const childArgs = options.concat([input, '-']);
    let child: ChildProcess;
    if (process.platform === 'win32') {
      child = spawn(wkhtmltopdf.command, childArgs);
    } else if (process.platform === 'darwin') {
      child = spawn('/bin/sh', ['-c', childArgs.join(' ') + ' | cat ; exit ${PIPESTATUS[0]}']);
    } else {
      // this nasty business prevents piping problems on linux
      // The return code should be that of wkhtmltopdf and not of cat
      // http://stackoverflow.com/a/18295541/1705056
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
    const stream = child.stdout;
    let buffer: Buffer = Buffer.from('');
    stream.on('data', (data: string) => {
      const auxBuffer: Buffer = Buffer.from(data, 'utf8');
      buffer = Buffer.concat([buffer, auxBuffer]);
    });
    stream.on('end', () => resolve(buffer));
    stream.on('finish', () => resolve(buffer));
    stream.on('error', (err: Error) => reject(err));
  });
};

wkhtmltopdf.command = 'wkhtmltopdf';
wkhtmltopdf.shell = '/bin/bash';
export default wkhtmltopdf;
