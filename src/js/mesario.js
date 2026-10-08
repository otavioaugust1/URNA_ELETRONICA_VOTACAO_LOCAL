const $=id=>document.getElementById(id);
let estado=null;
function render(){
  const st=$("status"), btn=$("btn");
  if(!estado){ st.className="status st-off"; st.textContent="Aguardando conexão com a urna…\n(abra este painel pelo botão Mesário da urna)"; btn.disabled=true; return; }
  $("evento").textContent=estado.titulo?"· "+estado.titulo:"";
  $("total").textContent=estado.ativo?"Eleitores que já votaram: "+estado.total:"";
  if(!estado.ativo){ st.className="status st-off"; st.textContent="Votação não iniciada ou encerrada."; btn.disabled=true; }
  else if(estado.travado){ st.className="status st-trav"; st.textContent="✔ Voto registrado.\nUrna aguardando liberação."; btn.disabled=false; }
  else { st.className="status st-vot"; st.textContent="⏳ Eleitor votando…"; btn.disabled=true; }
}
const REDE=location.protocol.startsWith("http");
function mostrar(r){
  const m=$("msg");
  m.className=r.ok?"ok":"erro";
  m.textContent=r.ok?"Urna liberada para o próximo eleitor!":r.msg;
  if(r.ok) $("senha").value="";
  setTimeout(()=>m.textContent="",3500);
}
async function atualizar(){
  try{
    const r=await fetch("/estado",{cache:"no-store"});
    estado=await r.json();
  }catch(e){ estado=null; }
  render();
}
async function liberarRede(){
  try{
    const r=await fetch("/liberar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senha:$("senha").value})});
    mostrar(await r.json());
  }catch(e){ mostrar({ok:false,msg:"Sem conexão com a urna."}); }
  atualizar();
}
function liberar(){
  if(REDE) return liberarRede();
  if(!window.opener){ $("msg").className="erro"; $("msg").textContent="Sem conexão com a urna."; return; }
  window.opener.postMessage({tipo:"liberar",senha:$("senha").value},"*");
}
$("btn").addEventListener("click",liberar);
$("senha").addEventListener("keydown",e=>{ if(e.key==="Enter"&&!$("btn").disabled) liberar(); });
window.addEventListener("message",e=>{
  if(e.source!==window.opener||!e.data) return;
  if(e.data.tipo==="estado"){ estado=e.data; render(); }
  if(e.data.tipo==="resposta"){
    mostrar(e.data);
  }
});
render();
if(REDE){
  atualizar(); setInterval(atualizar,1000);
  fetch("/enderecos").then(r=>r.json()).then(l=>{
    if(!l.length) return;
    $("rede").style.display="block";
    $("rede").innerHTML="Acesso por outro computador da rede:<br><b>"+l.join("<br>")+"</b>";
  }).catch(()=>{});
}
