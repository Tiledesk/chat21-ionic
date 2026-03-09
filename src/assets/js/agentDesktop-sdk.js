 function loadAgentDesktopScript() {
  if (document.getElementById('agentdesktop-sdk')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'agentdesktop-sdk';
  script.type = 'text/javascript';
  script.src = 'https://devcti.aruba.it/AD/widget/agentdesktop_widget.js';
  script.async = true;

  script.onload = () => {
    console.log('AgentDesktop SDK caricato');
    window.agentDesktopLoaded = true;
  };

  script.onerror = (error) => {
    console.error('Errore nel caricamento AgentDesktop SDK', error);
  };


  

  

  if (document.body) {
    document.body.appendChild(script);
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(script);
    });
  }
}


function openTicketOnHDA(requestId){
  console.log('openTicketOnHDA called with requestId:', requestId);
  const message = { companyID: "1", sourceID: "CHAT", tiledeskID: requestId, target: "HDA", origin: "Tiledesk" }
  if(window && window.parent){
    window.parent.postMessage(message, 'https://devhda2bo.aruba.it/HDAPortal/');
    window.postMessage(message, 'https://devhda2bo.aruba.it/HDAPortal/');
    console.log('Message posted to parent window and current window');
  }

  if(window['AGENTDESKTOP']){
    console.log('AGENTDESKTOP exist. Sending message . . .');
    window['AGENTDESKTOP']['WIDGET'].sendDataToWidget('PAT', JSON.stringify(message)); // invia il messaggio ad HDA
    AGENTDESKTOP.TAB.GoTo('PAT'); // dà il focus ad HDA
    console.log('Message sent to AGENTDESKTOP widget');
  }


}

loadAgentDesktopScript();