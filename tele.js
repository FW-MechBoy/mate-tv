/* Puente entre la pagina y el televisor. mate.js solo llama a Tele.abrir(), Tele.entrada() y Tele.ajustes().

   Lo que una pagina instalada como app en VIDAA puede hacer (estudio del 17-nov-2026, sin probar aun en el 55A5GS):
   - Abrir las apps web del TV (casi todas: HBO Max, Disney+, Spotify...): alcanza con ir a su direccion.
   - NO puede abrir las apps nativas (Netflix, YouTube, Prime Video), cambiar de entrada HDMI ni abrir los ajustes:
     VIDAA no le da esas funciones a paginas de terceros. Para eso M.A.T.E. avisa que boton del control apretar.
   Cada funcion devuelve false cuando no pudo hacer lo pedido. */
var Tele = (function () {
  'use strict';

  return {
    /** true cuando la pagina corre dentro del navegador de un TV VIDAA. */
    enTele: function () {
      return /VIDAA|Hisense/i.test(navigator.userAgent) || typeof window.Hisense_GetDeviceID === 'function';
    },

    /** Las apps que el TV dice tener, o null para usar las de config.js. */
    apps: function () {
      return null;
    },

    /** Abre una app web yendo a su direccion. Las nativas no se pueden abrir desde aca: devuelve false. */
    abrir: function (app) {
      if (app.url) {
        window.location.href = app.url;
        return true;
      }
      return false;
    },

    /** Cambiar de entrada no esta al alcance de la pagina. */
    entrada: function () {
      return false;
    },

    /** Abrir los ajustes no esta al alcance de la pagina. */
    ajustes: function () {
      return false;
    },

    /** "sin" si el navegador dice que no hay red, o "" si no se sabe. */
    red: function () {
      return navigator.onLine === false ? 'sin' : '';
    }
  };
})();
