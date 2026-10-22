/* FlipFinder AI – wholesale profit calculator (shared). Computes everything from existing lead fields. */
(function(){
const M=n=>(n<0?'−$':'$')+Math.round(Math.abs(n)).toLocaleString('en-US');
const num=v=>{const n=parseFloat(String(v).replace(/[^0-9.\-]/g,''));return isNaN(n)?0:n};
const REG=[];
function repairs(d){ // same basis as spread: spread = 0.7*value − repairs − price
  if(!d.value) return 0;
  if(typeof d.spread==='number'){const r=Math.round(0.7*d.value-d.price-d.spread);return r>0?r:0}
  return Math.round(d.value*0.15);
}
function calc(i){
  const maxBuyer=i.arv*i.pct/100-i.rep-(i.cc||0);
  const fee=maxBuyer-i.contract;
  const maxOffer=maxBuyer-i.target;
  const v=fee>=10000?'good':fee>=3000?'thin':'no';
  return {maxBuyer,fee,maxOffer,v};
}
function fee(d){if(!d||!d.value||!d.price)return null;return calc({arv:d.value,pct:70,rep:repairs(d),contract:d.price,target:10000}).fee}
const css=`.pf-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;align-self:flex-start}
.pf-good{background:#e7f4ec;color:#2f7d55}.pf-thin{background:#fbf3dc;color:#8a6a12}.pf-no{background:#f8e8e8;color:#a33}
.pf-open{margin-top:auto;background:transparent;border:1px solid var(--ink,#111);color:var(--ink,#111);font:600 14px Inter,system-ui,sans-serif;padding:10px;border-radius:12px;cursor:pointer}.pf-open:hover{background:var(--ink,#111);color:#fff}
.pf-open+.btn{margin-top:6px!important}
.pf-bg{position:fixed;inset:0;background:rgba(10,11,14,.55);backdrop-filter:blur(4px);z-index:999;display:none;align-items:center;justify-content:center}.pf-bg.on{display:flex}
.pf{background:#fff;width:min(520px,100%);max-height:92vh;overflow:auto;border-radius:20px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:Inter,system-ui,sans-serif;color:#15161a;box-sizing:border-box}
@media(max-width:600px){.pf-bg{align-items:flex-end}.pf{border-radius:20px 20px 0 0;max-height:90vh}}
.pf h3{margin:0 0 2px;font-size:19px;letter-spacing:-.01em}.pf .sub{font-size:12.5px;color:#6b7280;margin-bottom:14px}.pf .x{float:right;border:0;background:#f3f1ec;border-radius:999px;width:32px;height:32px;font-size:18px;cursor:pointer}
.pf label{display:block;font-size:12px;font-weight:600;color:#6b7280;margin:10px 0 4px;text-transform:uppercase;letter-spacing:.05em}
.pf input[type=text],.pf input[type=number]{width:100%;box-sizing:border-box;border:1px solid #e5e2da;border-radius:10px;padding:10px 12px;font:500 16px Inter,system-ui;background:#fbfaf7}
.pf .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pf input[type=range]{width:100%;accent-color:#b8913a}
.pf .out{margin-top:16px;border-radius:14px;background:#15161a;color:#fff;padding:16px}.pf .out .r{display:flex;justify-content:space-between;font-size:14px;padding:5px 0;color:#d6d3cc}.pf .out .r b{color:#fff}
.pf .big{font-size:30px;font-weight:700;letter-spacing:-.03em;margin:2px 0 6px}.pf .vd{display:inline-block;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;margin-bottom:6px}
.pf .vd.good{background:#2f7d55}.pf .vd.thin{background:#b8913a}.pf .vd.no{background:#a33}.pf .ex{font-size:13.5px;color:#e9e6df;margin-top:8px;line-height:1.45}
.pf .note{font-size:11.5px;color:#6b7280;margin-top:12px;line-height:1.45}`;
function form(id){return `<div class="pf-form" id="${id}">
<label>Property (optional)</label><input type="text" data-k="addr" placeholder="Address">
<div class="two"><div><label>ARV / value</label><input type="number" inputmode="numeric" data-k="arv" placeholder="150000"></div><div><label>Repairs</label><input type="number" inputmode="numeric" data-k="rep" placeholder="25000"></div></div>
<label>Cash buyer pays up to <span data-o="pct">70</span>% of ARV</label><input type="range" min="60" max="80" step="1" value="70" data-k="pct">
<div class="two"><div><label>Your contract price</label><input type="number" inputmode="numeric" data-k="contract" placeholder="60000"></div><div><label>Buyer closing costs</label><input type="number" inputmode="numeric" data-k="cc" placeholder="0 (optional)"></div></div>
<label>Fee you want</label><input type="number" inputmode="numeric" data-k="target" value="10000">
<div class="out"><div style="font-size:12px;color:#a9a59c;text-transform:uppercase;letter-spacing:.08em">Your assignment fee</div><div class="big" data-o="fee">—</div><span class="vd" data-o="vd"></span>
<div class="r"><span>Max cash-buyer price</span><b data-o="mb">—</b></div><div class="r"><span>Max offer to seller for your fee</span><b data-o="mo">—</b></div><div class="ex" data-o="ex">Enter the ARV, repairs and your contract price.</div></div>
<button type="button" class="gc-open" data-gc style="margin-top:12px">Get This Under Contract</button><div class="note">Rough numbers. Lead values are automated listing estimates, not true after-repair values, and repairs are guesses. Verify with real sold comps and a walkthrough before you sign anything. Formula: max buyer price = ARV × % − repairs − buyer closing costs; fee = max buyer price − your contract price.</div></div>`}
function wire(root){
  const q=k=>root.querySelector(`[data-k="${k}"]`),o=k=>root.querySelector(`[data-o="${k}"]`);
  function up(){const i={arv:num(q('arv').value),rep:num(q('rep').value),pct:num(q('pct').value),contract:num(q('contract').value),cc:num(q('cc').value),target:num(q('target').value)};
    o('pct').textContent=i.pct;
    if(!i.arv){o('fee').textContent='—';o('mb').textContent='—';o('mo').textContent='—';o('vd').textContent='';o('vd').className='vd';o('ex').textContent='Enter the ARV, repairs and your contract price.';return}
    const r=calc(i);o('mb').textContent=M(r.maxBuyer);o('mo').textContent=M(r.maxOffer);
    if(!i.contract){o('fee').textContent='—';o('vd').textContent='';o('vd').className='vd';o('ex').textContent=`A cash buyer would pay up to ${M(r.maxBuyer)}. Get it under contract at ${M(r.maxOffer)} or less to make ${M(i.target)}.`;return}
    o('fee').textContent=M(r.fee);o('vd').className='vd '+r.v;o('vd').textContent=r.v=='good'?'Good deal':r.v=='thin'?'Thin deal':'No deal';
    o('ex').textContent=r.fee>0?`Contract it at ${M(i.contract)}, assign it to a cash buyer at ${M(r.maxBuyer)}, and you keep about ${M(r.fee)}. To make ${M(i.target)}, offer the seller ${M(r.maxOffer)} or less.`
      :`At ${M(i.contract)} there's no room for a fee: a cash buyer only pays about ${M(r.maxBuyer)}. You'd need the seller at ${M(r.maxOffer)} or less to make ${M(i.target)}.`}
  const gb=root.querySelector('[data-gc]');if(gb)gb.onclick=()=>{const i={arv:num(q('arv').value),rep:num(q('rep').value),pct:num(q('pct').value),contract:num(q('contract').value),cc:num(q('cc').value),target:num(q('target').value)};const r=calc(i);const d=Object.assign({},root._lead||{},{address:q('addr').value||(root._lead||{}).address});if(root.closest('.pf-bg'))root.closest('.pf-bg').classList.remove('on');GC.open(d,i.arv?Math.max(0,Math.round(i.contract?Math.min(r.maxOffer,i.contract):r.maxOffer)):(i.contract||0))};root.querySelectorAll('input').forEach(e=>e.addEventListener('input',up));root._up=up;root._set=v=>{for(const k in v){const e=q(k);if(e)e.value=v[k]}up()};up();return root}
let sheet;
function ensure(){if(sheet)return sheet;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const bg=document.createElement('div');bg.className='pf-bg';bg.innerHTML=`<div class="pf" role="dialog" aria-modal="true"><button class="x" aria-label="Close">×</button><h3>What can I make?</h3><div class="sub" data-t></div>${form('pf-modal')}</div>`;
  document.body.appendChild(bg);bg.addEventListener('click',e=>{if(e.target==bg||e.target.classList.contains('x'))bg.classList.remove('on')});
  document.addEventListener('keydown',e=>{if(e.key=='Escape')bg.classList.remove('on')});
  sheet={bg,f:wire(bg.querySelector('.pf-form'))};return sheet}
function open(n){const d=REG[n];const s=ensure();s.f._lead=d;s.bg.querySelector('[data-t]').textContent='Wholesale estimate: you contract it and assign it to a cash buyer.';
  s.f._set({addr:d.address||'',arv:d.value||'',rep:d.value?repairs(d):'',pct:70,contract:d.price||'',cc:'',target:10000});s.bg.classList.add('on')}
function cardHTML(d){const n=REG.push(d)-1;const f=fee(d);
  const b=f==null?'':`<span class="pf-badge pf-${f>=10000?'good':f>=3000?'thin':'no'}">Est. fee at asking: ${M(f)}</span>`;
  return `${b}<button type="button" class="pf-open" onclick="PF.open(${n})">What can I make?</button><button type="button" class="gc-open" onclick="GC.open(PF.lead(${n}))">Get This Under Contract</button>`}
document.addEventListener('DOMContentLoaded',()=>{if(!document.querySelector('.pf-bg'))ensure();const c=document.getElementById('pf-standalone');if(c){c.innerHTML=form('pf-page');wire(c.firstElementChild)}});
window.PF={lead:n=>REG[n],open,card:cardHTML,calc,fee,repairs};
})();
