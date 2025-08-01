
import * as moment from 'moment/moment';
// import * as moment from 'moment-timezone';
import 'moment/locale/it.js';
import { CHANNEL_TYPE } from './constants';

import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ModalController } from '@ionic/angular';
import { ConversationModel } from '../models/conversation';

import { avatarPlaceholder, getColorBck } from './utils-user';

/**
 * Shortest description  for phone and tablet
 * Nota: eseguendo un test su desktop in realtà lo switch avviene a 921px 767px
 */
export function windowsMatchMedia() {
  
  const mq = window.matchMedia('(max-width: 767px)');
  if (mq.matches) {
    // console.log('window width is less than 767px ');
    return false;
  } else {
    // console.log('window width is at least 767px');
    return true;
  }
}

/**
 * chiamata da ChatConversationsHandler
 * restituisce url '/conversations'
 * @param tenant
 */
export function conversationsPathForUserId(tenant, userId) {
  const urlNodeConversations = '/apps/' + tenant + '/users/' + userId + '/conversations';
  return urlNodeConversations;
}

/**
 * chiamata da ArchivedConversationsHandler
 * restituisce url '/archived_conversations'
 * @param tenant
 */
export function archivedConversationsPathForUserId(tenant, userId) {
  const urlNodeConversations = '/apps/' + tenant + '/users/' + userId + '/archived_conversations';
  return urlNodeConversations;
}

/**
 * chiamata da GroupHandler
 * restituisce url '/group'
 * @param tenant
 */
export function groupsPathForUserId(tenant, userId) {
  const urlNodeConversations = '/apps/' + tenant + '/users/' + userId + '/groups';
  return urlNodeConversations;
}

/**
 * chiamata da ChatConversationHandler
 * restituisce url '/messages'
 */
export function conversationMessagesRef(tenant, userId) {
  const urlNode = '/apps/' + tenant + '/users/' + userId + '/messages/';
  return urlNode;
}

/**
 * chiamata da ChatContactsSynchronizer
 * restituisce url '/contacts'
 */
export function contactsRef(tenant) {
  const urlNodeContacts = '/apps/' + tenant + '/contacts/';
  return urlNodeContacts;
}


/**
 * chiamata da ChatConversationsHandler
 * restituisce url '/conversations'
 * @param tenant 
 */
export function nodeTypingsPath(tenant, conversationWith) {
  const urlNodeConversations = '/apps/' + tenant + '/typings/' + conversationWith;
  return urlNodeConversations;
}

/**
 * restituiso indice item nell'array con uid == key 
 * @param items 
 * @param key 
 */
export function searchIndexInArrayForUid(items, key) {
  return items.findIndex(i => i.uid === key);
}
/**
 * trasforma url contenuti nel testo passato in tag <a>
 */
export function urlify(text?, name?) {
  if (!text) return name;
  //https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
  var regex = /(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,63}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?/;
  return text.replace(regex, function (url) {
    if (url.match(/^[/]/)) { return; }
    var label = url;
    if (name) {
      label = name;
    }
    if (url.indexOf('@') !== -1) {
      return '<a href=\"mailto:' + url + '\">' + label + '</a>';
    } else if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'http://' + url;
    }
    let link = '<a href=\"' + url + '\" target=\"_blank\">' + label + '</a>';
    return link
  })
}

/**
 * rimuove il tag html dal testo
 * ATTUALMENTE NON USATA
 */
export function removeHtmlTags(text) {
  return text.replace(/(<([^>]+)>)/ig, "");
}

/**
 * calcolo il tempo trascorso tra due date 
 * e lo formatto come segue:
 * gg/mm/aaaa; 
 * oggi; 
 * ieri; 
 * giorno della settimana (lunedì, martedì, ecc)
 */
// export function setHeaderDate_old(translate, timestamp, lastDate?): string {
//   var date = new Date(timestamp);
//   let now: Date = new Date();
//   var LABEL_TODAY;// = translate.get('LABEL_TODAY')['value'];
//   var LABEL_TOMORROW;// = translate.get('LABEL_TOMORROW')['value'];
//   translate.get('LABEL_TODAY').subscribe((res: string) => {
//     LABEL_TODAY = res;
//   });
//   translate.get('LABEL_TOMORROW').subscribe((res: string) => {
//     LABEL_TOMORROW = res;
//   });
//   var labelDays: string = LABEL_TODAY;
//   var _MS_PER_DAY = 1000 * 60 * 60 * 24;
//   // Esclude l'ora ed il fuso orario
//   var utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
//   var utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
//   const days = Math.floor((utc2 - utc1) / _MS_PER_DAY);
//   // console.log('setHeaderDate days: ********************',days);
//   if (days > 6) {
//     labelDays = date.toLocaleDateString();//date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
//   }
//   else if (days == 0) {
//     labelDays = LABEL_TODAY;
//   } else if (days == 1) {
//     labelDays = LABEL_TOMORROW;
//   } else {
//     labelDays = convertDayToString(translate, date.getDay());
//   }
//   // console.log('setHeaderDate labelDays: ********************',labelDays);
//   // se le date sono diverse o la data di riferimento non è impostata
//   // ritorna la data calcolata
//   // altrimenti torna null 
//   if (lastDate != labelDays || lastDate == null || lastDate == '') {
//     return labelDays;
//   } else {
//     return null;
//   }
// }

/**
 * @deprecated
 */
// export function setHeaderDate(translate, timestamp): string {
//   // const LABEL_TODAY = translate.get('LABEL_TODAY');
//   // const LABEL_TOMORROW = translate.get('LABEL_TOMORROW');

//   const date = new Date(timestamp);
//   const now: Date = new Date();
//   let labelDays = '';
//   if (now.getFullYear() !== date.getFullYear()) {
//     // quest'anno: data esatta
//     const month = date.getMonth() + 1;
//     labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
//   } else if (now.getMonth() !== date.getMonth()) {
//     // questo mese: data esatta
//     const month = date.getMonth() + 1;
//     labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
//   } else if (now.getDay() === date.getDay()) {
//     // oggi: oggi
//     labelDays = moment().calendar(timestamp).split(' ')[0].toLocaleLowerCase();
//     // labelDays = LABEL_TODAY;
//   } else if (now.getDay() - date.getDay() === 1) {
//     // ieri: ieri
//     labelDays = moment().calendar(timestamp).split(' ')[0].toLocaleLowerCase();
//     // labelDays = LABEL_TOMORROW;
//   } else {
//     // questa settimana: giorno
//     labelDays = convertDayToString(translate, date.getDay());
//   }
//   // se le date sono diverse o la data di riferimento non è impostata
//   // ritorna la data calcolata
//   // altrimenti torna null
//   return labelDays;
// }



/**
 * calcolo il tempo trascorso tra la data passata e adesso
 * utilizzata per calcolare data ultimo accesso utente
 * @param timestamp 
 */
// export function setLastDate(translate, timestamp): string {

//   const LABEL_TODAY = translate.get('LABEL_TODAY');
//   const LABEL_TOMORROW = translate.get('LABEL_TOMORROW');
//   const LABEL_TO = translate.get('LABEL_TO');
//   const LABEL_LAST_ACCESS = translate.get('LABEL_LAST_ACCESS');

//   var date = new Date(timestamp);
//   let now: Date = new Date();
//   var labelDays = '';
//   if (now.getFullYear() !== date.getFullYear()) {
//     const month = date.getMonth() + 1;
//     labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
//   } else if (now.getMonth() !== date.getMonth()) {
//     const month = date.getMonth() + 1;
//     labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
//   } else if (now.getDay() === date.getDay()) {
//     labelDays = LABEL_TODAY;
//   } else if (now.getDay() - date.getDay() === 1) {
//     labelDays = LABEL_TOMORROW;
//   } else {
//     labelDays = convertDayToString(translate, date.getDay());
//   }
//   // aggiungo orario
//   const orario = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
//   return LABEL_LAST_ACCESS + ' ' + labelDays + ' ' + LABEL_TO + ' ' + orario;
// }

/**
 *
 * @param Map
 * @param timestamp
 */
export function setLastDateWithLabels(translationMap: Map<string, string>, timestamp: string): string {
  const date = new Date(timestamp);
  const now: Date = new Date();
  let labelDays = '';
  if (now.getFullYear() !== date.getFullYear()) {
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getMonth() !== date.getMonth()) {
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getDay() === date.getDay()) {
    labelDays = translationMap.get('LABEL_TODAY');
  } else if (now.getDay() - date.getDay() === 1) {
    labelDays = translationMap.get('LABEL_TOMORROW');
  } else {
    const days = translationMap.get('ARRAY_DAYS');
    labelDays = days[date.getDay()];
  }
  const orario = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  return translationMap.get('LABEL_LAST_ACCESS') + ' ' + labelDays + ' ' + translationMap.get('LABEL_TO') + ' ' + orario;
}

/**
 * 
 * @param translate 
 * @param day 
 */
export function convertDayToString(translate, day) {
  const ARRAY_DAYS = translate.get('ARRAY_DAYS');
  return ARRAY_DAYS[day];
}

export function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    this.g.wdLog(['> Error :' + e]);
    return false;
  }
}

export function supports_html5_session() {
  try {
    return 'sessionStorage' in window && window['sessionStorage'] !== null;
  } catch (e) {
    
    return false;
  }
}

// function for dynamic sorting
export function compareValues(key, order = 'asc') {
  return function (a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }
    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}

/** */
export function getNowTimestamp() {
  //console.log("timestamp:", moment().valueOf());
  return moment().valueOf();
}

export function getFormatData(timestamp): string {
  var dateString = moment.unix(timestamp / 1000).format('L');
  // const date = new Date(timestamp);
  // const labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
  return dateString;
}

export function getTimeLastMessage(timestamp: string) {
  const timestampNumber = parseInt(timestamp, null) / 1000;
  const time = getFromNow(timestampNumber);
  return time;
}

export function getFromNow(timestamp): string {
  // var fullDate = new Date(this.news.date.$date)
  // console.log('FULL DATE: ', fullDate);
  // var month = '' + (fullDate.getMonth() + 1)
  // var day = '' + fullDate.getDate()
  // var year = fullDate.getFullYear()
  // var hour = '' + fullDate.getHours()
  // var min = fullDate.getMinutes()
  // var sec = fullDate.getSeconds()
  // if (month.length < 2) month = '0' + month;
  // if (day.length < 2) day = '0' + day;
  // if (hour.length < 2) hour = '0' + hour;
  // console.log('Giorno ', day)
  // console.log('Mese ', month)
  // console.log('Anno ', year)
  // console.log('Ora ', hour)
  // console.log('Min ', min)
  // console.log('Sec', sec)

  // this.dateFromNow = moment(year + month + day, "YYYYMMDD").fromNow()
  // let date_as_string = moment(year + month + day, "YYYYMMDD").fromNow()

  // let date_as_string = moment(year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec).fromNow()
  // let date_as_string = moment("2017-07-03 08:33:37").fromNow()
  //var day = new Date(2017, 8, 16);
  //let date_as_string = moment(day);

  // var dateString = moment.unix(timestamp).format("MM/DD/YYYY");
  // console.log(moment(dateString).fromNow(), dateString);
  // var date = "Thu Aug 19 2017 19:58:03 GMT+0000 (GMT)";
  // console.log(moment(date).fromNow()); // 1 hour ago
  // console.log(moment.unix(1483228800).fromNow());
  // console.log(moment.unix(1501545600).fromNow());
  //console.log("timestamp: ",timestamp, " - 1483228800 - ", moment.unix(1483228800).fromNow());
  // console.log();

  //console.log("window.navigator.language: ", window.navigator.language);

  moment.locale(window.navigator.language);
  let date_as_string = moment.unix(timestamp).fromNow();
  return date_as_string;
}

export function getDateDifference(startTimestampDate, endTimestampDate){
  // var startTime = moment.unix(startTimestampDate);
  // var endTime = moment.unix(endTimestampDate);

  const startTime = moment(startTimestampDate);
  const endTime = moment(endTimestampDate);
  const duration = moment.duration(endTime.diff(startTime));
  const days = duration.asDays()
  const hours = duration.asHours();
  const minutes = duration.asMinutes();

  return {days, hours, minutes}
}

/**
 *
 * @param string
 */
export function stringToBoolean(string: any): any {
  let val = string;
  if (typeof string !== 'string') {
    val = JSON.stringify(string);
    return val;
  }
  if (!string) {
    return;
  }
  switch (val.toLowerCase().trim()) {
      case 'true': case 'yes': case '1': return true;
      case 'false': case 'no': case '0': case null: return false;
      default: return val;
  }
}

export function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  // .replace(/\n/g, '<br>')
}

export function htmlEntitiesDecode(str) {
  return String(str)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  // .replace(/\n/g, '<br>')
}

export function replaceEndOfLine(text) {
  // const newText =   text.replace(/\n/g, '<br>')
  const newText = text.replace(/[\n\r]/g, '<br>');
  // const newText = text.replace(/<br\s*[\/]?>/gi, '\n')
  return newText;
}



export function isObjectEmpty(objectName){
  return Object.keys(objectName).length === 0
}

export function isExistInArray(members, currentUid) {
  return members.includes(currentUid);
}

export function isInArray(key: string, array: Array<string>) {
  if (array && array !== undefined && array.indexOf(key) > -1) {
    return true;
  }
  return false;
}

export function createLoading(loadinController, message) {
  let loading = loadinController.create({
    spinner: 'circles',
    content: message,
  });
  // this.loading.present();
  return loading;
}


export function convertMessageAndUrlify(messageText) {
  //messageText = convert(messageText);
  messageText = urlify(messageText);
  return messageText;
}

export function convertMessage(messageText) {
  messageText = convert(messageText);
  return messageText;
}

function convert(str) {
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#039;');
  return str;
}





/**
 * 
 * @param conversationWith
 * @param conversationWithFullname
 * @param conversationChannelType
 * @param width
 * @param height
 */
export function setConversationAvatar(
  conversationWith: string,
  conversationWithFullname: string,
  conversationChannelType: string,
  conversationWithEmail?: string,
  projectId?: string,
  project_name?: string,
  request_channel?: string,
  width?: string,
  height?: string,
): any {
  const conversationWidth = (width) ? width : '40px';
  const conversationHeight = (height) ? height : '40px';
  const conversationChannel = (request_channel) ? request_channel : 'chat21';

  const conversationAvatar = {
    uid: conversationWith,
    conversation_with: conversationWith,
    conversation_with_fullname: conversationWithFullname,
    conversationWithEmail: conversationWithEmail,
    channelType: conversationChannelType,
    avatar: avatarPlaceholder(conversationWithFullname),
    color: getColorBck(conversationWithFullname),
    projectId: projectId,
    project_name: project_name,
    request_channel: conversationChannel,
    width: conversationWidth,
    height: conversationHeight
  };
  return conversationAvatar;
}

/** */
export function setChannelType(conversationWith: string): string {
  let channelType = CHANNEL_TYPE.DIRECT;
  if (conversationWith.includes(CHANNEL_TYPE.GROUP + '-')) {
    channelType = CHANNEL_TYPE.GROUP;
  }
  return channelType;
}


/** */
export function bypassSecurityTrustResourceUrl(url: string) {
  return this.Dom.bypassSecurityTrustResourceUrl(url);
}

// getImageUrlThumb(uid: string){
//     try {
//         let imageurl = this.appConfig.getConfig().FIREBASESTORAGE_BASE_URL_IMAGE + environment['firebaseConfig'].storageBucket + '/o/profiles%2F' + uid + '%2Fthumb_photo.jpg?alt=media';
//         return imageurl;
//     }
//     
// }
// export function urlExists(url) {
//   console.log("imageExists::::::"+url);
//   url = "https://firebasestorage.googleapis.com/v0/b/chat-v2-dev.appspot.com/o/profiles%2F5ad5bd40c975820014ba9009%2Fthumb_photo.jpg?alt=media";
//   return false;
// }


export function jsonToArray(json) {
  var array = [];
  Object.keys(json).forEach(e => {
    //var item = {key: "+e+", val: "+json[e]+"};
    var item = json[e];
    array.push(item);
    //console.log('key='+key +'item='+item+array);
    //console.log(`key=${e} value=${this.member.decoded[e]}`)
  });
  return array;
}


export function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export function searchEmailOrUrlInString(item) {
  item = item.toString();
  if (validateEmail(item)) {
    return "<a href='mailto:" + item + "'>" + item + "</a>";
  } else {
    return urlify(item);
  }
}

export function convertColorToRGBA(color, opacity) {
  let result = color;
  // console.log('convertColorToRGBA' + color, opacity);
  if ( color.indexOf('#') > -1 ) {
    color = color.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  } else if ( color.indexOf('rgba') > -1 ) {
    const rgb = color.split(',');
    const r = rgb[0].substring(5);
    const g = rgb[1];
    const b = rgb[2];
    // const b = rgb[2].substring(1, rgb[2].length - 1);
    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  } else if ( color.indexOf('rgb(') > -1 ) {
    const rgb = color.split(',');
    // console.log(rgb);
    const r = rgb[0].substring(4);
    const g = rgb[1];
    const b = rgb[2].substring(0, rgb[2].length - 1);
    // console.log(b);
    // console.log(rgb[2].length);
    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  }
  // console.log('convertColorToRGBA' + color + result);
  return result;
}

export function getParameterByName(windowContext: any, name: string) {
  const url = windowContext.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
  // console.log('results----> ', results);
  if (!results) { return null; }
  if (!results[2]) {
    return 'true';
  } else if (results[2] === 'false' || results[2] === '0') {
    return 'false';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function getParameterValue(parameter: string, appConfig){  
  if(appConfig && appConfig[parameter] === true || appConfig[parameter] === 'true') {
    return true;
  } else if (appConfig && appConfig[parameter] === false || appConfig[parameter] === 'false') {
    return false
  }
}

// export function emailValidator(str) {
//   let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
//   if (str != "" && (str.length > 5 || EMAIL_REGEXP.test(str))) {
//     return true;
//   } else {
//     return false;
//   }
// }


export async function presentModal(modalController, page, attributes) {
  // console.log('UTILS - presentModal');
  const modal: HTMLIonModalElement =
    await modalController.create({
      component: page,
      componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: false
    });
  await modal.present();
  modal.onDidDismiss().then((detail: any) => {
    if (detail !== null) {
      // console.log('UTILS - presentModal - detail.data:', detail.data);
      return 'CLOSE!!!!!';
    }
  });
}


export async function closeModal(modalController: ModalController) {
  // console.log('UTILS - closeModal', modalController);
  await modalController.getTop();
  await modalController.dismiss({ confirmed: true });
  // try {
  //   modalController.dismiss({ dismissed: true, animate: false, duration: 0 });
  // } catch (err) {
  //   console.log('error closeModal', err);
  // }
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../../assets/i18n/', '.json');
}

export function redirect2(router, IDConv, conversationSelected) {
  if (window.innerWidth < 768) {
    // mobile
    // console.log('mobile::::', window.innerWidth, IDConv, conversationSelected, router);
    if (!IDConv) {
      router.navigateByUrl('/conversations-list');
    }
  } else {
    // desktop
    // console.log('desktop::::', window.innerWidth, IDConv, conversationSelected, router);
    if (IDConv) {
      let navigationExtras = {
        state: {
          conversationSelected: this.conversationSelected
        }
      };
      router.navigate(['conversation-detail/' + conversationSelected.uid], navigationExtras);
      //this.router.navigateByUrl('/conversation-detail/'+this.IDConv);
    }
  }
}




// https://liftcodeplay.com/2020/02/09/how-to-check-for-file-existance-in-firebase-storage/
// export async function imageExists(urlImage: string ) {
//   //Using async/await
//   const ref = firebase.storage().refFromURL(urlImage)
//   try {
//     return await ref.getDownloadURL()
//   } catch(e) {
//     // console.log(e);
//   }
//   // const listRef = firebase.storage()
//   // .refFromURL(imageurl)
//   // .getDownloadURL()
//   // .then((response) => {
//   //     // Found it. Do whatever
//   //     console.log('ok imageurl', imageurl);
//   //     return imageurl
//   // })
//   // .catch((err) => {
//   //     console.log('ERROR imageurl', imageurl);
//   //     return 
//   //     // Didn't exist... or some other error
//   // })
// }

/** */
export function checkPlatformIsMobile() {
  // console.log('UTILS - checkPlatformIsMobile:: ', window.innerWidth);
  // if (/Android|iPhone/i.test(window.navigator.userAgent)) {
  //   return true
  // }
  // return false
  if (window.innerWidth < 768) {
    return true;
  }
  return false;
}

export function isOniOSMobileDevice(): boolean {
  let IS_ON_IOS_MOBILE_DEVICE = false;
  if (/iPad|iPhone|iPod/i.test(window.navigator.userAgent)) {
    IS_ON_IOS_MOBILE_DEVICE = true;

  }
  // console.log('[CONVS-DETAIL][HEADER] IS_ON_IOS_MOBILE_DEVICE ', this.IS_ON_IOS_MOBILE_DEVICE)
  return IS_ON_IOS_MOBILE_DEVICE;
}

export function isOnMobileDevice() {
  let IS_ON_MOBILE_DEVICE = false;
  if (/Android|iPhone/i.test(window.navigator.userAgent)) {
    IS_ON_MOBILE_DEVICE = true;
  }
  // this.logger.log('[APP-COMP] IS_ON_MOBILE_DEVICE', this.IS_ON_MOBILE_DEVICE)
  return IS_ON_MOBILE_DEVICE;
}

export function checkWindowWidthIsLessThan991px() {
  // console.log('UTILS - checkWindowWidthIsLessThan991px:: ', window.innerWidth);
  if (window.innerWidth < 991) {
    return true;
  }
  return false;
}


// export function  toggleSidebar() {
//   const element = document.getElementById('tld-sidebar');
//   element.classList.toggle('open');
//   const elementApp = document.getElementsByTagName('app-root')[0];
//   if (elementApp.classList.contains('open')) {
//     elementApp.classList.remove('open');
//     elementApp.classList.add('close');
//   } else {
//     elementApp.classList.remove('close');
//     elementApp.classList.add('open');
//   }
// }


export function createExternalSidebar(renderer, srcIframe?, urlIcons?) {
  if (!urlIcons) {
    urlIcons = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
  }
  // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  document.head.innerHTML += '<link rel="stylesheet" type="text/css" href="' + urlIcons + '" />';

  if (!srcIframe || srcIframe === '') {
    srcIframe = 'https://support-pre.tiledesk.com/dashboard/';
  }

  const elementApp = document.getElementsByTagName('app-root')[0];
  elementApp.classList.add('close');


  // aggiungo js alla pagina
  let sidebarFunctions = '';
  sidebarFunctions += 'function toggleSidebar() {';
  sidebarFunctions += 'var element = document.getElementById("tld-sidebar");';
  sidebarFunctions += 'element.classList.toggle("open");';
  sidebarFunctions += 'var elementApp = document.getElementsByTagName("app-root")[0];';
  // sidebarFunctions += 'elementApp.classList.toggle("open");';
  sidebarFunctions += 'if(elementApp.classList.contains("open")){';
  sidebarFunctions += 'elementApp.classList.remove("open");';
  sidebarFunctions += 'elementApp.classList.add("close");';
  sidebarFunctions += '} else {';
  sidebarFunctions += 'elementApp.classList.remove("close");';
  sidebarFunctions += 'elementApp.classList.add("open");';
  sidebarFunctions += '}';
  sidebarFunctions += '}';
  sidebarFunctions += 'function openSidebar() {';
  sidebarFunctions += 'var element = document.getElementById("tld-sidebar");';
  sidebarFunctions += 'element.classList.add("open");';
  sidebarFunctions += 'var elementApp = document.getElementsByTagName("app-root")[0];';
  sidebarFunctions += 'elementApp.classList.remove("close");';
  sidebarFunctions += 'elementApp.classList.add("open");';
  sidebarFunctions += '}';
  sidebarFunctions += 'window.onmessage = function(e){';
  // sidebarFunctions += 'window.addEventListener("message", (e) => {';
  // sidebarFunctions +=   'alert("It works!", e);';
  sidebarFunctions += 'if (e.data === "open") {';
  sidebarFunctions += 'openSidebar();';
  sidebarFunctions += '}';
  sidebarFunctions += '};';

  const divScript = renderer.createElement('script');
  divScript.innerHTML = sidebarFunctions;
  renderer.appendChild(document.body, divScript);

  let dataString = '<div class="tld-button">';
  dataString += '<button class="btn btn-open" onclick="toggleSidebar()"><i class="fa fa-angle-right"></i></button>';
  dataString += '<button class="btn btn-close" onclick="toggleSidebar()"><i class="fa fa-close"></i> Close</button>';
  dataString += '</div>';
  dataString += '<div class="tld-iframe">';
  // tslint:disable-next-line: max-line-length
  dataString += '<iframe src="' + srcIframe + '#/projects-for-panel" width="300" height="100%" marginwidth="0" marginheight="0" frameborder="no" scrolling="yes" style="border-width:1px; border-color:#00000013; background:#FFF; border-style:solid;"></iframe>';
  dataString += '</div>';
  dataString += '</div>';

  // Use Angular's Renderer2 to create the div element
  const divSidebar = renderer.createElement('div');
  divSidebar.innerHTML = dataString;
  renderer.setProperty(divSidebar, 'id', 'tld-sidebar');
  renderer.appendChild(document.body, divSidebar);
}


export function isGroup(conv: ConversationModel) {
  // console.log('isGroup conv', conv) 
  // console.log('isGroup conv recipient', conv.recipient) 
  if (conv.recipient && conv.recipient.startsWith('group-') || conv.recipient && conv.recipient.startsWith('support-group')) {
    // console.log('isGroup conv HERE Y conv.recipient', conv.recipient) 
    return true
  };
  return false
}

export function checkAcceptedFile(fileType, fileUploadAccept ): boolean{
  
  if (fileUploadAccept === '*/*') {
    return true
  }
  // Dividi la stringa fileUploadAccept in un array di tipi accettati
  const acceptedTypes = fileUploadAccept.split(',');

  // Verifica se il tipo di file è accettato
  return acceptedTypes.some((accept) => {
    accept = accept.trim();
    // Controlla per i tipi MIME con wildcard, come image/*
    if (accept.endsWith('/*')) {
      const baseMimeType = fileType.split('/')[0]; // Ottieni la parte principale del MIME type
      return accept.replace('/*', '') === baseMimeType;
    }

    // Controlla se l'accettazione è un MIME type esatto (come image/jpeg)
    if (accept === fileType) {
      return true;
    }
    // Controlla per le estensioni di file specifiche come .pdf o .txt
    return fileType === getMimeTypeFromExtension(accept);
  });

}

function getMimeTypeFromExtension(extension: string): string {
  // Rimuovi il punto dall'estensione e ottieni il MIME type
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.wav' : 'audio/wav'
    // Aggiungi altri tipi MIME se necessario
  };
  return mimeTypes[extension] || '';
}

export function getProjectIdSelectedConversation(conversationWith: string): string{
  const conversationWith_segments = conversationWith.split('-')
  // Removes the last element of the array if is = to the separator
  if (conversationWith_segments[conversationWith_segments.length - 1] === '') {
    conversationWith_segments.pop()
  }
  let projectId = ''
  if (conversationWith_segments.length >= 4) {
    projectId = conversationWith_segments[2]
  }
  return projectId
}


export function isEmoji(str: string) {
  // tslint:disable-next-line:max-line-length
  const ranges = ['(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])'];
  if (str.match(ranges.join('|'))) {
      return true;
  } else {
      return false;
  }
}

// export function isAllowedUrlInText(text: string, allowedUrls: string[]): boolean {
//   // Regex per trovare URL o domini nudi nel testo
//   const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|(?:\b[\w-]+\.)+[a-z]{2,}(\/[^\s]*)?/gi;
//   const foundUrls = text.match(urlRegex);

//   if (!foundUrls) {
//     return true; // Nessun URL => testo ammesso
//   }

//   // Normalizza dominio: rimuove schema, www., slash finali
//   const normalize = (url: string) =>
//     url
//       .replace(/^https?:\/\//i, '')
//       .replace(/^www\./i, '')
//       .replace(/\/$/, '')
//       .toLowerCase();

//   // Normalizza tutti gli allowed pattern per confronto
//   const normalizedAllowedPatterns = allowedUrls.map(pattern =>
//     pattern
//       .replace(/^https?:\/\//i, '')
//       .replace(/^www\./i, '')
//       .replace(/\/$/, '')
//       .toLowerCase()
//       .replace(/\./g, '\\.')
//       .replace(/\//g, '\\/')
//       .replace(/\*/g, '.*')
//   );

//   return foundUrls.every(rawUrl => {
//     const url = normalize(rawUrl);
//     return normalizedAllowedPatterns.some(pattern => {
//       const regex = new RegExp(`^${pattern}$`, 'i');
//       return regex.test(url);
//     });
//   });
// }

export function isAllowedUrlInText(text: string, allowedUrls: string[]) {
  const urlsInMessage = extractUrls(text);
  console.log('urlsInMessage ++++ :', urlsInMessage);

  const allowedPatterns = allowedUrls.map((url) => {
    try {
      // Prova a estrarre il dominio da una URL completa
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname;
    } catch {
      // Lascia il dominio nudo (es: "*.tiledesk.com" o "tiledesk.com")
      return url.toLowerCase();
    }
  });

  const matchesAllowed = (domain: string) => {
    return allowedPatterns.some((pattern) => {
      if (pattern.startsWith('*.')) {
        const base = pattern.replace(/^\*\./, '');
        return domain === base || domain.endsWith('.' + base);
      } else {
        return domain === pattern;
      }
    });
  };

  const nonWhitelistedDomains = urlsInMessage.filter((url) => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return !matchesAllowed(domain);
    } catch (e) {
      return true; // Considera URL non valido come non ammesso
    }
  });

  return nonWhitelistedDomains.length === 0;
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}
