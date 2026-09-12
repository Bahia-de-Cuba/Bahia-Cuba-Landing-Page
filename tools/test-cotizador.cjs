// Ejecución aislada del cotizador: no crea reservas ni llama servicios externos.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function preparar(){
  const eventos={};
  const campos=Object.fromEntries(['cCheckin','cCheckout','cRoom','cGuests','calcTotal','calcDetalle','calcAviso'].map(id=>[id,{value:'',dataset:{},focus(){}}]));
  campos.cRoom.value='Doble';campos.cRoom.selectedIndex=0;
  campos.cRoom.options=[{dataset:{precio:'280.75'}}];campos.cGuests.value='2';
  const form={addEventListener(nombre,fn){eventos[nombre]=fn;}};
  const location={href:''};
  vm.runInNewContext(readFileSync(path.join(__dirname,'../src/js/07-cotizador.js'),'utf8'),{
    $:selector=>selector==='#formCotizacion'?form:campos[selector.slice(1)],
    window:{location},URL_RESERVAS:'https://example.invalid/reservar',
  });
  return {campos,location,enviar:()=>eventos.submit({preventDefault(){}}),recalcular:eventos.change};
}
test('rechaza cuatro huéspedes en una doble y permite tres',()=>{
  const {campos,location,enviar}=preparar();
  campos.cGuests.value='4';enviar();assert.equal(location.href,'');
  assert.match(campos.calcAviso.textContent,/supera la capacidad/);
  campos.cGuests.value='3';enviar();assert.match(location.href,/tipo=doble/);
});
test('respeta capacidad del catálogo, céntimos y límite de fechas',()=>{
  const {campos,location,enviar,recalcular}=preparar();
  assert.equal(campos.calcTotal.textContent,'280.75');
  campos.cRoom.options[0].dataset.capacidad='2';campos.cGuests.value='3';
  enviar();assert.equal(location.href,'');
  campos.cGuests.value='2';campos.cCheckin.value='2060-01-01';campos.cCheckout.value='2062-01-01';
  recalcular();enviar();assert.equal(location.href,'');
  campos.cCheckin.value='2000-01-01';campos.cCheckout.value='2000-01-02';enviar();assert.equal(location.href,'');
});
