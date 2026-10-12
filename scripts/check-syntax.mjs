import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
if(!scripts.length) throw new Error('No inline JavaScript found');
for (const [i,m] of scripts.entries()) new Script(m[1],{filename:`inline-script-${i+1}.js`});
if(!/<html\b/i.test(html)||!/<main\b/i.test(html)||!/<\/html>/i.test(html)) throw new Error('HTML structure incomplete');
console.log(`PASS: ${scripts.length} inline script(s) parse; basic HTML landmarks present`);
