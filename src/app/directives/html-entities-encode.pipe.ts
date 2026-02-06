import { Pipe, PipeTransform } from '@angular/core';
import { htmlEntities } from 'src/chat21-core/utils/utils';

@Pipe({
  name: 'htmlEntiesEncode'
})

export class HtmlEntitiesEncodePipe implements PipeTransform {

  transform(text: any, args?: any): any { 
    if (text === null || text === undefined) {
      return text;
    }

    // Normalize line breaks BEFORE encoding HTML:
    // - real CRLF/CR/LF to LF
    // - escaped sequences (\n, \r, \r\n) to LF
    // - HTML <br> tags (if present) to LF
    let normalized = String(text)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\n')
      .replace(/<br\s*\/?>/gi, '\n');

    normalized = htmlEntities(normalized);
    normalized = normalized.trim();
    return normalized;
  }

}
