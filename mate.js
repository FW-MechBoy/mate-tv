/* Launcher M.A.T.E. para VIDAA. JavaScript viejo a proposito (ES5): el navegador del TV no es moderno.
   Se maneja solo con el control: flechas, OK (corto y mantenido) y Atras. El foco lo lleva este archivo, no el
   navegador: "foco" es el id del elemento enfocado. */
(function () {
  'use strict';

  // ---------------------------------------------------------------- medidas del diseno (lienzo 1280 x 720)
  var COL_INICIO = [460, 658, 856, 1054], FILA_INICIO = [306, 464];
  var COL_APPS = [49, 249, 450, 652, 853, 1054], FILA_APPS = [142, 300, 458];
  var GIRO_INICIO = [0.9, 1, -1.2, 1.4, 1.2, -1, 1.3, -1.4];
  var GIRO_APPS = [-1.2, 1, -0.8, 1.4, -1, 1.2, 1.1, -1.3, 0.9, -1.1, 1.3, -0.9, -1, 1.2, -1.4, 0.8, -1.1];
  var FAV_MAX = 8, POR_PAGINA = 17;
  var PREGUNTA = '¿Qué vemos hoy?', PREGUNTA_APPS = '¿Cuál abrimos?';
  var ESTRELLA = '<svg class="fav" viewBox="0 0 32 32"><path d="M16 2.5l4 8.4 9.2 1.2-6.8 6.3 1.8 9.1L16 23l-8.2 4.5 1.8-9.1-6.8-6.3 9.2-1.2z" fill="#FF9A4D" stroke="#1B1437" stroke-width="3" stroke-linejoin="round"/></svg>';
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var REACCIONES = [
    ['festejando', '¡Vamos!'], ['bailando', '¡A bailar!'], ['choque-de-manos-con-mateperro', '¡Chocá esos cinco!'],
    ['jugando-con-mateperro', 'MATEPERRO quiere jugar'], ['riendose', 'Ja, ja, ja'], ['muerto-de-risa', '¡Me muero de risa!'],
    ['doble-pulgar-arriba', '¡Todo bien por acá!'], ['guitarra-electrica', '¡Rock and roll!'], ['dj', '¡Subí el volumen!'],
    ['skate', '¡Mirá este truco!'], ['superheroe', '¡Al rescate!'], ['volando', '¡Despegue!'], ['trofeo', '¡Campeones!'],
    ['selfie', '¡Selfie!'], ['gol', '¡Gooool!'], ['guino', 'Guiño, guiño'], ['timido', 'Ay, me da vergüenza'],
    ['idea', '¡Tengo una idea!'], ['cantando', 'La, la, la…'], ['maravillado', '¡Guau!']
  ];

  function $(id) { return document.getElementById(id); }

  // ---------------------------------------------------------------- estado
  var apps = [], porId = {}, favs = [];
  var foco = '', pantalla = 'inicio', favIndex = 0, appIndex = 0, entIndex = 0;
  var moviendo = false, abriendo = false;
  var EXT = '.png';          // se cambia a .webp si el navegador lo lee (pesa mucho menos)
  var poseBase = 'saludando', textoBase = PREGUNTA, poseVista = '', reaccionHasta = 0, turnoPose = 0;
  var ultimaTecla = 0, descansando = false, ultimoDescanso = 0;
  var okAbajo = false, okLargo = false, relojOk = 0, relojGlobo = 0, relojReaccion = 0;

  // ---------------------------------------------------------------- arranque
  function escalar() {
    var s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    var l = $('lienzo');
    l.style.webkitTransform = l.style.transform = 'scale(' + s + ')';
    l.style.left = Math.round((window.innerWidth - 1280 * s) / 2) + 'px';
    l.style.top = Math.round((window.innerHeight - 720 * s) / 2) + 'px';
  }

  function detectarWebp(listo) {
    var im = new Image();
    im.onload = function () { if (im.width === 1) EXT = '.webp'; listo(); };
    im.onerror = listo;
    // Un WebP con transparencia de 1 x 1: si carga, el navegador lee los WebP con alfa.
    im.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  }

  function cargarApps() {
    apps = Tele.apps() || MATE_CONFIG.apps;
    apps = apps.slice().sort(function (a, b) { return a.nombre.toLowerCase() < b.nombre.toLowerCase() ? -1 : 1; });
    porId = {};
    for (var i = 0; i < apps.length; i++) porId[apps[i].id] = apps[i];
    favs = [];
    // Las favoritas guardadas de una version anterior (con otros nombres) se descartan.
    if (leer('version-apps') !== '2') {
      guardar('version-apps', '2');
      guardar('favoritas', '');
    }
    var guardadas = leer('favoritas');
    var origen = guardadas ? guardadas.split(',') : MATE_CONFIG.favoritas;
    for (var j = 0; j < origen.length; j++) {
      if (porId[origen[j]] && favs.length < FAV_MAX && favs.indexOf(origen[j]) < 0) favs.push(origen[j]);
    }
    for (var k = 0; k < apps.length && !favs.length; k++) favs.push(apps[k].id);
  }

  function leer(clave) {
    try { return window.localStorage.getItem('mate.' + clave); } catch (e) { return null; }
  }

  function guardar(clave, valor) {
    try { window.localStorage.setItem('mate.' + clave, valor); } catch (e) { /* sin almacenamiento: no se recuerda */ }
  }

  // ---------------------------------------------------------------- stickers
  function sticker(app, x, y, giro, estrella) {
    var d = document.createElement('div');
    d.className = 'stk';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.setAttribute('data-giro', giro);
    girar(d, false);
    if (app.banner) {
      var im = document.createElement('img');
      im.className = 'arte';
      im.src = app.banner;
      im.alt = app.nombre;
      d.appendChild(im);
    } else {
      var t = document.createElement('div');
      t.className = 'arte';
      t.appendChild(document.createTextNode(app.nombre));
      d.appendChild(t);
    }
    if (estrella) d.insertAdjacentHTML('beforeend', ESTRELLA);
    return d;
  }

  /** Sin foco el sticker queda en su giro propio; con foco se "despega": crece, se inclina y se corre 6 px. */
  function girar(d, enfocado) {
    var t = enfocado ? 'translate(-6px,-6px) scale(1.12) rotate(-3deg)' : 'rotate(' + d.getAttribute('data-giro') + 'deg)';
    d.style.webkitTransform = d.style.transform = t;
  }

  function armarFavs() {
    var caja = $('favs');
    caja.innerHTML = '';
    for (var i = 0; i < favs.length; i++) {
      var d = sticker(porId[favs[i]], COL_INICIO[i % 4], FILA_INICIO[Math.floor(i / 4)], GIRO_INICIO[i], false);
      d.id = 'fav-' + i;
      caja.appendChild(d);
    }
    var e = document.createElement('div');
    e.id = 'etq-inicio';
    e.className = 'etiqueta';
    e.style.display = 'none';
    caja.appendChild(e);
    if (favIndex >= favs.length) favIndex = Math.max(0, favs.length - 1);
  }

  function armarTodas() {
    var p = $('plancha');
    p.innerHTML = '';
    for (var i = 0; i < apps.length; i++) {
      var pag = Math.floor(i / POR_PAGINA), c = i % POR_PAGINA;
      var d = sticker(apps[i], COL_APPS[c % 6], pag * 720 + FILA_APPS[Math.floor(c / 6)], GIRO_APPS[c],
          favs.indexOf(apps[i].id) >= 0);
      d.id = 'app-' + i;
      p.appendChild(d);
    }
    var e = document.createElement('div');
    e.id = 'etq-todas';
    e.className = 'etiqueta';
    e.style.display = 'none';
    p.appendChild(e);
    $('t-cuenta').innerHTML = apps.length;
  }

  function etiqueta(id, d, nombre) {
    var e = $(id);
    e.innerHTML = '';
    e.appendChild(document.createTextNode(nombre));
    e.insertAdjacentHTML('beforeend', '<b>OK</b>');
    e.style.display = 'block';
    var x = parseInt(d.style.left, 10) + 26;
    e.style.left = Math.min(x, 1232 - e.offsetWidth) + 'px';
    e.style.top = (parseInt(d.style.top, 10) + 107) + 'px';
  }

  // ---------------------------------------------------------------- foco
  function elemento(id) {
    if (id === 'mate') return $('disco');
    return $(id);
  }

  function enfocar(id) {
    var viejo = elemento(foco), nuevo = elemento(id);
    if (!nuevo) return;
    if (viejo) {
      viejo.className = viejo.className.replace(/ ?(foco|apretado|moviendo)/g, '');
      if (/^(fav|app)-/.test(foco)) girar(viejo, false);
    }
    foco = id;
    nuevo.className += ' foco';
    $('etq-inicio').style.display = 'none';
    if ($('etq-todas')) $('etq-todas').style.display = 'none';
    var n = parseInt(id.split('-')[1], 10);
    if (id.indexOf('fav-') === 0) {
      favIndex = n;
      girar(nuevo, true);
      if (moviendo) nuevo.className += ' moviendo';
      etiqueta('etq-inicio', nuevo, porId[favs[n]].nombre);
    } else if (id.indexOf('app-') === 0) {
      appIndex = n;
      girar(nuevo, true);
      etiqueta('etq-todas', nuevo, apps[n].nombre);
      pagina(Math.floor(n / POR_PAGINA), true);
    } else if (id.indexOf('ent-') === 0) {
      entIndex = n;
    }
    describir();
  }

  /** Lo que hace y dice M.A.T.E. segun lo enfocado. */
  function describir() {
    if (pantalla === 'todas') return;
    if (foco.indexOf('fav-') === 0) {
      var a = porId[favs[favIndex]];
      if (moviendo) base('pila-de-cajas', '¿Dónde la pego?');
      else if (a.id === leer('ultima')) base(poseDeApp(a), '¿Seguimos con ' + a.nombre + '?');
      else base(poseDeApp(a), PREGUNTA);
    } else if (foco === 'mate') base('saludando', '¡Acá estoy! Apretá OK');
    else if (foco === 'b-entradas' || foco.indexOf('ent-') === 0) base('conectando-el-cable', '¿Qué enchufamos?');
    else if (foco === 'b-red') {
      if (navigator.onLine === false) base('ni-idea', 'No hay internet');
      else base('protegiendo-la-nube', 'Todo conectado');
    } else if (foco === 'b-ajustes') base('arreglando-un-servidor', '¿Ajustamos algo?');
    else if (foco === 'b-todas') base('con-lupa', '¿Buscamos otra?');
  }

  function poseDeApp(a) {
    return /spotify|music/i.test(a.id) ? 'bailando' : 'saludando';
  }

  // ---------------------------------------------------------------- M.A.T.E.
  function base(pose, texto) {
    poseBase = pose;
    textoBase = texto;
    if (Date.now() >= reaccionHasta) mostrar(pose, texto);
  }

  function reaccion(pose, texto, ms) {
    reaccionHasta = Date.now() + ms;
    clearTimeout(relojReaccion);
    relojReaccion = setTimeout(function () { reaccionHasta = 0; mostrar(poseBase, textoBase); }, ms);
    mostrar(pose, texto);
  }

  function mostrar(pose, texto) {
    decir(texto);
    if (pose === poseVista) return;
    var primera = !poseVista, mia = ++turnoPose, img = $('mate');
    poseVista = pose;
    // Se precarga: la imagen vieja queda en pantalla hasta que la nueva este lista.
    var pre = new Image();
    pre.onload = function () {
      if (mia !== turnoPose) return;
      if (primera) { img.src = pre.src; return; }
      img.style.opacity = 0;
      setTimeout(function () {
        if (mia !== turnoPose) return;
        img.src = pre.src;
        img.style.opacity = 1;
        img.className = '';
        void img.offsetWidth;          // reinicia la animacion del saltito
        img.className = 'salto';
      }, 90);
    };
    pre.src = 'img/mate/' + pose + EXT;
  }

  /** El texto del globo se achica hasta entrar; el globo entra escalando desde la cola. */
  function decir(texto) {
    var t = $('globo-txt');
    if (t.getAttribute('data-txt') === texto) return;
    t.setAttribute('data-txt', texto);
    t.innerHTML = '';
    var s = document.createElement('span');
    s.appendChild(document.createTextNode(texto));
    t.appendChild(s);
    var tam = 66;
    t.style.fontSize = tam + 'px';
    while (s.offsetWidth > 580 && tam > 30) {
      tam -= 2;
      t.style.fontSize = tam + 'px';
    }
    var g = $('globo');
    g.className = 'abs';
    void g.offsetWidth;
    g.className = 'abs entra';
  }

  // ---------------------------------------------------------------- reloj y descanso
  function tic() {
    var d = new Date(), m = d.getMinutes();
    var hm = d.getHours() + ':' + (m < 10 ? '0' : '') + m;
    $('reloj').innerHTML = hm;
    $('t-reloj').innerHTML = hm;
    $('fecha').innerHTML = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    var h = d.getHours();
    $('saludo').innerHTML = h >= 5 && h < 12 ? '¡Buen día!' : h < 20 && h >= 12 ? '¡Buenas tardes!' : '¡Buenas noches!';
    // La fecha va montada 6 px sobre el borde derecho del reloj.
    $('fecha').style.left = ($('reloj').offsetLeft + $('reloj').offsetWidth - 6) + 'px';
    if (navigator.onLine === false) {
      $('txt-red').innerHTML = 'Sin red';
      $('chip-red').style.background = '#FF9A4D';
    } else {
      $('txt-red').innerHTML = Tele.red() === 'cable' ? 'Cable' : Tele.red() === 'wifi' ? 'Wi-Fi' : 'Red';
      $('chip-red').style.background = '#35E0F2';
    }
  }

  /** Cuando nadie toca el control, M.A.T.E. se pone a hacer lo suyo segun la hora y la fecha. */
  function descanso() {
    var ahora = Date.now();
    if (pantalla !== 'inicio' || moviendo || ahora - ultimaTecla < 30000) return;
    if (descansando && ahora - ultimoDescanso < 45000) return;
    descansando = true;
    ultimoDescanso = ahora;
    var d = new Date(), mes = d.getMonth() + 1, dia = d.getDate(), h = d.getHours(), op = [];
    if ((mes === 12 && dia === 31) || (mes === 1 && dia === 1)) op = [['fuegos-artificiales', '¡Feliz año nuevo!'], ['brindis', '¡Salud!']];
    else if (mes === 1 && dia === 6) op = [['rey-mago', '¡Llegaron los Reyes!']];
    else if ((mes === 5 && dia === 25) || (mes === 7 && dia === 9) || (mes === 6 && dia === 20)) op = [['bandera-argentina', '¡Viva la patria!'], ['empanadas', 'Hoy tocan empanadas']];
    else if (mes === 12 && dia >= 8 && dia <= 30 && Math.random() < 0.6) op = [['papa-noel', 'Jo, jo, jo'], ['reno', '¿Me queda bien la nariz?'], ['armando-el-arbolito', 'Armando el arbolito'], ['muneco-de-nieve', '¡Felices fiestas!']];
    else if (h < 6) op = [['durmiendo', 'Zzz…'], ['siesta-con-mateperro', 'Zzz…'], ['meditando', 'Ommm…']];
    else if (h < 11) op = [['cafe', 'Primero, un cafecito'], ['tomando-mate', '¿Unos mates?']];
    else if (h < 15) op = [['empanadas', '¿Qué comemos hoy?'], ['tomando-mate', '¿Unos mates?']];
    else if (h < 19) op = [['tomando-mate', 'La hora del mate'], ['leyendo', 'Leyendo un rato']];
    else op = [['pizza', '¿Peli y pizza?'], ['videojuegos', '¿Jugamos una partida?'], ['leyendo', 'Leyendo un rato']];
    var p = op[Math.floor(Math.random() * op.length)];
    base(p[0], p[1]);
  }

  // ---------------------------------------------------------------- acciones
  function abrir(app) {
    guardar('ultima', app.id);
    if (app.url && !Tele.enTele()) {
      // Fuera del TV no se sale de la pagina: M.A.T.E. solo cuenta lo que haria.
      reaccion('bien', 'Abriendo ' + app.nombre + '…', 2500);
      return;
    }
    if (Tele.abrir(app)) {
      reaccion('volando', '¡Allá vamos!', 4000);
      return;
    }
    // Las apps nativas no se pueden abrir desde una pagina: M.A.T.E. dice que boton usar.
    if (app.boton) reaccion('explicando', 'Apretá el botón ' + app.boton + ' del control', 6000);
    else reaccion('explicando', app.nombre + ' está en el inicio de VIDAA', 6000);
  }

  function guardarFavs() {
    guardar('favoritas', favs.join(','));
  }

  /** Intercambia dos favoritas de lugar. El orden se guarda en cada paso. */
  function mover(desde, hasta) {
    var t = favs[desde];
    favs[desde] = favs[hasta];
    favs[hasta] = t;
    guardarFavs();
    foco = '';
    armarFavs();
    enfocar('fav-' + hasta);
  }

  function alternarFav(i) {
    var id = apps[i].id, en = favs.indexOf(id), d = $('app-' + i);
    if (en >= 0) {
      if (favs.length <= 1) return decirEnTodas('¡Dejá una!');
      favs.splice(en, 1);
      var est = d.querySelector('.fav');
      if (est) d.removeChild(est);
      decirEnTodas('¡La saqué!');
    } else {
      if (favs.length >= FAV_MAX) return decirEnTodas('¡Está lleno!');
      favs.push(id);
      d.insertAdjacentHTML('beforeend', ESTRELLA);
      decirEnTodas('¡Pegada!');
    }
    guardarFavs();
    armarFavs();
  }

  function decirEnTodas(texto) {
    $('t-globo').innerHTML = texto;
    clearTimeout(relojGlobo);
    relojGlobo = setTimeout(function () { $('t-globo').innerHTML = PREGUNTA_APPS; }, 3500);
  }

  // ---------------------------------------------------------------- todas tus apps
  function pagina(p, animar) {
    var paginas = Math.max(1, Math.ceil(apps.length / POR_PAGINA)), pl = $('plancha');
    $('t-leyenda-txt').innerHTML = paginas > 1 ? 'en tu inicio &nbsp;·&nbsp; página ' + (p + 1) + ' de ' + paginas : 'en tu inicio';
    var t = 'translateY(' + (-p * 720) + 'px)';
    if (pl.getAttribute('data-p') === String(p)) return;
    pl.setAttribute('data-p', p);
    if (animar) {
      // Mientras desliza, las franjas tapan los stickers que pasan por la cabecera y el pie.
      $('franja-arriba').style.display = $('franja-abajo').style.display = 'block';
      setTimeout(function () { $('franja-arriba').style.display = $('franja-abajo').style.display = 'none'; }, 260);
    }
    pl.style.webkitTransform = pl.style.transform = t;
  }

  function abrirTodas() {
    if (abriendo || !apps.length) return;
    abriendo = true;
    armarTodas();
    $('t-globo').innerHTML = PREGUNTA_APPS;
    $('t-mate').src = 'img/mate/con-lupa' + EXT;
    // El disco lila de M.A.T.E. crece hasta tapar la pantalla; recien ahi aparece la plancha.
    var iris = $('iris');
    iris.style.display = 'block';
    void iris.offsetWidth;
    iris.style.webkitTransform = iris.style.transform = 'scale(6.2)';
    setTimeout(function () {
      abriendo = false;
      pantalla = 'todas';
      $('todas').style.display = 'block';
      $('inicio').className = 'abs papel-crema quieto';
      iris.style.display = 'none';
      iris.style.webkitTransform = iris.style.transform = 'scale(1)';
      $('plancha').removeAttribute('data-p');
      pagina(0, false);
      enfocar('app-0');
    }, 290);
  }

  function cerrarTodas() {
    pantalla = 'inicio';
    $('todas').style.display = 'none';
    $('inicio').className = 'abs papel-crema';
    enfocar('b-todas');
  }

  // ---------------------------------------------------------------- entradas
  function abrirEntradas() {
    var p = $('entradas'), lista = MATE_CONFIG.entradas;
    p.innerHTML = '';
    for (var i = 0; i < lista.length; i++) {
      var f = document.createElement('div');
      f.className = 'fila';
      f.id = 'ent-' + i;
      f.appendChild(document.createTextNode(lista[i].nombre));
      p.appendChild(f);
    }
    if (!lista.length) return reaccion('ni-idea', 'No veo las entradas', 3000);
    p.style.display = 'block';
    pantalla = 'entradas';
    enfocar('ent-0');
  }

  function cerrarEntradas() {
    $('entradas').style.display = 'none';
    pantalla = 'inicio';
    enfocar('b-entradas');
  }

  // ---------------------------------------------------------------- control remoto
  var IZQ = 37, ARR = 38, DER = 39, ABA = 40;

  function flecha(k) {
    var i, n, col;
    if (pantalla === 'entradas') {
      n = MATE_CONFIG.entradas.length;
      if (k === ARR) { if (entIndex === 0) cerrarEntradas(); else enfocar('ent-' + (entIndex - 1)); }
      else if (k === ABA && entIndex < n - 1) enfocar('ent-' + (entIndex + 1));
      return;
    }
    if (pantalla === 'todas') return flechaTodas(k);
    var tops = ['b-entradas', 'b-red', 'b-ajustes'], t = tops.indexOf(foco);
    if (foco.indexOf('fav-') === 0) {
      i = favIndex; n = favs.length; col = i % 4;
      if (moviendo) {
        if (k === IZQ && i > 0) mover(i, i - 1);
        else if (k === DER && i < n - 1) mover(i, i + 1);
        else if (k === ARR && i >= 4) mover(i, i - 4);
        else if (k === ABA && i + 4 < n) mover(i, i + 4);
        return;
      }
      if (k === IZQ) enfocar(col > 0 ? 'fav-' + (i - 1) : 'mate');
      else if (k === DER) { if (col < 3 && i + 1 < n) enfocar('fav-' + (i + 1)); }
      else if (k === ARR) enfocar(i >= 4 ? 'fav-' + (i - 4) : tops[col <= 1 ? 0 : col - 1]);
      else if (i + 4 < n) enfocar('fav-' + (i + 4));
      else if (i < 4 && n > 4) enfocar('fav-' + (n - 1));   // fila de abajo incompleta
      else enfocar('b-todas');
    } else if (t >= 0) {
      if (k === IZQ && t > 0) enfocar(tops[t - 1]);
      else if (k === DER && t < 2) enfocar(tops[t + 1]);
      else if (k === ABA) enfocar(favs.length ? 'fav-' + Math.min(favIndex % 4, favs.length - 1) : 'b-todas');
    } else if (foco === 'b-todas') {
      if (k === ARR && favs.length) enfocar('fav-' + (favs.length > 4 ? 4 : 0));
      else if (k === IZQ) enfocar('mate');
    } else if (foco === 'mate') {
      if (k === DER) enfocar(favs.length ? 'fav-' + favIndex : 'b-todas');
      else if (k === ARR) enfocar('b-entradas');
      else if (k === ABA) enfocar('b-todas');
    }
  }

  function flechaTodas(k) {
    var i = appIndex, n = apps.length, pag = Math.floor(i / POR_PAGINA), c = i % POR_PAGINA;
    var col = c % 6, fila = Math.floor(c / 6), primero = pag * POR_PAGINA, a = -1;
    if (k === IZQ) { if (col > 0) a = i - 1; }
    else if (k === DER) { if (col < 5 && c + 1 < POR_PAGINA && i + 1 < n) a = i + 1; }
    else if (k === ARR) {
      if (fila > 0) a = i - 6;
      else if (pag > 0) a = primero - POR_PAGINA + Math.min(12 + col, POR_PAGINA - 1);
    } else if (fila < 2) {
      // El casillero 18 es de M.A.T.E.: desde arriba de el se baja al ultimo sticker de la fila.
      a = primero + Math.min(c + 6, POR_PAGINA - 1);
      if (a >= n) a = Math.floor((n - 1 - primero) / 6) > fila ? n - 1 : -1;
    } else if (primero + POR_PAGINA < n) {
      a = Math.min(primero + POR_PAGINA + col, n - 1);
    }
    if (a >= 0 && a !== i) enfocar('app-' + a);
  }

  function okCorto() {
    if (pantalla === 'entradas') {
      var e = MATE_CONFIG.entradas[entIndex];
      cerrarEntradas();
      if (!Tele.entrada(e)) reaccion('conectando-el-cable', 'Cambiando a ' + e.nombre + '…', 2500);
    } else if (pantalla === 'todas') abrir(apps[appIndex]);
    else if (foco.indexOf('fav-') === 0) {
      if (moviendo) { moviendo = false; enfocar(foco); } else abrir(porId[favs[favIndex]]);
    } else if (foco === 'mate') {
      var r = REACCIONES[Math.floor(Math.random() * REACCIONES.length)];
      reaccion(r[0], r[1], 4500);
    } else if (foco === 'b-entradas') {
      // Cambiar de entrada no esta al alcance de una pagina en VIDAA: se usa el boton del control.
      if (!Tele.entrada({})) reaccion('conectando-el-cable', 'Apretá el botón de entradas del control', 6000);
    } else if (foco === 'b-todas') abrirTodas();
    else if (foco === 'b-ajustes' || foco === 'b-red') {
      if (!Tele.ajustes()) reaccion('arreglando-un-servidor', 'Apretá el botón de ajustes del control', 6000);
    }
  }

  function okMantenido() {
    if (pantalla === 'todas') alternarFav(appIndex);
    else if (pantalla === 'inicio' && foco.indexOf('fav-') === 0 && !moviendo) {
      moviendo = true;
      enfocar(foco);
    }
  }

  function atras() {
    if (moviendo) { moviendo = false; enfocar(foco); }
    else if (pantalla === 'entradas') cerrarEntradas();
    else if (pantalla === 'todas') cerrarTodas();
  }

  function esOk(k) { return k === 13 || k === 32; }
  function esAtras(k) { return k === 8 || k === 27 || k === 461 || k === 10009; }

  function teclaAbajo(ev) {
    var k = ev.keyCode;
    ultimaTecla = Date.now();
    if (descansando) { descansando = false; describir(); }
    if (k >= 37 && k <= 40) { flecha(k); ev.preventDefault(); return; }
    if (esOk(k)) {
      ev.preventDefault();
      if (okAbajo) return;                       // repeticion de tecla mientras se mantiene
      okAbajo = true;
      okLargo = false;
      var el = elemento(foco);
      if (el && !/^(ent-|mate)/.test(foco)) el.className += ' apretado';
      relojOk = setTimeout(function () { okLargo = true; soltar(); okMantenido(); }, 600);
      return;
    }
    if (esAtras(k)) { atras(); ev.preventDefault(); }
  }

  function soltar() {
    var el = elemento(foco);
    if (el) el.className = el.className.replace(/ ?apretado/g, '');
  }

  function teclaArriba(ev) {
    if (!esOk(ev.keyCode) || !okAbajo) return;
    ev.preventDefault();
    okAbajo = false;
    clearTimeout(relojOk);
    soltar();
    if (!okLargo) okCorto();
  }

  // ---------------------------------------------------------------- en marcha
  function empezar() {
    cargarApps();
    armarFavs();
    $('etq-inicio').style.display = 'none';
    tic();
    mostrar('saludando', PREGUNTA);
    enfocar(favs.length ? 'fav-0' : 'b-todas');
    ultimaTecla = Date.now();
    // La fecha se acomoda contra el ancho del reloj, que cambia cuando termina de cargar la fuente.
    setTimeout(tic, 400);
    setTimeout(tic, 2000);
    setInterval(tic, 15000);
    setInterval(descanso, 15000);
    document.addEventListener('keydown', teclaAbajo, false);
    document.addEventListener('keyup', teclaArriba, false);
    if (!Tele.enTele()) {
      $('aviso').style.display = 'block';
      $('aviso').innerHTML = 'Vista de prueba fuera del TV: las apps no se abren de verdad.';
    }
  }

  escalar();
  window.addEventListener('resize', escalar, false);
  detectarWebp(empezar);
})();
