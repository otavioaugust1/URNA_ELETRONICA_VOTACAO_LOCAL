// ============================================================
// ESTADO
// ============================================================
const SENHA = "131313";

let S = {
  ativo: false,
  titulo: "",
  digitos: 2,
  cargos: [],
  cargoIdx: 0,
  entrados: [],     // dígitos digitados no momento
  votos: [],        // [{ci, num}] – embaralhado a cada voto
  totalVotos: 0,
  dataInicio: "",
  hashUrna: "",
  branco: false,    // BRANCO selecionado, aguardando CONFIRMA
  travado: false,   // aguardando liberação para o próximo eleitor
};

let cfgCargos = [];

// ============================================================
// UTILITÁRIOS
// ============================================================
const $ = id => document.getElementById(id);
const rand16 = () => Math.floor(Math.random()*0xFFFF).toString(16).toUpperCase().padStart(4,'0');
const serial = () => Array.from({length:2},rand16).join('-');
const hoje = () => new Date().toLocaleDateString("pt-BR");
const agora = () => new Date().toLocaleString("pt-BR");

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function hashSimples(obj){
  const s = JSON.stringify(obj)+Date.now();
  let h=5381;
  for(let i=0;i<s.length;i++) h=((h<<5)+h)+s.charCodeAt(i)|0;
  return Math.abs(h).toString(16).toUpperCase().padStart(8,'0')+'-'+rand16();
}

// ============================================================
// DISPLAY
// ============================================================
function renderDisplay(){
  const el = $("display-conteudo");
  const bc = $("barra-cargo");

  if(!S.ativo){
    el.innerHTML = `<div class="disp-msg aviso">
      ── AGUARDANDO INÍCIO ──<br><br>
      Clique em <strong>INICIAR</strong><br>para abrir a votação.
    </div>`;
    bc.style.display = "none";
    return;
  }

  if(S.travado){
    el.innerHTML = `<div class="disp-msg lock">
      <div style="font-size:2.6rem;line-height:1.1">🗳️</div>
      <div style="font-size:2rem;font-weight:bold;color:#1b5e20;line-height:1.1">FIM</div>
      Seu voto foi registrado. Obrigado!<br>
      <span style="color:#e65100">Aguarde a liberação do mesário<br>para o próximo eleitor.</span><br>
      <button class="bm bm-ok" style="font-size:.9rem;padding:.4em 1.2em;margin-top:.4rem" onclick="abrirLiberar()">🔓 Liberar próximo (senha master)</button>
    </div>`;
    bc.style.display = "none";
    return;
  }

  const cargo = S.cargos[S.cargoIdx];
  const digitos = S.digitos;
  const ent = S.entrados;

  if(S.branco){
    el.innerHTML = `<div class="disp-cargo">${cargo.nome}</div>
      <div class="disp-msg aviso" style="font-size:2.6rem;font-weight:bold;padding:1.5rem 0">VOTO EM BRANCO</div>
      <div class="disp-msg" style="font-size:1.1rem;padding:0">Pressione <b>CONFIRMA</b> (Enter) para votar<br>ou <b>CORRIGE</b> (+) para voltar.</div>`;
    bc.style.display = "flex";
    bc.innerHTML = S.cargos.map((c,i)=>`<span class="btn-cargo ${i===S.cargoIdx?'ativo':''}" style="pointer-events:none;${i<S.cargoIdx?'opacity:.5':''}">${i<S.cargoIdx?'✓ ':''}${c.nome}</span>`).join("");
    return;
  }

  // slots de dígitos
  let slots = "";
  for(let i=0;i<digitos;i++){
    const ch = ent[i]!==undefined ? ent[i] : "";
    const at = i===ent.length ? "ativo" : "";
    slots += `<span class="slot ${at}">${ch}</span>`;
  }

  // candidato (se número completo)
  let candHtml = "";
  if(ent.length===digitos){
    const num = ent.join("");
    const cand = cargo.candidatos.find(c=>c.num===num);
    if(cand){
      candHtml = `
        <div class="disp-candidato">
          <div class="foto-box">
            ${cand.fotoTit ? `<img src="${cand.fotoTit}" alt="titular">` : `<span class="foto-icon">👤</span>`}
          </div>
          <div class="info-cand">
            <div class="campo-label">Nome</div>
            <div class="campo-valor big">${cand.nome||'—'}</div>
            <div class="campo-label">Vice / Chapa</div>
            <div class="campo-valor">${cand.vice||'—'}</div>
            <div class="campo-label">Partido / Grupo</div>
            <div class="campo-valor">${cand.partido||'—'}</div>
          </div>
          ${cand.fotoVice?`<div class="foto-box"><img src="${cand.fotoVice}" alt="vice"></div>`:''}
        </div>`;
    } else {
      candHtml = `<div class="disp-msg erro" style="padding:1rem 0"><b style="font-size:2.4rem">VOTO NULO</b><br><small>Pressione CONFIRMA (Enter) para votar nulo<br>ou CORRIGE (+) para refazer.</small></div>`;
    }
  }

  el.innerHTML = `
    <div class="disp-cargo">${cargo.nome}</div>
    <div class="disp-numero">${slots}</div>
    ${candHtml}
  `;

  // barra de cargos
  bc.style.display = "flex";
  bc.innerHTML = S.cargos.map((c,i)=>
    `<span class="btn-cargo ${i===S.cargoIdx?'ativo':''}" style="pointer-events:none;${i<S.cargoIdx?'opacity:.5':''}">${i<S.cargoIdx?'✓ ':''}${c.nome}</span>`
  ).join("");
}



function flashMsg(msg, tipo="aviso"){
  $("display-conteudo").innerHTML=`<div class="disp-msg ${tipo}">${msg}</div>`;
  setTimeout(renderDisplay,1800);
}

// ============================================================
// TECLADO
// ============================================================
function pressNum(n){
  if(!S.ativo||S.travado||S.branco) return;
  if(S.entrados.length>=S.digitos) return;
  S.entrados.push(String(n));
  somTecla();
  renderDisplay();
}

function pressCorrige(){ if(!S.ativo||S.travado)return; somTecla(); S.entrados=[]; S.branco=false; renderDisplay(); }

function pressConfirma(){
  if(!S.ativo) return;
  if(S.travado){ abrirLiberar(); return; }
  if(S.branco){ registrarVoto(S.cargoIdx,"BRANCO"); return; }
  if(S.entrados.length<S.digitos){ somErro(); flashMsg("NÚMERO INCOMPLETO","erro"); return; }
  const num = S.entrados.join("");
  const cargo = S.cargos[S.cargoIdx];
  const cand = cargo.candidatos.find(c=>c.num===num);
  registrarVoto(S.cargoIdx, cand ? num : "NULO");
}

function pressBranco(){ if(!S.ativo||S.travado)return; S.entrados=[]; S.branco=true; somTecla(); renderDisplay(); }

function registrarVoto(ci, num){
  S.votos.push({ci, num, ts: Date.now()});
  // embaralha só os votos deste cargo (anonimização)
  const deste = shuffle(S.votos.filter(v=>v.ci===ci));
  const outros = S.votos.filter(v=>v.ci!==ci);
  S.votos = [...outros, ...deste];
  S.entrados = []; S.branco = false;

  const f = $("flash-voto");
  const fim = ci >= S.cargos.length-1;
  if(fim){
    // último cargo: voto do eleitor completo -> tiririm e trava a urna
    S.totalVotos++;
    S.travado = true;
    S.cargoIdx = 0;
    somFim();
    f.querySelector(".msg").textContent = "FIM";
  } else {
    S.cargoIdx = ci+1;
    somConfirma();
    f.querySelector(".msg").textContent = "VOTO COMPUTADO";
  }
  f.classList.add("show");
  setTimeout(()=>{ f.classList.remove("show"); renderDisplay(); }, fim ? 2300 : 1000);
}

// eventos teclado HTML
document.querySelectorAll(".tecla[data-n]").forEach(b=>{
  b.addEventListener("click",()=>{
    b.classList.add("press");
    setTimeout(()=>b.classList.remove("press"),130);
    pressNum(b.dataset.n);
  });
});
$("btn-corrige").addEventListener("click", pressCorrige);
$("btn-confirma").addEventListener("click", pressConfirma);
$("btn-branco").addEventListener("click", pressBranco);

// teclado físico
document.addEventListener("keydown", e=>{
  if(e.target.tagName==="INPUT") return;
  // teclado principal (linha de cima) e teclado numérico lateral
  if((e.key>="0"&&e.key<="9") || (e.code>="Numpad0"&&e.code<="Numpad9"))
    pressNum(e.key==="."? null : (e.code.startsWith("Numpad") ? e.code.replace("Numpad","") : e.key));
  if(e.key==="Enter"||e.code==="NumpadEnter") pressConfirma();
  if(e.key==="+"||e.code==="NumpadAdd"||e.key==="Backspace") pressCorrige();
  if(e.key==="-"||e.code==="NumpadSubtract") pressBranco();
});

// ============================================================
// MODAL INICIAR
// ============================================================
$("btn-iniciar").addEventListener("click",()=>{
  if(S.ativo){ alert("Votação já está em andamento.\nFinalize antes de reiniciar."); return; }
  cfgCargos = [
    { nome:"REI DO MILHO", candidatos:[
      {num:"01",nome:"",vice:"",partido:"",fotoTit:"",fotoVice:""},
      {num:"02",nome:"",vice:"",partido:"",fotoTit:"",fotoVice:""},
    ]},
    { nome:"RAINHA DO MILHO", candidatos:[
      {num:"01",nome:"",vice:"",partido:"",fotoTit:"",fotoVice:""},
      {num:"02",nome:"",vice:"",partido:"",fotoTit:"",fotoVice:""},
    ]},
  ];
  renderCargosForm();
  $("ov-iniciar").classList.add("aberto");
});

$("btn-cancel-ini").addEventListener("click",()=>$("ov-iniciar").classList.remove("aberto"));

$("btn-add-cargo").addEventListener("click",()=>{
  const n = cfgCargos.length+1;
  cfgCargos.push({nome:`CARGO ${n}`,candidatos:[{num:"01",nome:"",vice:"",partido:"",fotoTit:"",fotoVice:""}]});
  renderCargosForm();
});

function renderCargosForm(){
  $("cargos-form").innerHTML = cfgCargos.map((cargo,ci)=>`
    <div style="border:1.5px solid #ccc;border-radius:7px;padding:12px;background:#fff;margin-top:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong style="font-size:0.78rem;color:#1a3a6e">📋 CARGO ${ci+1}</strong>
        <button class="bm bm-cancel" style="padding:3px 8px;font-size:0.6rem"
          onclick="remCargo(${ci})">Remover</button>
      </div>
      <label>Nome do Cargo</label>
      <input type="text" value="${cargo.nome}" oninput="cfgCargos[${ci}].nome=this.value">
      ${cargo.candidatos.map((cand,ki)=>renderCandForm(ci,ki,cand)).join("")}
      <button class="bm bm-ok" style="width:100%;margin-top:8px;padding:5px;font-size:0.65rem"
        onclick="addCand(${ci})">+ Candidato</button>
    </div>
  `).join("");
}

function renderCandForm(ci,ki,cand){
  const fTId=`ft-${ci}-${ki}`, fVId=`fv-${ci}-${ki}`;
  return `
    <div style="border:1px solid #dde;border-radius:5px;padding:8px;margin-top:7px;background:#f8f9ff">
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:0.68rem;color:#1a6e1a;font-weight:bold">Candidato ${ki+1}</span>
        <button class="bm bm-cancel" style="padding:2px 7px;font-size:0.58rem"
          onclick="remCand(${ci},${ki})">✕</button>
      </div>
      <label>Número (${S.digitos} dígitos)</label>
      <input type="text" value="${cand.num}" maxlength="${S.digitos}"
        oninput="cfgCargos[${ci}].candidatos[${ki}].num=this.value.padStart(${S.digitos},'0')" placeholder="${'0'.repeat(S.digitos)}">
      <label>Nome</label>
      <input type="text" value="${cand.nome}" oninput="cfgCargos[${ci}].candidatos[${ki}].nome=this.value">
      <label>Vice / Nome da Chapa</label>
      <input type="text" value="${cand.vice}" oninput="cfgCargos[${ci}].candidatos[${ki}].vice=this.value">
      <label>Partido / Grupo</label>
      <input type="text" value="${cand.partido}" oninput="cfgCargos[${ci}].candidatos[${ki}].partido=this.value">
      <div style="margin-top:7px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <label class="foto-label" for="${fTId}">📷 Foto Titular</label>
        <input type="file" id="${fTId}" accept="image/*" onchange="loadFoto(this,${ci},${ki},'fotoTit')">
        ${cand.fotoTit?`<img src="${cand.fotoTit}" class="prev-foto">`:''}
      </div>
      <div style="margin-top:5px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <label class="foto-label" for="${fVId}">📷 Foto Vice</label>
        <input type="file" id="${fVId}" accept="image/*" onchange="loadFoto(this,${ci},${ki},'fotoVice')">
        ${cand.fotoVice?`<img src="${cand.fotoVice}" class="prev-foto">`:''}
      </div>
    </div>`;
}

function loadFoto(inp,ci,ki,campo){
  const f=inp.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=e=>{ cfgCargos[ci].candidatos[ki][campo]=e.target.result; renderCargosForm(); };
  r.readAsDataURL(f);
}

function addCand(ci){
  const total=cfgCargos[ci].candidatos.length+1;
  cfgCargos[ci].candidatos.push({num:String(total).padStart(S.digitos,'0'),nome:"",vice:"",partido:"",fotoTit:"",fotoVice:""});
  renderCargosForm();
}
function remCand(ci,ki){
  if(cfgCargos[ci].candidatos.length<=1){alert("Mínimo 1 candidato.");return;}
  cfgCargos[ci].candidatos.splice(ki,1); renderCargosForm();
}
function remCargo(ci){
  if(cfgCargos.length<=1){alert("Mínimo 1 cargo.");return;}
  cfgCargos.splice(ci,1); renderCargosForm();
}

$("btn-ok-ini").addEventListener("click",()=>{
  const err = $("err-ini");
  if($("inp-senha-ini").value !== SENHA){
    err.textContent="Senha incorreta."; err.style.display="block"; return;
  }
  err.style.display="none";
  S.digitos = parseInt($("inp-digitos").value)||2;
  S.titulo = $("inp-titulo").value.trim()||"Votação";
  S.cargos = JSON.parse(JSON.stringify(cfgCargos));
  S.cargoIdx = 0; S.entrados = []; S.votos = []; S.totalVotos = 0; S.travado = false;
  S.ativo = true;
  S.dataInicio = agora();
  S.hashUrna = hashSimples({titulo:S.titulo, digitos:S.digitos, ts:Date.now()});
  $("serial-num").textContent = serial();
  $("data-urna").textContent = hoje();
  $("banner-top").querySelector(".evento span").textContent = S.titulo;
  $("ov-iniciar").classList.remove("aberto");
  $("inp-senha-ini").value="";
  exibirBU("zeresima");
  renderDisplay();
});

// ============================================================
// MODAL FINALIZAR
// ============================================================
$("btn-finalizar").addEventListener("click",()=>$("ov-finalizar").classList.add("aberto"));
$("btn-cancel-fin").addEventListener("click",()=>$("ov-finalizar").classList.remove("aberto"));
$("btn-ok-fin").addEventListener("click",()=>{
  const err=$("err-fin");
  if($("inp-senha-fin").value!==SENHA){
    err.textContent="Senha incorreta."; err.style.display="block"; return;
  }
  err.style.display="none";
  $("inp-senha-fin").value="";
  $("ov-finalizar").classList.remove("aberto");
  S.ativo=false; S.travado=false;
  somFimVotacao();
  exibirBU("resultado");
  renderDisplay();
});

$("btn-fechar-bu").addEventListener("click",()=>$("ov-boletim").classList.remove("aberto"));

// ============================================================
// BOLETIM DE URNA
// ============================================================
function exibirBU(tipo){
  const now = agora();
  let html = "";

  if(tipo==="zeresima"){
    html = `
      <div class="bu-title">BOLETIM DE URNA — ZERÉSIMA</div>
      <div class="bu-sub">${S.titulo} · ${now}</div>
      <div class="bu-linha"><span>Serial da Urna</span><span>${$("serial-num").textContent}</span></div>
      <div class="bu-linha"><span>Início da Sessão</span><span>${S.dataInicio}</span></div>
      <div class="bu-linha ok"><span>Total de Votos</span><span>0 (ZERO)</span></div>
    `;
    S.cargos.forEach(c=>{
      html+=`<div class="bu-secao">── ${c.nome} ──</div>`;
      c.candidatos.forEach(cand=>{
        html+=`<div class="bu-linha"><span>Nº ${cand.num} · ${cand.nome||'—'}</span><span>0 votos</span></div>`;
      });
      html+=`<div class="bu-linha"><span>Branco</span><span>0</span></div>`;
      html+=`<div class="bu-linha"><span>Nulo</span><span>0</span></div>`;
    });
    html+=`<div class="bu-hash">ZERÉSIMA · HASH: ${S.hashUrna} · ${now}</div>`;

  } else {
    html = `
      <div class="bu-title">BOLETIM DE URNA — RESULTADO FINAL</div>
      <div class="bu-sub">${S.titulo} · Encerramento: ${now}</div>
      <div class="bu-linha"><span>Serial da Urna</span><span>${$("serial-num").textContent}</span></div>
      <div class="bu-linha"><span>Total de Votantes</span><span>${S.totalVotos}</span></div>
    `;

    S.cargos.forEach((cargo,ci)=>{
      const vCargo = S.votos.filter(v=>v.ci===ci);
      const total = vCargo.length;
      const brancos = vCargo.filter(v=>v.num==="BRANCO").length;
      const nulos = vCargo.filter(v=>v.num==="NULO").length;
      const validos = total - brancos - nulos;

      // contagem
      const cont = {};
      cargo.candidatos.forEach(c=>cont[c.num]=0);
      vCargo.filter(v=>v.num!=="BRANCO"&&v.num!=="NULO").forEach(v=>{ if(cont[v.num]!==undefined) cont[v.num]++; });

      // vencedor
      let winNum=null, winQt=-1;
      Object.entries(cont).forEach(([n,q])=>{ if(q>winQt){winQt=q;winNum=n;} });

      html+=`<div class="bu-secao">── ${cargo.nome} · ${total} voto(s) ──</div>`;

      cargo.candidatos.forEach(cand=>{
        const qt = cont[cand.num]||0;
        const pct = validos>0 ? ((qt/validos)*100).toFixed(1) : "0.0";
        const win = winNum===cand.num && qt>0;
        const fillCls = win ? "fill-amarelo" : "fill-verde";
        html+=`
          <div class="bu-linha ${win?'win':''}">
            <span>Nº ${cand.num} · ${cand.nome||'—'}${win?' 🏆':''}</span>
            <span>${qt} votos · ${pct}% válidos</span>
          </div>
          <div class="barra"><div class="barra-fill ${fillCls}" style="width:0" data-w="${pct}%"></div></div>`;
      });

      html+=`
        <div class="bu-linha"><span>Votos Brancos</span>
          <span>${brancos} · ${total>0?((brancos/total)*100).toFixed(1):'0.0'}%</span></div>
        <div class="barra"><div class="barra-fill fill-vermelho" style="width:0"
          data-w="${total>0?(brancos/total*100).toFixed(1)+'%':'0%'}"></div></div>
        <div class="bu-linha"><span>Votos Nulos</span><span>${nulos}</span></div>
        <div class="bu-linha ok"><span>Votos Válidos</span><span>${validos} de ${total}</span></div>
      `;

      // destaque vencedor
      if(winQt>0){
        const wc=cargo.candidatos.find(c=>c.num===winNum);
        html+=`<div class="win-box">
          <div class="wn">🏆 VENCEDOR — ${wc?.nome||winNum}</div>
          ${wc?.vice?`<div class="wv">Vice/Chapa: ${wc.vice}</div>`:''}
        </div>`;
      } else {
        html+=`<div style="text-align:center;color:#aaa;font-size:0.7rem;margin:4px 0">— Nenhum voto registrado —</div>`;
      }
    });

    html+=`<div class="bu-hash">RESULTADO FINAL · HASH: ${S.hashUrna} · ${now}</div>`;
  }

  $("bu-content").innerHTML = html;
  $("ov-boletim").classList.add("aberto");

  // anima barras
  setTimeout(()=>{
    document.querySelectorAll(".barra-fill[data-w]").forEach(b=>{
      b.style.width = b.dataset.w;
    });
  },120);
}

// ============================================================
// SONS (sintetizados via Web Audio, sem arquivos externos)
// ============================================================
let _ac=null;
function ac(){
  try{
    if(!_ac) _ac=new (window.AudioContext||window.webkitAudioContext)();
    if(_ac.state==="suspended") _ac.resume();
  }catch(e){}
  return _ac;
}
function tom(freq,ini,dur,tipo="square",vol=0.15){
  const c=ac(); if(!c) return;
  const o=c.createOscillator(), g=c.createGain();
  o.type=tipo; o.frequency.value=freq;
  const t=c.currentTime+ini;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(vol,t+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+dur+0.02);
}
const somTecla=()=>tom(1400,0,0.07);
const somErro=()=>{tom(220,0,0.25,"sawtooth",0.2);tom(180,0.12,0.3,"sawtooth",0.2);};
const somConfirma=()=>{tom(1000,0,0.1);tom(1300,0.12,0.18);};
function somFim(){ // "tiririm" da urna brasileira: curtos rápidos + um longo
  [0,0.11,0.22].forEach(t=>tom(1000,t,0.08,"square",0.2));
  tom(1000,0.36,1.1,"square",0.2);
}
function somFimVotacao(){
  [[523,0],[659,0.15],[784,0.3],[1047,0.45],[784,0.65],[1047,0.8],[1319,0.95]]
    .forEach(([f,t],i,a)=>tom(f,t,i===a.length-1?0.8:0.16,"triangle",0.25));
}

// ============================================================
// LIBERAR PRÓXIMO ELEITOR (senha master)
// ============================================================
function abrirLiberar(){
  $("err-lib").style.display="none";
  $("ov-liberar").classList.add("aberto");
  setTimeout(()=>$("inp-senha-lib").focus(),50);
}
function liberar(){
  if($("inp-senha-lib").value!==SENHA){
    $("err-lib").textContent="Senha incorreta."; $("err-lib").style.display="block"; return;
  }
  $("inp-senha-lib").value="";
  liberarOk();
}
function liberarOk(){
  $("ov-liberar").classList.remove("aberto");
  S.travado=false; S.cargoIdx=0; S.entrados=[]; S.branco=false;
  somConfirma();
  renderDisplay();
}
$("btn-ok-lib").addEventListener("click",liberar);
$("inp-senha-lib").addEventListener("keydown",e=>{ if(e.key==="Enter") liberar(); });
$("btn-cancel-lib").addEventListener("click",()=>{ $("inp-senha-lib").value=""; $("ov-liberar").classList.remove("aberto"); });

// ============================================================
// PAINEL DO MESÁRIO (mesario.html em outra janela)
// ============================================================
let mesWin=null;
$("btn-mesario").addEventListener("click",async ()=>{
  if(window.urnaAPI){ // app desktop: 2ª janela (2º monitor se houver); outros PCs acessam pela rede
    window.urnaAPI.abrirMesario();
    return;
  }
  mesWin=window.open("mesario.html","mesario","width=520,height=620");
  setTimeout(enviarEstado,500);
});
function enviarEstado(){
  const est={tipo:"estado",ativo:S.ativo,travado:S.travado,total:S.totalVotos,titulo:S.titulo};
  if(window.urnaAPI) window.urnaAPI.enviarEstado(est);
  if(mesWin&&!mesWin.closed) mesWin.postMessage(est,"*");
}
function tentarLiberar(senha){
  if(!S.ativo) return {ok:false,msg:"A votação não está em andamento."};
  if(!S.travado) return {ok:false,msg:"A urna não está aguardando liberação."};
  if(senha!==SENHA) return {ok:false,msg:"Senha incorreta."};
  liberarOk();
  return {ok:true,msg:""};
}
if(window.urnaAPI){
  window.urnaAPI.onLiberar((id,senha)=>{ window.urnaAPI.responder(id,tentarLiberar(senha)); enviarEstado(); });
}
setInterval(enviarEstado,1000);
window.addEventListener("message",e=>{
  if(!mesWin||e.source!==mesWin||!e.data||e.data.tipo!=="liberar") return;
  const r=tentarLiberar(e.data.senha);
  mesWin.postMessage({tipo:"resposta",ok:r.ok,msg:r.msg},"*");
  enviarEstado();
});

// ============================================================
// LISTA DE CANDIDATOS
// ============================================================
function abrirCandidatos(){
  const el=$("lista-candidatos");
  if(!S.ativo){
    el.innerHTML='<div class="disp-msg aviso" style="font-size:.9rem;padding:16px 0">Inicie a votação para ver os candidatos.</div>';
  } else {
    el.innerHTML=S.cargos.map(c=>`
      <div class="cand-lista-cargo">${c.nome}</div>
      ${c.candidatos.map(k=>`
        <div class="cand-lista-item">
          ${k.fotoTit?`<img src="${k.fotoTit}" alt="">`:'<div class="ph">👤</div>'}
          <span class="cand-lista-num">${k.num}</span>
          <div><strong>${k.nome||'—'}</strong>
          ${k.vice?`<br><small>Vice/Chapa: ${k.vice}</small>`:''}
          ${k.partido?`<br><small>${k.partido}</small>`:''}</div>
        </div>`).join("")}`).join("");
  }
  $("ov-candidatos").classList.add("aberto");
}
$("btn-candidatos").addEventListener("click",abrirCandidatos);
$("btn-fechar-cand").addEventListener("click",()=>$("ov-candidatos").classList.remove("aberto"));

// ============================================================
// INIT
// ============================================================
$("serial-num").textContent = serial();
$("data-urna").textContent = hoje();
renderDisplay();
