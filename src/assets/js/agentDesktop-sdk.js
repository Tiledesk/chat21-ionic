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

    const TILEDESK_EVENT = {
      AUTH_CHANGED: 'onAuthStateChanged',
      NEW_CONVERSATION: 'onNewConversation',
    }

    window.addEventListener( 'message', function(event){
      if(event && event.data && event.data.type){
        switch(event.data.type){
          case TILEDESK_EVENT.NEW_CONVERSATION: {
            console.log('HANDLED onNewConversation:', event.data)
            let count = event.data.detail.count.toString()
            window['AGENTDESKTOP']['TAB'].Badge(count)
            break;
          }
        }
      }
    })
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

loadAgentDesktopScript();