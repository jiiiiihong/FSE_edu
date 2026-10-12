import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../worker/ai-dictionary.js',import.meta.url),'utf8');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
const originalFetch=globalThis.fetch,originalError=console.error;
const env={ALLOWED_ORIGIN:'https://jiiiiihong.github.io',OPENAI_API_KEY:'private-test-key',OPENAI_MODEL:'gpt-4.1-mini',TURNSTILE_SECRET:'private-test-secret',TURNSTILE_HOSTNAME:'jiiiiihong.github.io',AI_RATE_LIMITER:{limit:async()=>({success:true})}};
async function simulate(upstreamStatus,upstreamBody){
 const logs=[];
 console.error=(message)=>logs.push(JSON.parse(message));
 globalThis.fetch=async url=>String(url).includes('siteverify')?new Response(JSON.stringify({success:true,hostname:env.TURNSTILE_HOSTNAME}),{status:200}):new Response(JSON.stringify(upstreamBody),{status:upstreamStatus});
 try{
  const request=new Request('https://worker.invalid/',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN,'CF-Connecting-IP':'192.0.2.1','Content-Type':'application/json'},body:JSON.stringify({term:'Backlash',turnstileToken:'secret-test-token'})});
  const response=await worker.fetch(request,env);
  return {response,logs};
 }finally{globalThis.fetch=originalFetch;console.error=originalError}
}
test('OpenAI 400 response reports only safe status/type/code',async()=>{
 const {response,logs}=await simulate(400,{error:{type:'invalid_request_error',code:'invalid_json_schema',message:'SECRET user content'}});
 assert.equal(response.status,502);assert.equal(logs[0].kind,'openai_http_error');assert.equal(logs[0].upstreamStatus,400);
 assert.equal(logs[0].code,'invalid_json_schema');assert.ok(!JSON.stringify(logs).includes('SECRET'));
});
test('OpenAI 401/429 are diagnosed without leaking response bodies',async()=>{
 for(const status of [401,429]){const {response,logs}=await simulate(status,{error:{type:'billing_error',code:'quota_exceeded'}});assert.equal(response.status,502);assert.equal(logs[0].upstreamStatus,status)}
});
test('incomplete model output reports safe completion reason',async()=>{
 const {response,logs}=await simulate(200,{status:'incomplete',incomplete_details:{reason:'max_output_tokens'}});
 assert.equal(response.status,502);assert.equal(logs[0].kind,'openai_incomplete');assert.equal(logs[0].reason,'max_output_tokens');
});
test('malformed model output is categorized',async()=>{
 const {response,logs}=await simulate(200,{status:'completed',output:[{content:[{type:'output_text',text:'not-json'}]}]});
 assert.equal(response.status,502);assert.equal(logs[0].kind,'openai_json_parse_error');
});
test('schema mismatch is categorized',async()=>{
 const {response,logs}=await simulate(200,{status:'completed',output:[{content:[{type:'output_text',text:'{}'}]}]});
 assert.equal(response.status,502);assert.equal(logs[0].kind,'openai_schema_mismatch');
});
