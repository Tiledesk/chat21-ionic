import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';


@Pipe({
  name: 'marked'
})

export class MarkedPipe implements PipeTransform {
  transform(value: any): any {
    const renderer = new marked.Renderer();
    renderer.link = function (href, title, text) {
      // Normalizza l'href per evitare falsi negativi
      const normalized = (href || '').trim().toLowerCase();
      // Pattern pericolosi da cercare nell'intero URL (non solo all'inizio)
      const dangerousPatterns = [
        /javascript:/i,           // javascript: protocol
        /data:/i,                // data: protocol  
        /vbscript:/i,            // vbscript: protocol
        /on\w+\s*=/i,           // event handlers (onclick, onload, etc.)
        /alert\s*\(/i,          // alert() function
        /eval\s*\(/i,           // eval() function
        /document\./i,          // document object access
        /window\./i,            // window object access
        /\.appendChild\s*\(/i,  // DOM manipulation
        /\.createElement\s*\(/i, // DOM creation
        /<script/i,             // script tags
        /<\/script>/i,          // closing script tags
        /function\s*\(/i,       // function definitions
        /\(function/i,          // IIFE patterns
        /setTimeout\s*\(/i,     // setTimeout
        /setInterval\s*\(/i,    // setInterval
        /location\./i,          // location object manipulation
        /history\./i,           // history object manipulation
        /localStorage\./i,      // localStorage access
        /sessionStorage\./i,    // sessionStorage access
        /cookie/i,              // cookie manipulation
        /fetch\s*\(/i,          // fetch API
        /XMLHttpRequest/i,      // XHR
        /FormData/i,            // FormData
        /Blob\s*\(/i,           // Blob constructor
        /FileReader/i,          // FileReader
        /crypto\./i,            // crypto object
        /btoa\s*\(/i,           // base64 encoding
        /atob\s*\(/i,           // base64 decoding
        /decodeURI/i,           // URI decoding
        /encodeURI/i,           // URI encoding
        /String\.fromCharCode/i, // character code conversion
        /unescape\s*\(/i,       // unescape function
        /escape\s*\(/i          // escape function
      ];

      // Controlla se l'URL contiene pattern pericolosi
      const isDangerous = dangerousPatterns.some(p => p.test(normalized));
      if (isDangerous) {
        // Se l’URL è pericoloso, restituisci solo il testo
        return text || href || '';
      }

      // tokens = this.cleanInput(href);

      if (!href) return text;

      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };
    
    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true
    });

    if (value && value.length > 0) {
      try {
        return marked.parse(value);
      } catch (err) {
        console.error('Errore nel parsing markdown:', err);
        return value;
      }
    }
    return value;
  }



}
