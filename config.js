/* Las apps del TV Hisense (VIDAA), tal como las informo el propio TV el 17-nov-2026 (sidee.py list).
   Cada app:
     id      appId que usa VIDAA
     nombre  lo que se muestra
     banner  imagen 25:14 en img/apps, o "" para mostrar el nombre
     url     direccion de la app web (la mayoria de las apps de VIDAA son paginas web)
     nativo  nombre interno de las apps que no son web. Una pagina no las puede abrir en VIDAA:
     boton   el boton del control que las abre; M.A.T.E. le dice a la familia que lo apriete
   Se dejaron afuera las partes del sistema (V Home, VIDAA Art, E-Manual), las apps internas sin boton en el control
   (VIDAA Kids, la tienda, el navegador, Vod On Demand). Direcciones actualizadas el 18-nov-2026. */
var MATE_CONFIG = {
  apps: [
    { id: "1", nombre: "Netflix", banner: "img/apps/netflix.png", nativo: "netflix", boton: "Netflix" },
    { id: "3", nombre: "YouTube", banner: "img/apps/youtube.png", nativo: "youtube", boton: "YouTube" },
    { id: "2", nombre: "Prime Video", banner: "img/apps/prime-video.png", nativo: "amazon", boton: "Prime Video" },
    { id: "2378", nombre: "HBO Max", banner: "img/apps/hbo-max.png", url: "https://vidaa.play.max.com/" },
    { id: "295", nombre: "Disney+", banner: "img/apps/disney-plus.png", url: "https://cd-dmgz.bamgrid.com/bbd/hisense_tv/index.html" },
    { id: "2256", nombre: "Spotify", banner: "img/apps/spotify.png", url: "https://api-partner.spotify.com/tvapp?platform=vidaa" },
    { id: "334", nombre: "Paramount+", banner: "img/apps/paramount-plus.png", url: "https://www.intl.paramountplus.com/smart-console-apps/vidaa/" },
    { id: "2655", nombre: "Mercado Play", banner: "img/apps/mercado-play.png", url: "https://play.meli.com/tv" },
    { id: "240", nombre: "Flow", banner: "img/apps/flow.png", url: "http://newsan.tv/models/77aa10528def0be666f8d1cc29136312/apps/aaa5d81518c29bd0be44fb68a76d76be/open" },
    { id: "2372", nombre: "Crunchyroll", banner: "img/apps/crunchyroll.png", url: "https://www.crunchyroll.com/tetsuo/hisense-vidaa/" },
    { id: "351", nombre: "Apple TV", banner: "img/apps/apple-tv.png", url: "https://atve.tv.apple.com/94819831-5404-4438-810e-afb648d6a826/tvw_1dc2aab0a313427dbc11818be8a18bd9/" },
    { id: "42", nombre: "Plex", banner: "", url: "https://app.plex.tv/tv-vidaa" },
    { id: "230", nombre: "MUBI", banner: "", url: "https://tv-production.mubi.com/vidaa/4.0.0/" },
    { id: "1617", nombre: "FreeTV", banner: "", url: "https://html5.freetv.com/" },
    { id: "244", nombre: "UEFA.tv", banner: "", url: "https://dice-tv.imggaming.com/vidaa/dce.uefatv/index.html#/" },
    { id: "355", nombre: "UFC", banner: "", url: "https://tv.onvesper.com/vidaa/dce.ufc/index.html" },
    { id: "304", nombre: "iWant", banner: "", url: "https://livingroom.iwanttfc.com/vidaa/index.html" },
    { id: "36", nombre: "ToonGoggles", banner: "", url: "https://html5.toongoggles.com/" }
  ],
  /* Favoritas iniciales, en orden (hasta 8). Despues cada uno las acomoda con el control. */
  favoritas: ["1", "3", "2", "2378", "295", "2256", "334", "2655"],
  entradas: [
    { id: "hdmi1", nombre: "HDMI 1" },
    { id: "hdmi2", nombre: "HDMI 2" },
    { id: "hdmi3", nombre: "HDMI 3" },
    { id: "tv", nombre: "TV en vivo" }
  ]
};
