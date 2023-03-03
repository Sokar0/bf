/* eslint-disable import/no-unresolved */
import { Logger } from 'tslog';
import * as fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

export const logger: Logger = new Logger({
  name: `${pkg.name}@${pkg.version}`,
});
