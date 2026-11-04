/**
 * Hand-made covers of the original services, shown while a service has no
 * cover uploaded from /admin. Keyed by service slug. Static markup only
 * (spans, line breaks, emphasis): it passes Angular sanitization untouched.
 */
export const LEGACY_ART: Readonly<Record<string, string>> = {
  diseno:
    '<span aria-hidden="true" class="artwork flyer-art"><span class="flyer-paper back-paper"></span><span class="flyer-paper front-paper"><small>JERATH / ESTUDIO CREATIVO</small><strong>MAKE<br/>SOME<br/><i>NOISE.</i></strong><span class="flyer-star">✳</span><span class="flyer-bottom">DISEÑO QUE SE HACE NOTAR ↗</span></span></span>',
  identidad:
    '<span aria-hidden="true" class="artwork identity-art"><span class="brand-board"><span class="brand-monogram">jm<span>✳</span></span><small>IDEAS CON CARÁCTER.</small><span class="palette"><i></i><i></i><i></i><i></i></span></span><span class="brand-card"><b>Jerath<br/>Moreira.</b><small>DISEÑO &amp;<br/>DIRECCIÓN CREATIVA</small><span>↗</span></span></span>',
  social:
    '<span aria-hidden="true" class="artwork social-art"><span class="social-square social-a"><small>01 / CONECTA</small><strong>Ideas<br/>que se<br/><i>quedan.</i></strong><span>↗</span></span><span class="social-square social-b"><span class="orbit"></span><small>DALE OTRA<br/>VUELTA A TU<br/>CONTENIDO.</small></span><span class="social-square social-c"><small>03 / COMPARTE</small><strong>Tu<br/>marca.<br/>Tu voz.</strong><span>✳</span></span></span>',
  video:
    '<span aria-hidden="true" class="artwork video-art"><span class="video-screen"><small>JM / MOTION STUDY</small><strong>MAKE<br/>IT <i>MOVE.</i></strong><span class="video-time">00:00:24:08</span><span class="video-cross">+</span></span><span class="timeline"><i></i><i></i><i></i><i></i><b></b></span></span>',
};

export const GENERIC_COVER_ART =
  '<span class="artwork portfolio-generic-cover"><strong>JM ✳</strong></span>';
