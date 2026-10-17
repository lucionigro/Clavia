import {build} from 'esbuild';
await build({stdin:{contents:'export { unzipSync } from "fflate";',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',outfile:'vendor/fflate.js',minify:true,legalComments:'eof'});
