# **CHAT21 IONIC - Changelog**

### **Authors**: 
*Gabriele Panico* <br>
*Dario De Pascalis* <br>
*Giovanni Troisi* <br>
*Nicola Lanzilotto* <br>
### **Copyrigth**: 
*Tiledesk SRL*

# 3.4.26 in PROD

# 3.4.26-rc2
- **removed**: archive button on list conversations if is not on mobile device

# 3.4.26-rc1
- **added**: tiledesk_projectID query param to manage user status
- **added**: token to managane ticket feature

# 3.4.25 in PROD
- **changed**: pipe marked to support malicious text input

# 3.4.24 in PROD
- **changed**: fullname in info message replaced with firstname

# 3.4.23 in PROD

# 3.4.23-rc3
- **added**: managed firstname and not fullname in message sent by agent

# 3.4.23-rc2
- **bug-fixed**: cannot upload xlsx files

# 3.4.23-rc1
- **bug-fixed**: cannot click to change user status 
- **bug-fixed**: tooltip not hided alfter click on it

# 3.4.22 in PROD
- **added**: managed allowed_upload_extentions from project settings

# 3.4.21 in PROD

# 3.4.20 in PROD

# 3.4.19 in PROD

# 3.4.19-rc3
- **changed**: eml message link added from attributes 

# 3.4.19-rc2
- **bug-fixed**: minor fix on ion-texarea element with allowed url domain

# 3.4.19-rc1
- added: ability to check for if emoji is allowd to be sent in message textarea
- added: ability to check for if url domain  is allowd to be sent in message textarea

# 3.4.18 in PROD

# 3.4.17 in PROD

# 3.4.16 in PROD

# 3.4.16-rc2
- **changed**: minor UI improvement copilot header button

# 3.4.16-rc1
- **added**: moved copilot from bubble-message to external rigth side
- **bug-fixed**: internal note note visible for message-sent section (rigth side)

# 3.4.15 in PROD

# 3.4.14 in PROD

# 3.4.14-rc2
- **changed**: minor improvement sendemail modal textarea

# 3.4.14-rc1
- **added**: moved copilot from message-text-area to header-conversaion-detail
- **changed**: 'open/close conversation info' icon
- **changed**: send-email model enlarged

# 3.4.13 in PROD

# 3.4.13-rc.5
- **removed**: tiledeskToken from tiledesk-service

# 3.4.13-rc.4
- **added**: management for copilot option in project.profile obj
- **removed**: token in each tiledesk Service method calls and added initialize method for each services
 
# 3.4.13-rc.3
- **added**: copilot-popover on each received message
- **changed**: canned-responsed no data ui

# 3.4.13-rc.2
- **added**: no-suggestions in copilot component
- **changed**: HIDE_CANNED_RESPONSES with SHOW CANNED_RESPONSES

# 3.4.13-rc.1
- **added**: copilot suggestions for agent responses

# 3.4.12 in PROD

# 3.4.12-rc.2
- **added**: chat-audio component to manage audio file sent and received

# 3.4.11 in PROD

# 3.4.10 in PROD

# 3.4.10-rc.1
- **changed**: sidebar and navbar UI aligned with dashboard component

# 3.4.9 in PROD

# 3.4.9-rc.1
- **bug-fixed**: close conversation also in case of tiledesk error

# 3.4.8 in PROD

# 3.4.8-rc.2
- **bug-fixed**: if support group is a group, do not call lookup api

# 3.4.8-rc.1
- **bug-fixed**: if support group is a group, do not call getRequest

# 3.4.7 in PROD

# 3.4.7-rc.2
- minior fix

# 3.4.7-rc.1
- **added**: uploaded control after file is loaded

# 3.4.6 in PROD

# 3.4.5 in PROD

# 3.4.5-rc.2
- **changed**: sidebar css improvement

# 3.4.5-rc.1
- **changed**: management of sidebar icon with env variable

# 3.4.4 in PROD

# 3.4.4-rc.1
- **added**: voice channel icon in conversation-list and conversation-detail header
- **changed**: sidebar structure

# 3.4.3 in PROD

# 3.4.3-rc.1
- **added**: encodeUri for project name on chatbot share link
- **added**: offlineMsgEmail project email to emable/disable automatic offline msg email

# 3.4.2 in PROD
- **added**: chat21client v0.1.12.8

# 3.4.1 in PROD
- **bug-fixed**: supportMode parameter is not typed as boolean

# 3.4.0 in PROD

# 3.4.0-rc.1
- **added**: downloadURL in metadata obj while sending message from tiledesk

# 3.3.0 in PROD

# 3.3.0-rc.1
- **added**: onBeforeInit event
- **added**: option to hide logout icon
- **changed**: BRAND_BASE_INFO values as string or boolean

# 3.2.3 in PROD

# 3.2.3-rc.1
- **added**: redirect to dashboard Login page in case of login error
- **added**: condition for docs 

# 3.2.2 in PROD
 - **bug-fixed**: unassigned url not logged-in as well

# 3.2.2-rc.1
- **bug-fixed**: unassigned url not logged-in as well

# 3.2.1 in PROD
- **bug-fixed**: cannot read property of undefined reading logger.error into brand-service.ts

# 3.2.0 in PROD
- **changed**: API_URL template key in favour of SERVER_BASE_URL

# 3.2.0-rc.1
- **added**: CONV_TYPE enum for all channel_type
- **bug-fixed**: do not sent automatic offline message if channel_type is messanger
- **bug-fixed**: disabled email section in conversation-detail footer if channel_type is whatsapp or messanger

# 3.1.0 in PROD

# 3.1.0-rc2
- **changed**: leadStyle storage property from appStorageService to localstorage 'custom_style' property
- **bug-fixed**: projects dropdown don't truncate long project name text

# 3.1.0-rc1
- **added**: INFO_MESSAGE_TYPE enum added to manage info message keys into message.attributes object
- **changed**: route to main page ('/conversation-detail') when a conversation is closed or abandoned
- **bug-fixed**: if agent abandoned a chat, detail still remain visible and can send message

# 3.0.109 in PROD

# 3.0.109-rc.1
- **added**: BASE_LOGO_GRAY resource key
- **bug-fixed**: body texarea into email modal has 0px height

# 3.0.108 in PROD

# 3.0.108.rc.1
- **added**: brandService to manage remote resources
- **added**: brandSrc env property
- **bug-fixed**: conversation-list header shows sidebar-user-detail button

# 3.0.107 in PROD

# 3.0.107.rc.9
- **changed**: whatsapp api url
- **changed**: whatsapp template params removed if array is empty
- **changed**: whatsapp template UI 

# 3.0.107.rc.8
- **bug-fixed**: form icon into conversation-list and header conversation-detail not change color 

# 3.0.107.rc.7
- **bug-fixed**: unassigned-convs not laoded custom external style via postMessage or event.subscribe methods
- **bug-fixed**: delete all old css class style while uploading (via postMessge) a new class
- **bug-fixed**: customStyle removed if refresh page or window.resize event is handled --> restore saved style from storage

# 3.0.107.rc.6
- **bug-fixed**: set is_new=false before archive an active conversation (not show not-read blu pointer and bold recipient fullname and last text)

# 3.0.107.rc.5
- **bug-fixed**: user info is not updated in sidebar-user-detail with SSO

# 3.0.107.rc.4
- **bug-fixed**: SSO, createCustomToken pass old token to authenticate chat engine module

# 3.0.107.rc.3
- **bug-fixed**: update tiledek_token after signInWithCustomToken

# 3.0.107.rc.2
- **added**: moved eventTrigger method from conversation-deatil and conversation-list pages to app.component.ts

# 3.0.107.rc.1
- **added**: globals and globals-settings services to manage env and option variables globally
- **added**: eventTrigger service to expose custom chat event to parent chat-iframe container
- **added**: new UI home management for supportMode
- **bug-fixed**: privateMsg colors not visible

# 3.0.106 in PROD
- **changed**: testsitebaseurl with widgetBaseUrl
- **changed**: WIDGET_TEST_LOCATION with WIDGET_LOCATION

# 3.0.105 in PROD

# 3.0.105.rc.1
- **added**: get tiledeskToken from tiledesk_token key in favour of appStorageService.getItem('tiledeskToken')

# 3.0.104.1 in PROD
- minor bug fixing

# 3.0.104 in PROD
- **bug-fixed**: messages are lost after chrome close all websocket connections due to inactivity and mqtt not reconnected automatically

# 3.0.103 in PROD

# 3.0.103-rc.2
- **added**: google signIn for mobile platform
- **added**: FMC and inAppBrowser plugins
- minor improvements on canned responses component
- **changed**: /email/send with new API 

# 3.0.103-rc.1
- **added**: ANGULAR 12 
- **added**: laxy loading of modal pages
- **bug-fixed**: cannot send new message in direct conversation for the first time

# 3.0.102 in PROD

# 3.0.102-rc.2
- **added**: ANGULAR 12 
- **added**: laxy loading of modal pages

# 3.0.102-rc.1
- **changed**: chat21client.js version to v0.1.12.5
- **changed**: set callback function on chat21client.connect without wait the subscription get back

# 3.0.101 in PROD
- **changed**: message-textarea tooltip translations
- **bug-fixed**: offline message warning appear also if user has not an email in leadInfo

# 3.0.100 in PROD
- **bug-fixed**: when offline email is sent, body message not send the last message on the conversation

# 3.0.99 in PROD

# 3.0.99-rc.2
- **bug-fixed**: after tiledesk closes a conversation, call archiveConversation's conversationsHandler method to manually remote it from active conversations list

# 3.0.99-rc.1
- **added**: audio file enabled
- **added**: audio icon if audio message is received in ion-list-conversations component
- **bug-fixed**: do not copy user if on mobile from profile-info modal
- **bug-fixed**: if lead email is deleted, leadInfo is not updated and can send email
- **removed**: PACKAGE.version in favour of environment.version

# 3.0.98 in PROD

# 3.0.98-rc.2
- **added**: maps modal for whatsapp location templates
- **changed**: **changed**: conversation?.attributes?.channel with conversation?.attributes?.request_channel

# 3.0.98-rc.1
- **changed**: conversation.attributes.channel with conversation.attributes.request_channel to get the current convesation channel
- **bug-fixed**: whatsapp template not enabled when agent is added to a whatsapp channel request

# 3.0.97 in PROD

# 3.0.97-rc.5
- **added**: whatsapp templates section to send an already configured whatsapp templete only in case of a whatsapp conversation channel type
- **added**: channel input var in message-text-area component to manage the type of current conversation
- **added**: whatsappTemplatesBaseUrl env key to manage whatsapp templates only for whatsapp conversations
- **added**: loader on contacts-directory page
- **changed**: send-email modal UI form mobile platform
- **bug-fixed**: do not show offline message if conversation has channel=whatsapp
- **bug-fixed**: do not send automatic offline email if conversation has channel=whatsapp

# 3.0.97-rc.4
- **bug-fixed**: error getting chat group members
- **bug-fixed**: missing info-conversation accordion label 

# 3.0.97-rc.3
- **added**: channel property to message/conversation and changed attributes.channel to attributes.offline_channel for offline message email
- **added**: channel info in conversation-header-detail component
- updated: tiledesk logo
- **bug-fixed**: sort last-messages for mqtt before publish to component

# 3.0.97-rc.2
- **added**: do not send automatic offline email if conversation is of type 'email' or 'form'
- **added**: new tooltip directive
- **added**: availability project user status on ProfileInfo page modal
- **added**: isOniOSMobileDevice and isOnMobileDevice in utils
- **added**: manage css for mobile/desktop modals
- **added**: custom tooltip directive
- **changed**: lib dependencies
- **bug-fixed**: new_message event sounds every time conv.is_new is true or false
- updated: ios icons
- **removed**: ticketing for mobile
- removed angular2-moment and ng2-tooltip-directive

# 3.0.97-rc.1
- **added**: if user is offline and message is sent, forward the entire conversation by email 

# 3.0.96 in PROD

# 3.0.96-rc.2
- **changed**: chat21client.js to v0.1.12.5 (window scope fixed)

# 3.0.96-rc.1
- **added**: isFirstMessage, isSameSender, isLastMessage, isFirstMessage function to utils-message
- **added**: online/offline status check for offline automatic email -> presence service impl
- **added**: websocket as mqtt-presence service dep
- **added**: tip message if lead has an email and is offline, when agent is on chat section in conversation-detail footer component

# 3.0.95 in PROD
- **bug-fixed**: cannot upload PDF files

# 3.0.95-rc.1
- **added**: custom colors to senderFullname to better distinguish the user
- **bug-fixed**: cannot read text.trim() of undefined if no text is sent with an image
- **bug-fixed**: markdown not split work correctly

# 3.0.94 in PROD
- **bug-fixed**: error getting projectId during lead detail for conversations with more than 4 segment

# 3.0.93 in PROD
- **added**: goToProfile sidebar-user-detail feature

# 3.0.92 in PROD

# 3.0.92-rc.1
- **added**: limit parameter to message-attachment component
- **added**: listen to new event related to user presence
- **changed**: message-text-area icons 
- **changed**: moved isSender function from service to utils-message
- **changed**: unsubscribe from unserved request directly using wsService and not with wsSocketJs
- **bug-fixed**: if user is offline and implicit email is sent, not show flash icon to indicate offline_msg 
- **bug-fixed**: conversation list not show projectName (cannot set properties of undefined reading 'projectId')
- **bug-fixed**: msg.text is undefined while reading trim()
- **removed**: user status from contact-directory

# 3.0.91 in PROD

# 3.0.91-rc.1
- **added**: pin-unpin canned (starting)
- **bug-fixed**: undefined in conversationsHandlerService firebase env with TOUCHING_OPERATOR info message
- **bug-fixed**: a html tag is outsite its container

# 3.0.90 in PROD

# 3.0.90-rc.7
- **added**: logLevel condition to enable Json Message option in bubble-message
- **bug-fixed**: enable Copy option in bubble-message only if text exist

# 3.0.90-rc.6
- **changed**: dimension of bottom tiledesk logo in left sidebar
- **removed**: isDev control

# 3.0.90-rc.5
- **added**: implementation of conversationChangedDetailed in MQTTConversationsHandler service
- **added**: LIVE_PAGE info-message type
- **added**: live page info in conversation. header (work in progress)
- **changed**: info-message UI
- **bug-fixed**: options-container not has transparent background if one emotion is present
- **bug-fixed**: modals not closed on ESC keyboard button
- **removed**: forward of logs to server

# 3.0.90-rc.4
- **added**: splitMessage in MQTTConversationHandler service
- **changed**: aligned FirebaseConversationHandler service to widget
- **removed**: MESSAGE_TYPE_DATE

# 3.0.90-rc.3
- **added**: options menu and popover on click to show copy, canned and Json response options 
- **changed**: icon-button moved outside bubble-message only for the first message of each sender

# 3.0.90-rc.2
- **added**: info and copy icon on received messages
- **added**: flash icon to distinguish chat offline message sent also by email

# 3.0.90-rc.1
- **added**: autofocus on first input
- **added**: tiledesk logo on sidebar
- **added**: sourceTitle if exist as message info; otherwize show sourcePage info from message attributes
- **added**: email icon if chat message is sent also via email
- **changed**: default color submit button
- **changed**: removed login modal and moved to dashboard login on logout/first login
- **bug-fixed**: chinese characters not displayed due to isEmojii function
- **bug-fixed**: label not translated in navbar


# 3.0.89 in PROD

# 3.0.89-rc.1
- **bug-fixed**: projectId/project_name is undefined in conversations-list component

# 3.0.88 in PROD

# 3.0.88-rc.2
- **added**: enable email only if active by env parameter
- **added**: emailSection env variable
- **added**: CHAT_STORAGE_PREFIX, EMAIL_SECTION env parameters

# 3.0.88-rc.1
- **bug-fixed**: projectId is undefined
- **bug-fixed**: typing subscription block UI on first conversation click

# 3.0.87 in PROD
- restored version 3.0.85

# 3.0.86 in PROD

# 3.0.86-rc.6
- **bug-fixed**: do not change showSourceInfo status if sourcePage info not exist
- **bug-fixed**: last_project is undefined

# 3.0.86-rc.5
- **added**: header-conversations-list-unassigned component
- **added**: toast after text is copied
- **added**: unassigned header to conversations-list page and joinConversation options icon
- **removed**: "Open" - "Close info detail" string from close/open info conversation detail

# 3.0.86-rc.4
- **bug-fixed**: close emoji-picker if focus is on message-text-area
- **bug-fixed**: removed hover background bell icon
- **bug-fixed**: input field not focused on click
- **bug-fixed**: set list-bkg-color as default background color for ion-split--pane component
- **changed**: create-canned-response UI
- **added**: sourcePage info to incoming messages
- **added**: copy icon to copy text to clipboard
- **added**: popover option to incoming messages

# 3.0.86-rc.3
- **bug-fixed**: cannot send message after email is queued successfully

# 3.0.86-rc.2
- **bug-fixed**: undefined reading 'channel' while render email icon in ion-conversation-detail component

# 3.0.86-rc.1
- **added**: send-email modal on Email footer option click
- **added**: handle window['analytics'] error
- **added**: send Offline message email if lead is offline and conversation is still open
- **changed**: info-conversation width from 300px to 320px
- **changed**: z-index of element when canned-list is open
- **changed**: chat21client.js file to 1.12.3
- **changed**: disable email section for direct conversations
- **changed**: do not reload right side bar conversation-info component
- **bug-fixed**: canned element is not focused on arrowDown keyboard action
- **bug-fixed**: if scroll over canned element, focus on text-area is missed
- **bug-fixed**: on text-area change, scroll conversation-detail if needed
- **removed**: 'Resolve' conversation button from header-conversation detail component

## 3.0.85 in PROD
- **bug-fixed**: remove focus from last edited canned
- **changed**: do not cache right side-bar conversation-info component
- **changed**: chat21client.js file to 1.12.3

## 3.0.84 in PROD
- **bug-fixed**: handle window['analytics] errors

## 3.0.83 in PROD
- **bug-fixed**: canned item is not visible (missing scroll position) if ArrowDown keyboard button is pressed
- **bug-fixed**: if ArrowUp keyboard button is pressed, text-area cursor moved left and canned not substituted correctly

## 3.0.82 in PROD
- **bug-fixed**: do not disable textArea if is a direct archived conversation
- **bug-fixed**: canned item not fire click event on Firefox browser

# 3.0.82-rc.7
- **bug-fixed**: do not disable textArea if is a direct archived conversation
- **bug-fixed**: canned item not fire click event on Firefox browser

# 3.0.82-rc.6
- **bug-fixed**: axios is undefined in chat21Client.js
- **bug-fixed**: if userImage not exist in sidebar--user-detail, no info of fillColor exist

# 3.0.82-rc.3
- **bug-fixed**: incorrect dashboard urls in navbar
- **changed**: used logger in mqtt auth service

# 3.0.82-rc.2
- **changed**: 'force' parameter to /close post as body content
- **changed**: enabled MTT 
- **changed**: position of 'LogOut' button in sidebar-user-detail component
- **bug-fixed**: removed scrollbar on firefox browser in conversation-list, contacts-directory pages

# 3.0.82-rc.1
- **changed**: forceArchive to force while calling /close API URL
- **changed**: chat21Client.js from 1.12.1 to 1.12.2
- **changed**: list conversations component with from 360px to 320px

# 3.0.81 in PROD

# 3.0.81-rc.3
- **bug-fixed**: if window width is less then 991px, move 'Close detail' icon to right
- **changed**: removed segment from index.html and loaded dynamically only if in not production

# 3.0.81-rc.2
- **changed**: canned loader
- **bug-fixed**: if search for a string that not correspond with an existing canned, was shown loader ever

# 3.0.81-rc.1
- **added**: remove bubble-message background if is image or iframe and no text is in message
- **added**: new sound if unassigned request arrive
- **added**: animation on hover an image
- **added**: parameter to /close to forse the closing of a conversation
- **added**: v.0.1.12.1 chatclient.js
- **changed**: info-message UI, image UI, frame UI
- **bug-fixed**: if click on canned icon, then close and clear '/' char, if click again on canned icon, '/' was not added to message text-area

# 3.0.80 in PROD
- **bug-fixed**: if search a canned response, after clicked it does not replaced into text-area

# 3.0.80-rc.1
- **changed**: moved sender_fullname inside bubble-message component
- **changed**: publish onConversationSelect event to stop audio after agent has clicked on it
- **bug-fixed**: /null  loading flag_url in sidebar-user-detail

# 3.0.79 in PROD
- **added**: segment analytics events

# 3.0.79-rc.4
- **bug-fixed**: testsiteBaseUrl wrong value env property

# 3.0.79-rc.3
- **added**: segment analytics for SignIn-SignOut-Resolved-MsgAdded-ConvAdded
- **added**: navbar component if not mobile
- **added**: NAVBAR translations
- **changed**: minor improvements on UI
- **changed**: ion-split-pane UI if mobile
- **changed**: moved hover 'add canned' button from bubble-message to ion-conversation-detail component
- **changed**: moved addNewCanned to tiledesk service to canned-responses service
- **bug-fixed**: open/close detail icon not aligned correctly on click 'close'

# 3.0.79-rc.2
- **added**: new sound if new conversation is triggered in agent's chat
- **changed**: header UI of header-conversation-detail and unassigned-conversations components

# 3.0.79-rc.1
- **added**: LABEL_ONLINE, LABEL_OFFLINE translations
- **changed**: renamed ddp-header with conversations-list-header
- **changed**: unified control to mobile/desktop app
- **changed**: LABEL_AVAILABLE/NOT_AVAILABLE with LABEL_ONLINE/OFFLINE in user-presence component	
- **changed**: icon to user-presence
- **changed**: UI for conversation-list, conversation-detail and info-group for desktop and mobile
- **changed**: renamed option-header component with header-conversations-list-archived
- **changed**: contacts-directory UI
- **bug-fixed**: if app is opened and user press width expand, move correctly the right position

## 3.0.78 in PROD 
- **bug-fixed**: unassigned request not sound the if is the first at all
- **bug-fixed**: canned responses opens in incorrect mode

# 3.0.78-rc.4
- **bug-fixed**: unassigned request not sound the if is the first at all
- **bug-fixed**: translations missed
- **bug-fixed**: direct info not showed in conversation-header component
- **removed**: conversation-footer border top
- **changed**: colors to message-text-area icons and message-attachment components

# 3.0.78-rc.3
- **changed**: user-typing location moved from conversation-header to conversation-detail component
- **changed**: replace includes with startsWith for check what type of conversation is in project info conversation-list component
- **added**: styleMap integrations to some elements	
- **bug-fixed**: no tooltip showed if no unserved request are present

# 3.0.78-rc.2
- **changed**: project item UI and tooltip msg
- **changed**: conversation UI in conversations list component
- **changed**: conversation detail header component
- **added**: open/close info-conversation moved from conversation-header to conversation detail component
- **bug-fixed**: canned responses opens in incorrect mode

# 3.0.78-rc.1
- **changed**: conversation-list page width increased
- **changed**: background changed in info-message component
- **changed**: project-item UI
- **changed**: conversation-list page UI

## 3.0.77 in PROD

# 3.0.77-rc.3
- **bug-fixed**: with env 

# 3.0.77-rc.2
- **bug-fixed**: on ng-select focused element show blue border
- **removed**: unused labels and translations

# 3.0.77-rc.1
- **added**: new sidebar-user-details and sidebar components
- **changed**: updateCurrentUserAvailability body http request to manage Inactive state 
- removed label 'LABEL_ACTIVE_NOW'

## 3.0.76 in PROD

# 3.0.76-rc.4
- **bug-fixed**: if canned component is opened and press twice the canned icon, canned-component not opens
- **bug-fixed**: bot images not resized
- **added**: caching of canned responses per project
- aded: loader in canned-component

# 3.0.76-rc.3
- **bug-fixed**: image-preview when agent click on image, don't fit the screen size
- **added**: network-connection component to manage no connections
- **removed**: no connection item in conversation-list page

# 3.0.76-rc.2
- **added**: canned component to manage canned responses
- **bug-fixed**: if more than oe '/' is present in message-text-area and a canned is selected, replace canned text on the last '/' character in the message string
- **bug-fixed**: close canned component if user click again on canned-icon-button

# 3.0.76-rc.1
- **changed**: senderFullName in list conversation for guest users with guest#uuid[0..5]
- **added**: multi-language to MEMBER_LEFT_GROUP and LEAD_UPDATED info messages
- **added**: onElementRendered event to image/frame/mesagge-attachment to scroll content after element is rendered
- **added**: enabled possibility to edit or delete a canned response created by yourself
- **added**: disable footer component of an archived conversation if it's been more than 10 days
- **removed**: scrollBar from conversation-detail page

## 3.0.75 in PROD

# 3.0.75-rc.2
- **bug-fixed**: unserved request count not updated correctly after a request is assigned

# 3.0.75-rc.1
- **added**: handled ESC keyboard button to dismiss image preview component

# 3.0.74 in PROD

# 3.0.74-rc.1
- **changed**: dashboardUrl in env from absolute to relative http url
- **bug-fixed**: not get projectId if is direct covnersation

# 3.0.73 in PROD

# 3.0.73-rc.1
- **bug-fixed**: topic.split is not a function while a conversation is closed by an agent in MQTT-conversations-handler.service
- **removed**: user id from contact-directory component

# 3.0.72 in PROD

# 3.0.72-rc.1
- **added**: user presence on contact-directory component

# 3.0.71 in PROD

# 3.0.71-rc.1
- **changed**: native downloadURL on new file uploaded
- **added**: update lead info in conversation-detail and conversation-header when agent updates 
- **added**: private message UI when agent receive a private message from other agents
- **removed**: scroll-bar from conversation-list page

# 3.0.70 in PROD

# 3.0.70-rc.2
- **added**: cache control max-age
- **added**: tooltip on info message in conversation-detail page

# 3.0.70-rc.1
- **changed**: README and LICENSE files
- **added**: cached conversations from storage in FirebaseConversationsHandlerService
- **added**: replase stored conversations after 10s of remote 'once' call
- **added**: icon and splash resources for mobile

# 3.0.69 in PROD

# 3.0.69-rc1
- **changed**: restored lookup behaviour for old conversations with 3 segment and without project id inside it

# 3.0.68 in PROD

# 3.0.68-rc3
- **bug-fixed**: not sound with unservedRequest if WebSocket restart again (every 3/5min)

# 3.0.68-rc2
 - **bug-fixed**: removed lookup API call for old requests

# 3.0.68-rc1
- **bug-fixed**: not sound if conversation.is_new changed from true to false in conversationChange BS
- **changed**: if message contains only 1 emoji remove bubble message background and increase font-size
- **added**: new languages az, sv, kk, uz
- **removed**: control in info-content component for old project id with 32 characters

# 3.0.67 in PROD
- **added**: control to 'foregroundCount' when tab is hidden/visible
- **added**: sound control on/off to new conversations and conversations changed

# 3.0.66 in PROD
- **added**: control to 'foregroundCount' locale storage variable from dashboard
- **added**: uk translations

# 3.0.65 in PROD
- **bug-fixed**: icons in sidebar were not alignet correctly on Safari
- **bug-fixed**: missing translations on sidebar-detail component and login-modal page on start when user logged in for the first time
- **bug-fixed**: some icons not showed in side-bar user detail component: replaced material-design-icons with material-icons
- **bug-fixed**: if removed conversation.uid is the selected ones, change url from /active to /archived with navigateByUrl after archivedConversation is completed
- **bug-fixed**: truncate sender_fullname in conversation-list and conversation-detail header components
- **added**: arabic translations language
- **changed**: behaviour of is_new of a conversation (not update 'is_new' conversation property if conv is the selected one or if sender is me)

# 3.0.65-rc3 - LATEST
- **changed**: retrive conversations with 'onces' firebase event and remove lastTimestamp from added, changed and removed fireabase subscriptions event
- **bug-fixed**: conversation not archived due to conversation_removed unhandled event
- **bug-fixed**: if removed conversation.uid is the selected ones, change url from /active to /archived with navigateByUrl after archivedConversation is completed


# 3.0.65-rc2 - LATEST
- **changed**: behaviour of is_new of a conversation (not update 'is_new' conversation property if conv is the selected one or if sender is me)

# 3.0.65-rc1 - LATEST
- **added**: improves chat performance by caching conversations
- **added**: Displays balloon messages with a light orange background for "internal notes" type message
- **added**: the html component
- **bug-fixed**: if archive conversation and do a refresh, url not change from active to archived
- **bug-fixed**: truncate sender_fullname in conversation-list and conversation-detail header components
- **bug-fixed**: on conversation removed, update local conversations on storage	

# 3.0.64 IN PROD
- Fixes the bug: in the conversation list, for the direct convesations, the name of the requester changes according to the order of arrival of the conversations

# 3.0.64-rc1
- Fixes the bug: in the conversation list, for the direct convesations, the name of the requester changes according to the order of arrival of the conversations
- Displays balloon messages with a light orange background for "internal notes" type message
- Adds the html component
- Improves chat performance by caching conversations

# 3.0.63
- Deploys in production

# 3.0.62.4-rc2
- Fixed bug: in the modal window showing the image preview before download, the image name is missing
- Add the ability to display the app sidebar in "wide mode"
- Displays balloon messages with a light orange background for "internal notes" type message
- Updates the regex that detects if the message contains only one or more emojis

# 3.0.62.4-rc1
- Fixes the bug: when the user profile is updated in the dashboard it is not updated in the chat
- Fixes the bug: when is sent a message with only emojis, some emojis have the chat balloon background
- Fixes the bug: in the conversation detail header  the requester's avatar does not update after the same has filled in the pre-chat form requested by the bot
- Fixes the bug: images that are not in the database cannot be downloaded
- Adds default chat color to emojis picker tabs
- Fixes the bug: the selected conversation is undefined
- Fixes the bug: in the conversation list, for the support convesations, the name of the requester changes according to the order of arrival of the conversations

# 3.0.62.3
- Fixes the bug: the method setTyping fired twice after that a message is sent
- Other minor improvements

# 3.0.62.2
- Fixed bug: if the teammate has the role of agent when switching from the dashboard to the chat and vice versa, the icons that only owners and admins have access to are displayed briefly in the left sidebar
- Adds the "Edit Profile" button and a link to the help center in the teammate details drawer

# 3.0.62.1
- Allows agents to use the "Monitor" page

# 3.0.62
- Deploys in production

# 3.0.62-rc2
- Fixed bug: in the teammate drawer if the full name is too long it overlaps the email
- Fixed bug: in the teammate drawer if the email is too long it exceeds the width of the drawer

# 3.0.62-rc1
- Change the URL of the environment variable "dashboardUrl" from absolute to relative

# 3.0.61
- Deploys in production

# 3.0.61-rc26
- Fixes the bug: the conversation detail is not opened if the URL contains round brackets

# 3.0.61-rc25
- Handles the case that in the storage the value of the "last_project" key is undefined

# 3.0.61-rc24
- Handles the "writeToButton" and the 'archivedButton' environment variables if are returned as a string
- Adds the "authPersistence" key in the chat-config-template.json, chat-config.json and env.sample files

# 3.0.61-rc23
- Handles the "supportMode" environment variable if returned as a string (fixes the Docker image bugs: part of the conversation details go under the sidebar in mobile mode, the "add message as canned response" button is not displayed)
- Fixes the position of the emoji selection window pop up when the canned responses button is not visible

# 3.0.61-rc22
- Minor improvements 

# 3.0.61-rc21
- Removes cordova-plugin-device

# 3.0.61-rc20
- Updates dependencies

# 3.0.61-rc19
- Merge branch 'features/new-sidebar'

# 3.0.61-rc18
- Fix bugs: in the teammate settings drawer the logout button area is too large
- Fixed the bug: in the detail of the conversation the button messages are not aligned with the other messages

# 3.0.61-rc16
- Does not allow teammates with agent role to access the "settings sidebar"

# 3.0.61-rc15
- Increase the size of the emoji and remove the background color when it is sent or received without text
- Adds the ability to open sidebar menu items in a new tab by combining left mouse button + CMD keyboard key

# 3.0.61-rc14
- Fixes the bug: the page to which the sidebar Settings menu item redirects is not correct for team members with agent role
- Fixes the bug: right clicking on the sidebar menu items doesn't show the context menu

# 3.0.61-rc12
- Improves the alignment of left sidebar menu item icons
- Adds the ability to add a message as a canned response
- Hides the "Open canned responses" button if the "supportMode" environment variable is set to false
- Fixes the bug: "Settings" menu item in the left sidebar redirects to the "Canned responses" page instead of the "Widget" page
- Adds the ability to add a new canned response
- Fixes the bug: "Resolve conversation" from conversation detail header doesn't work on mobile
- Adds the ability to insert emoji in the message text
- Fixes the bug: on iOS mobile devices in the conversation detail the requester's avatar is not vertically aligned
- Fixes the bug: on mobile devices in  the "info profile" modal window the version number is not visible because it is on a white background
- Fixes the bug: in the "Create canned response" modal window the "Add personalisation" menu does not always work
- Adds the chat version number to the teammate details drawer
- Makes the right sidebar "Settings" menu item visible to teammates with agent role

# 3.0.61-rc11
- Fixed the bug: the "Resolve" button is displayed in the header of the details of the archived conversations
- Fixed the bug: in the header of the conversation detail the "Resolve" button remains active even after resolving the conversation
- Adds the ability to create a ticket
- Adds tooltips to the buttons available in the header of the conversation list
- Change the text of the "Conversations" menu item in the left sidebar to "Monitor"

# 3.0.61-rc10
- Fixes the bug: the Analytics icon of the left sidebar is not displayed

# 3.0.61-rc9
- Fixes the bug: the Apps icon of the left sidebar is not displayed

# 3.0.61-rc8
- Changes the icon of the "Conversations" menu item to the left sidebar
- Adds Serbian language

# 3.0.61-rc7
- Fixes the bug: while loading the app, the conversation list changes size and becomes wider
- Changes the style of the left sidebar
- Display in the "user data drawer" an avatar constructed with the initials of the logged in teammate if his profile picture is not available

# 3.0.61-rc6
- Enhances the style of the sidebar tooltips
- Fixed bug: for direct conversations opening the "info sidebar" by clicking on the teammate avatar available in the conversation detail header does not work correctly
- Fixes the bug: not all chat strings are translated into the browser language or into the selected language
- Fixes the bug: Email is broken on dashes in user details sidebar
- Displays an alert when a teammate archives a conversation from a project they are no longer a part of
- Disable the "send message" textarea when a teammate replies to a support conversation of a project he is no longer a part of
- Adds, when an image is pasted in the "send message" text area, the text of the text area as a caption of the image preview modal window
- Adds, when an image is uploaded, the text of the "send message" text area as a caption of the image preview modal window

# 3.0.61-rc5
- Fixes the bug: on mobile devices the chat content is shifted to the right
- Adds the ability to open and close the "user detail sidebar" by clicking on the avatar of the logged teammate present on the sidebar
- Fixes the bug: canned responses remain visible even if, after making a filter, the backslash is deleted
- Prevents the "open canned responses" button from inserting a backslash if another one exists before
- Hides the badge that displays the number of unassigned conversations if there are none
- Improves custom scrollbar displayed in the sidebar and in user detail sidebar 
- Adds custom scrollbars to the conversation list and to the conversation detail

# 3.0.61-rc4
- Hides the item showing unassigned conversations in the list of archived conversations
- Adds in the list of conversations to the "archive" button the tooltip "Resolve" if the conversation is of type "support" and the tooltip "Archive" if the conversation is of type "direct" or "group"
- Changes all occurrences of the "teammatesButton" environment variable to "writeToButton"
- Fixes the bug: if the sidebar is visible and the window width is less than 768px, the content of the conversation detail is not completely visible
- Moves for conversations of type "support" the "Resolve conversation" button from the dropdown menu to the header of the conversation detail

# 3.0.61-rc3
- Replaces console.log with custom loggers 
- Fixes the bug: the info support sidebar is no more displayed

# 3.0.61-rc2
- Fixes the bug: Profile picture in the sidebar does not update when logged in with another user after logging out
- Bug Fix: in the "info-profile" page avoid the "uid of undefined" error
- Adds the "user details" sidebar
- Adds the languages flags images
- Allows to close the "user details" sidebar by clicking outside it
- Adds the tooltips to the links of the sidebar
- Hides the sidebar when the teammate logs out, if the app is on a mobile device and if the environment variable "supportMode" is set to false
- Hides in the item showing unassigned conversations the button to pin a project if the app is not on a mobile device 
- Gets in the sidebar the feature tokens from the environment variables
- Install the "Roboto" font
- Changes font priority in global.scss: replace "Helvetica Neue" font with "Roboto" font
- Imports the "Poppins" font family into index.html
- Adds the "Resolve" tooltip to the "archive" button available in the conversation list
- Displays the "Resolved Conversations" button and the "Teammates" button in the header of the conversation list  based on how the "teammatesButton" and "archivedButton" environment variables are set
- Adds "teammatesButton" and "archivedButton" variables to the environments
- Adds the "TEAMMATES_BUTTON" and the "ARCHIVED_BUTTON" variables to the env.sample file
- Adds the "teammatesButton" and the "archivedButton" variables to the "chat-config-template.json" file and to "the chat-config.json" file
- Updates the section "Configuration" of the "README.md" file with the new variables "teammatesButton" and the "archivedButton" 

# 3.0.61-rc1
- Adds a sidebar that allows navigation to the dashboard

# 3.0.60
- Deploys in production

# 3.0.60-rc9
- Adds the message "All conversations served" in the conversation details section that appears when there are no active conversations
- Fixes the bug: in the item that displays the number of unassigned conversations the button "fix a project" does not go to the right in mobile mode

# 3.0.60-rc8
- Fixes the bug: "info" messages sent by "SYSTEM" are not translated
- Adds the Portuguese language
- Adds the French language
- Adds the Russian language
- Adds the Turkish language

# 3.0.60-rc7
- Adds German language
- Adds a method that translates chat texts based on the language of the browser settings if no preferred language is selected in the dashboard or based on the preferred language (ignoring the browser language)
- Manages the language used for translations from the "moment" library based on the language of the browser settings if no preferred language has been selected in the dashboard or on the preferred language selected (ignoring the browser language)
- Adds the ability to manage the visibility of canned responses in env.sample, chat-config-tempalte.json and chat-config.json
- Fixes the bug: in the 'item' that displays the pinned project and the number of the not assigned conversions  the tooltip is not correctly displayed

# 3.0.60-rc6
- Fixes the bug: push notifications are initialized even if the "pushEngine" configuration variable is set to "none"
- Adds spanish language

# 3.0.60-rc5
- Change the icon and link of the "pin button" in the item at the top of the conversation list (now opens the list of projects and not the list of new conversations)
- Add a tooltip on the switch button to change the available/unavailable status
- Adds a link to the to the new conversations at the icon that display the number of new conversations

# 3.0.60-rc4
- Translates the canned response displayed when there are not canned responses

# 3.0.60-rc3
- Enhances the item at the top of the conversation list that displays the number of new conversations of a selected project
- Fixes the bug: the loading spinner is sometimes not displayed when loading the list of unassigned conversations
- Displays as canned response "Test" when no canned responses are available
- Adds the cursor to the "Send message" textarea after the "Canned responses" button has been clicked

# 3.0.60-rc2
- Fixes the bug: in AppConfigProvider the "wsUrl" is incorrect (window.location.port is missing)

# 3.0.60-rc1
- Adds the ability to view canned responses by clicking on the button with the "flash" icon located to the left of the "Enter a message" text area

# 3.0.59.2
- Fixes the bug: when the agent refreshes the chat page and the chat is in mobile mode, the badge with the number of unassigned conversations does not work

# 3.0.59.1
- Fixes the bug: "Unable to read uid of undefined" error occurs when agent logs out
- Fixes the bug: When the agent logs into the chat and the chat is in mobile mode, no conversations are displayed
- Fixes the bug: the websocket is initialized even if the supportMode property is set to false
- Fixes the bug: when the agent refreshes the chat page and the chat is in mobile mode, the badge with the number of unassigned conversations does not work

# 3.0.59
- Deploys in production 

# 3.0.59-rc23
- Fixes the bug: the badge indicating the number of unassigned conversations does not update correctly when the project is changed
- Changes the code that prevent the chat from opening in a new browser tab if the chat tab is already open
- Publish conversations returned by subscription to websocket conversations > "on data" callback

# 3.0.59-rc22
- Minor improvements

# 3.0.59-rc21
- chat21client.js -> v0.1.9

# 3.0.59-rc20
- Improves the transition from "mobile" to "desktop" mode and vice versa by not reloading the app 

# 3.0.59-rc19
- Fixes the bug: when the chat is in "mobile" mode and from the dashboard the agent clicks on "Open chat" for a specific conversation the "back" button of the chat does not return to the list of conversations
- Fixes the bug: when the chat is in "mobile" mode and from the dashboard the agent clicks on "Open chat" for a specific conversation the chat does not display the details of the conversation

# 3.0.59-rc18
- Improves the "app-config" service

# 3.0.59-rc16
- Changes in config.xml the value of the "SplashScreen"
- Improves the method to avoid page reloading when an agent clicks the "Open Chat" button of the dashboard on the realtime and non-real time conversation list page and on the conversation detail page
- Modifies the "app-config" service by adding the ability to pass relative URLs to the websocket
- Adds "wsUrlRel" property to env.sample, chat-config-template.json and chat-config.json
- Adds a check in the "websocket-js.ts" service on the existence of the "ws" property of the "WebSocketJs" class before accessing the property "readyState"

# 3.0.59-rc15
- Implements a method in app.components that counts and stores the number of open Chat tabs
- Implements a method on the conversation list page that prevents a new chat tab from opening when the agent clicks "Open Chat" from the dashboard

# 3.0.59-rc14
- Fixes the bug: the sound that warns that a new conversation has been received does not work

# 3.0.59-rc12
- Fixes the bug: Cannot read properties of undefined (reading 'get') when "translationMap" in not yet defined
- Fixes the bug: when the log out is performed, the item with the number of new conversations remains visible in the left side panel of the conversations list

# 3.0.59-rc11
- Fixed bug: the item in the left side panel showing the number of new conversations is not displayed if there are no conversations
- Removes the "last_project" object and the "contacts" object on logout from local storage

# 3.0.59-rc10
- Changes in config.xml the site URL of the author 
- Changes the splash screen images
- Adds the "browser" platform configuration in config.xml
- Initialize in app.module.ts firebase to handle push notifications if chatEngine is "mqtt"

# 3.0.59-rc9
- Changes in the archived conversations the date format if the browser language is English
- Displays the button to open the contact list for direct conversations and the entry at the top of the conversation list showing the number of unassigned conversations for a selected project if the "supportMode" configuration property is set to true
- Adds a style rule on the unassigned conversations page that changes the background of the "ion-content" if the project list is displayed in the iframe
- Adds "supportMode" property to env.sample, chat-config-template.json and chat-config.json

# 3.0.59-rc8
- Changes the title of the modal window showing unassigned conversations from "Unassigned Conversations" to "New Conversations"
- Fixes the bug: if the "chatEngine" property value is set to "mqtt" the login modal window does not disappear even if the agent is logged in
- Fixed the value of the configuration property "dashboardUrl"

# 3.0.59-rc7
- Fixes the bug "Cannot read properties of undefined (reading 'get')" in component template showing the number of new conversations
- Fixes the bug: the value of the "supportMode" property is passed hard-coded

# 3.0.59-rc6
- Outsources the websocket URL to environments
- Improves the graphic of the element, positioned at the top of the conversation list, which displays the number of new conversations
- Adds "wsUrl" property to env.sample, chat-config-template.json and chat-config.json
- Updates environments with "wsUrl" property

# 3.0.59-rc5
- Display a "toast message" of success after that the agent has joined to an unassigned conversation and other minor improvements

# 3.0.59-rc4
- Adds an item to the top of the conversation list that shows the number of unassigned conversations for a selected project
- Adds the ability, by clicking on the element that displays the number of unassigned conversations, to view the unassigned conversations and to join to them or archive them

# 3.0.59-rc3
- Improves the method that allows to chain multiple canned responses

# 3.0.59-rc2
- Fixes the bug: on small windows, images and iframes are not the same size as the bubble message that contains them
- Adds in the "bubble-message" component a check if the metadata is an object before calling the getMetadataSize() method
- Hides the "canned responses" if there are whitespace after the forward slash "/" or if there are no whitespace before the forward slash "/"
- Fixes the bug: if the "canned responses" are selected with the mouse, the "send message" text area does not have focus
- Adds the image viewer and the ability to download an image from it
- Fixes the position of the "archive" button when the app runs on mobile devices
- Updates Android splash screen .png image

# 3.0.59-rc1
- Fixes the bug: the "send message" button remains in the "disabled" state even if it is active
- Changes the format of the date displayed in the message tooltips
- Fixes the bug: the sender's avatar is not always displayed in the messages header
- Fixes the bug: the sender's name is not always displayed in the messages header
- Fixes the bug: in the avatar-profile component the properties 'avatarUrl', 'color' and 'avatar' are private and accessible only within the class
- Fixes the bug: on ios platforms the back button in the conversation details header overlaps the avatar

# 3.0.58.1
- Fix the bug: if the "chatEngine" property value is set to "mqtt "the login modal window does not disappear even if the agent is logged in

# 3.0.58
- Changes the logic with which the 'online' / 'offline' event is published (done before by the onAuthStateChanged() method)
- Removes the setTimeout set for displaying the login window
- Executes the "goOffline" method without checking whether the token exists in memory or not

# 3.0.57
- Review of the "login" code

# 3.0.56
- Improves the auto-login method

# 3.0.55
- Distributed release in production

# 3.0.55-rc26
- Fixes the bug: the iframe is not displayed
- Fits the image caption to the width of the image

# 3.0.55-rc25
- Changes the method to get the JWT from the URL query string and the way to run the auto login

# 3.0.55-rc24
- Improves the auto-login method

# 3.0.55-RC23
- Fixes the bug: missing contact information in the header when selecting a "Direct" conversation
- Fixes the bug: by clicking on an archived chat the avatar displayed in the header does not correspond to the one displayed in the conversation list and in the right side panel "conversation info"
- Fixes the bug: sometimes auto login with JWT passed in URL as query string doesn't work
- Improves the "send message" textarea graphics
- Adds the ability to insert a new line after the current position in the message text area by pressing the key combinations "ALT + ENTER", "CTRL + ENTER", "CMD + ENTER"

# 3.0.55-RC22
- Fixes the bug: if the chat is open in multiple browser tabs when the user log in the 'goOnline' method is activated several times
- Manages the message displayed in the conversation list when the sender sends a file (replace the markdown string with the string "sent an attachment")
- Fixes the bug: if the chat is open in multiple browser tabs when the user logs out, the conversation list remains visible
- Displays the "loading bubble" while uploading an image

# 3.0.55-RC21
- Fixes the bug: if the chat is open in more than one browser tab, not all of them reconnect when the user accesses one of them

# 3.0.55-RC20
- Improve the method that solves the bug: if the chat is open on more than one tab, the previous ones disconnect
- Displays the message "sent an image" when the sender sends an image
- Removes the "setTimeout" set on the onStorageChanged event

# 3.0.55-RC19
- Fixes the bug: opening the "conversations info" side panel for support type conversations causes the chat to log out

# 3.0.55-RC18
- Fixes the bug: if the chat is open on more than one tab, the previous ones logging out

# 3.0.55-RC16
- Removes the image name displayed at the bottom of the image
- Removes the adaptation of the image caption width to the image size

# 3.0.55-RC15
- Fixes the bug: "ion-spinner" throws an error when the chat is offline
- Fixes the bug: in the component "info-group-component" if groupDetail is not defined throws the error "Cannot read hasOwnProperty of undefined"
- Fixes the bug: in the "advanced-info-accordion" component if translationMap is not defined throws the error "Cannot read properties of undefined (reading 'get')"
- Fixes the bug: in the component "user-presence.component" if translationMap is not defined throws the error "Cannot read properties of undefined (reading 'get')"
- Fixes the bug: if the image name is longer than the image width when uploading, it is displayed on the right side of the image
- Fixes the bug: if the user logs out of the dashboard and then logs in, the user in the chat is not logged in again
- Fixes the bug: if the file upload preview window is closed without sending the file, the windows does not reopen if the same file is selected
- Adds autofocus in the "caption" text area in the file upload preview window

# 3.0.55-RC14
- Implements Network service
- Displays, when the chat loses connection, the message "Waiting for network" at the top of the conversation list
- Displays, when the chat loses connection, the message "Internet is slow or not working" on the conversation details page
- Set the "user" variable to null when the user logs out of chat

# 3.0.55-RC12
- Fixes the bug: when a file is uploaded via drag & drop, the message "Failed to upload: the format is not supported" is displayed even if fileUploadAccept is set to "* / *" (accept all)
- Fixes the bug: the left side panel "conversation list" is not displayed on Safari
- Fixes the bug: on Safari, clicking a button causes the app to reload or crash
- Adds a gradient background to the avatars

# 3.0.55-RC11
- Replaces the message "No internet connection" displayed when Internet is slow or not working  with the message "Internet is slow or not working."

# 3.0.55-RC10
- Fixes the bug: Safari doesn't support the API's required to use FCM
- Fixes the bug: the drag and drop does not take into account the accepted files set in the "fileUploadAccept" environments property
- Fixes the bug: on Safari in the login modal the email and psw entered are not displayed

# 3.0.55-RC9
- Adds the left panel "projects"

# 3.0.55-RC8
- Improves backward compatibility for old conversations of the "archive", "predefined replies" features and for displaying the right "Conversation Info" panel
- Bug fixing

# 3.0.55-RC7
- Adds the message "No Internet Connection" when the chat tab is a blank page
- Adds a "toast" indicating when the chat has lost connection
- Adds action button component
- Fixes the bug: when accessing the chat without internet connection, the chat does not restart when the connection is restored
- Fixes the bug: old conversations are not archived (implemented backwards compatibility)

# 3.0.55-RC6
- Fixes the bug: when the pc starts up, if the connection is missing, the chat tab is a blank page and remains so even after the connection

# 3.0.55-RC5
- Removes the changes in version 3.0.55-RC4
- Updates the method of "app.component.ts" watchToConnectionStatus()

# 3.0.55-RC4
- Set "Auth.Persistence" to "firebase.auth().signInWithCustomToken" method
- Hardcoded the authPersistence value to 'LOCAL' in the 'localSessionStorage' service

# 3.0.55-RC3
- Fixes the bug with another solution: the sender name in the conversation list does not match the sender name in the conversation details header
- Adds Android resources
- Set the "auth Persistence" environment variable to NONE

# 3.0.55-RC2
- Adds style rules to fit the image name to its width
- Improves the method of getting Project ID from Conversation ID

# 3.0.54-RC2
- Fixes the bug: canned responses are not loaded
- Adds backward compatibility: loading of canned responses for old projects

# 3.0.54-RC1
- Moves FCM property "VAPID" to environments
- Adds FCM "VAPID" property to env.sample, chat-config.json and chat-config-template.json files
- Enhances the firebase-messaging-sw.js

# 3.0.53-RC6
- Adds "VAPID" in the getToken() method of the "firebase-notification.service"
- Adds log in the "firebase-notification.service"

# 3.0.53-RC5
- Push notification debug

# 3.0.53-RC4
- Enhances the service worker postMessage method 

# 3.0.53-RC3
- Enhances listenToNotificationCLick() method and rename it to listenToSwPostMessage()

# 3.0.53-RC2
- Commented the method listenToNotificationCLick() 

# 3.0.53-RC1
- Fixes the bug: sometimes the message sender name displayed in the header is different from the one displayed in the conversation list
- Fixes the bug: duplicate push notifications
- Increase the height of the selectable message in the conversation list to prevent the 'Archive' icon and the sender name text from overlapping the string indicating the message arrival time
- Updates the avatars background colors
- Fixes the bug: 404 error when trying to view the profile picture of "support-group" conversations requesters
- Adds the date the message was sent to the list of archived conversations
- Translates the date "how long ago" the message was sent in the conversation list


# 3.0.52-beta
- Replaces the label "conversation ID" with "user ID" in the accordion available in the panel "conversation info" of direct conversations
- Adds the ability to change the log level via the query-string parameter "logLevel"
- Fixes the bug: clicking on a push notification, if it is a "direct" conversation, the correct conversation is not selected after redirection

# 3.0.51-beta
- Enhances the style of the search bar in the contact list
- Adds the ability to upload a file by dragging it to the chat area
- Fixes the bug: Chat scrolls up when file preview page opens after dragging the file or image 
- Fixes the bug: the 'loading bubble' is not displayed if the last message is at the bottom of the chat area
- Fixes the bug: in the "upload preview page" the file icon in the footer is not displayed correctly if the file name is on two lines
- Adds backward compatibility for viewing conversation details for "support group" type conversations in the "Conversation Information" panel
- Displays the text "No information available" in the right side panel "Conversation Information" when no information on the selected conversation is found

# 3.0.50-beta
- Fixes the bug: in the right side panel 'info group' the loading of members fires twice
- Fixes the bug: autofocus doesn't always work
- Fixes the bug: browser tab title sounds and blinks even if the message is sent by the logged in user
- Fixes the bug: browser tab title sounds and blinks if the user change tab during page refresh
- Fixes the bug: browser tab title sounds and blinks if the user change tab during page refresh
- Fixes the bug: after uploading the image via drag-and-drop, if the user opens or closes the right side panel or opens another conversation, the image upload preview modal window reopens
- In the package.json: changes the name of the author + updates version + adds "cordova-android-support-gradle-release"  + downgrade "cordova-android" from the version 9.0.0 to 6.2.3
- Replaces, in conversation list, when the logged user send an image the markdown with the string "You sent an image" and when send a file with the string "You sent an attachment"
- Displays the attach icon in the conversation list if the conversation type is "file"
- Fixes the bug: if an image without text is sent as the first message, the conversation does not appear in the conversation list

# 3.0.49-beta
- Replaces in "chat-config-template.json" the value "${TENANT}" of the property "tenant" in "${FIREBASE TENANT}"

# 3.0.48-beta
- Update environments by moving the "tenant" environment variable to the "firebaseConfig" object

# 3.0.47-beta
- Changes the obtaining of the "tenant" environment variable moved inside the "firebaseConfig" configuration
- Removes unused services "chat-contacts-synchronizer.ts" (class "ChatContactsSynchronizer") and "database.ts" (class DatabaseProvider)
- Moves the environment variable 'tenant' in the object "firebaseConfig" of the files chat-config.json, chat-config-template.json; updated README.md
- Fixes the bug: after logging out the list of conversations is still visible
- Fixes the bug: modal "login" is sometimes loaded twice after logout
- Downgrades the mqtt library from version 4.2.8 to 4.1.0
- Check if the serviceWorker exists before to append 'addEventListener' (fixes the bug addEventListener of undefined)

# 3.0.46-beta
- Modifies the "logger service" to accept only values of string type from the "logLevel" environments property (Error < Warn < Info < Debug)
- Updates the README.md
- Replaces the value of the "logLevel" property of numeric type with the corresponding value of type string in the env.sample and chat-config.json files
- Adds unit tests

# 3.0.45-beta
- Adds the ability to display the canned responses by pressing '/' anywhere in the message
- Fixes the bug: in group side panel are not displayed the members

# 3.0.44-beta
- Fixes the bug: When a canned response is selected from the keyboard and enter is pressed, the slash character "/" is sent as a message
- Fixes the bug: default log level is undefined if it is not setted in the eviroment.*

# 3.0.43-beta
- Fixes the bug: logger of undefined in firebase-notifications and in app.component
- Fixes the bug: "el" of undefined in "conversation-detail.page"
- Fixes the bug: Canned responses are not displayed

# 3.0.42-beta.1.19
- Fixes the bug: uploading images by dragging to the "conversation detail" area does not work if the image is dragged to an area without messages

# 3.0.42-beta.1.18
- Improves logger service
- Fixes the bug: with MQTT enviroment it is not possible to know changes in the conversation

# 3.0.42-beta.1.17
- Note: this version has been published under the subfolder "chat5"
- Adds the right side panel that allows the selection of projects to which the current user belongs and the display of unassigned conversations 
- Fixes the bug: Property 'addUploadingBubbleEvent' does not exist on type 'ConversationDetailPage'.

# 3.0.42-beta.1.16
- Bug fixed: the selected image preview popup window opens twice if after selecting the image dragging it in the chat area, the image is selected pasting it in the 'send message' texarea,
- Prevents the user from pasting non-image files into the 'send message' textarea 
- Displays an error message when files that are not of type image are pasted in the "send message" text area
- Displays an error message when files that are not of type image are dragged into the chat area

# 3.0.42-beta.1.15
- Adds the ability to select an image to upload by drag it in the chat area
- Adds the ability to upload an image or file by pressing the "Enter" keyboard key
- Fixes the bug: the placeholder in the textarea 'send message' isn't responsive and when it is on two lines of text it overlaps the chat content
- Fixes the bug: if the canned responses are called on group type or direct type conversations, an error is thrown as the project id is not available

# 3.0.42-beta.1.14
- Minor improvements

# 3.0.42-beta.1.13
- Fixes the bug: if the message inserted in the textarea has more lines of text, that textarea overlaps the chat content
- Adds the ability to select an image to upload by paste it in the 'send message' textarea
- Fixes the bug: the placeholder in the textarea 'send message' isn't responsive and when it is on two lines of text it overlaps the chat content

# 3.0.42-beta.1.12
- Renames the 'temp' folder in 'chatib'
- Improves the button to attach files / images 
- Changes the endpoint where images and files are saved in the 'firebase-upload' service
- Adds the ability to upload any file type
- Adds the extension and name of the file that will be uploaded into the popup modal preview
- Displays an error message if the file upload failed
- Fixes the bug: if the uploaded file has a size of 0 bytes, the "bubble spinner" is displayed twice and the second remains visible
- Fixes the bug: the user ID and uiid are added to the downloaded file name
- Adds in the environments the 'fileUploadAccept' key set by default to accept the upload of any type of file and binds the value in message-text-area
- Changes the Log Level number values
- Decreases the display delay of the message tooltips (from 1500ms to 500ms)
- Adds in chat-config-template.json, chat-config.json and env.sample the keys "fileUploadAccept" and "logLevel"
- Changes in the environments the default value of the log level to 1
- Updates the mqtt library to the latest version (4.2.8) 

# 3.0.42-beta.1.11
- Improves the "push notifications service worker" and in conversations-list-page the method listenToNotificationCLick()
- Changes in the "precence.service" and "typing.service" the occurrences where the "tenant" property is obtained from the environment rather than from 'appConfig'

# 3.0.42-beta.1.10
- Improves the "push notifications service worker"

# 3.0.42-beta.1.9
- Adds logs in "firebase-messaging-sw.js" and in "conversations-list.page.ts" for push notification test

# 3.0.42-beta.1.8
- Handles the responses of the 'signInWithEmailAndPassword' method: displays a toast in case of error and a spinner waiting for the response
- Adds in the "login component" the links to the dashboard's pages "reset password" and "signup"
- Adds in the "login component" the display of validation errors of the authentication form 
- Adds the preview of the selected SVG image in image/file preview popup 
- Fixes the bug: "fileSelected of undefined" when the image/file preview popup is closed without any image or file being selected
- Adds the check of the pushEngine key set to "none" in the "notificationsServiceFactory" function of app.module
- Changes occurrences where "tenant" is obtained from "environment" by getting it from "appConfig" (app.component.ts, info.content.component.ts, conversation-detail.page, conversation-list.page)
- Adds in info-message.component.html the pipe htmlEntiesEncode
- Updates in the firebase-messaging-sw.js the version of Firebase SDK imported and replaces the deprecated method "setBackgroundMessageHandler()" with the new onBackgroundMessage()
- Removes the dependecies of the "appConfig" from the "notifications classes"
- Removes imageUrl from setConversationAvatar utils function 
- Fixed the bug: if pushEngine is setted to none are called the method getNotificationPermissionAndSaveToken()
- Adds the "tenant" property in chat-config and chat-config-template
- Fixed the bug: the logger is not displayed
- Adds the ability by clicking on a push notification to open the chat, that is in background or that is closed, directly to the conversation to which the push notification refers
- Renames FirebaseGroupHandler in FirebaseGroupsHandler,
- Removes unused components (conversation-archived-list and current-user-service)

# 3.0.42-beta.1.7
- Adds the Html entities encode pipe and removes the entities encode from the sendMessage method
- Adds the abstract class "notification.service" and the classes "firebase-notifications" and "mqtt-notifications"

# 3.0.42-beta.1.6
- Disables the dark mode
- Fixed the bug: in pre environment the the uploadEngine key is set to 'native'

# 3.0.42-beta.1.5
- Sets in pre: the value of the key chatEngine to 'firebase', the value of the key uploadEngine to 'firebase' and the value of the key pushEngine to 'firebase'

# 3.0.42-beta.1.4
- Updated in pre environment the endpoints of "dashboardUrl" to the Dashboard latest versions (2.1.70-beta.1.6)

# 3.0.42-beta.1.3
- Fixes the bug: if the uploadEngine key is set to native images and files are not upload
- Sets in pre: the value of the key chatEngine to 'mqtt', the value of the key uploadEngine to 'native' and the value of the key pushEngine to 'none'

# 3.0.42-beta.1.2
- Adds push notifications
- Updates firebase SDK to the 8.6.7 version
- Changes the import of firebase 'import * as firebase from "firebase/app"' with 'import firebase from "firebase/app"'

# 3.0.42-beta.1.1
- Fixes the bug: if the uploadEngine key is set to native the svg images are not uploaded
- Fixes the bug: "logger.printLog" is not a function in "conversation-content-component"
- Fixes the bug: with native uploadEgine uploading files or images whose names contain spaces return broken URLs
- Fixes the bug: when switching from mobile to desktop mode, if a conversation is selected in the conversation details, the list of conversations is displayed
- Fixes the bug: when switching from desktop mode to mobile mode, if no conversation is selected, the conversation list is not displayed
- Fixes the bug: remove the dependency of the "LoggerService" from the 'ion-conversation-detail' component constructor

# 3.0.42-beta.1.0
- Minor improvements

# 3.0.42
- Fixes the bug: in mobile mode in the right side panel "Conversation info" the textarea 'send message' is displayed
- Fixes the bug: the button open/close the right side panel 'Info conversation' does not work correctly
- Hides the 'Conversation Info' right side panel when the window width is less than 991px

# 3.0.41
- Sets in pre environment the key "uploadEngine" to "firebase"
- Fixes the bug: when is pressed enter in the textarea "send message" is added a new line
- Fixes the bug: the text of the message is always written on a single line, ignoring line breaks
- Adds a bubble with an upload spinner to the in-conversation-detail page when uploading a file using uploadEngine = 'firebase'
- Displays in the loader-preview page a placeholder image when a file is selected to be loaded
- Removes from the services "firebase-conversation-handler",  "firebase-conversations-handler", "firebase-archivedconversations-handler" and mqtt-conversation-handler the HTML entities encode
- Improves the "htmlEntities" function and adds the "replaceEndOfLine" function

# 3.0.40
- Improves the methods implemented for the correct display of messages in the conversation list when a snippet of code is pasted

# 3.0.39
- Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the chat
- Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the convesations list 

# 3.0.38
- Conditions the display of the splash screen only on platforms other than "desktop" (on the desktop platforms the splash screen is not supported)
- Fixes the bug: signin button is not disable when the form is invalid
- Fixes the bug: markdown doen't work when the page is refreshed
- Adds the encode of the HTML entities

# 3.0.37
- Fixes the bug: the skeleton placeholder remains active after logout 

# 3.0.36
- Fixes the bug: in the list of conversations user last messsagge is showed more times
- Adds in the list of conversations (active and archived) the placeholder 'No conversation yet' displayed when there aren't conversation
- Manages the title on the browser tab when new messages are received: indication of the number of new messages that are received when the tab is not active
- Fixes the bug: canned responses are called even if the slash ('/') is not at the beginning of the sentence
- Conditions the canned responses call to the existence of the project id
- Centers the placeholder message "Still no message here..."

# 3.0.35
- Adds a tooltip in the logged user profile panel that displays the user's id and the ability to copy it by clicking on the avatar
- Replaces in the list of conversations (active and archived) the text 'loading' with a skeleton placeholder
- Replaces in the detail of the conversation the image and the text "text new conversation + button" with the text "Please select a chat to start messaging"
- Fixes the bug: in the list of conversations user last messsagge is showed more times

# 3.0.34
- Fixes the bug: in the right side panel of "direct" conversations the "Advanced" accordion opens only once
- Fixes the bug: in the conversation list message text goes on a new line when there is the image icon
- Fixes the bug: in the list of conversations the 'archive conversation' button is displayed fixed on the right and not on mouseover

# 3.0.33
- Changes dashboard url

# 3.0.32
- Changes dashboard url

# 3.0.31
- test Native uploadEngine 

# 3.0.30
- Added image skeleton while load image
- Improved uploaded images styles 
- Added Native-Image-repo service

# 3.0.29
- Fixes the bug: "Cannot read property 'forEach' of undefined" when subscriptions are undefined
- Fixes the bug: user's profile photo is not displayed in the right side panel of "direct" type conversations
- Fixes the bug: user's profile photo is not displayed in the conversation header
- Fixes the bug: users' profile pictures are not displayed in the left panel "write to"
- Fixes the bug: the same image cannot be loaded twice

# 3.0.28
- Minor improvements

# 3.0.27
- Fixes the bug: the call to get the contact details is not made on mqtt environment

# 3.0.26
- Minor improvements

# 3.0.25
- Bug fixing

# 3.0.24 
- Adds in "group" conversations the display of members belonging to the group type (avatar, name and online / offline status)
- Fixes the bug: in the setInfoSupportGroup method the project ID is taken from the detail attributes of the group which may not be available (now it is taken from 'conversatioWith')
- Adds autofocus in the "send message" text area
- Fixes the bug: files in the mqtt environment are not loaded

# 3.0.23
- Fixes the bug: the avatar image of the logged in user is not displayed in the left menu "profile-info"
- Fixes the bug: the group names are incorrect (for active and archived conversations)
- Adds the component "advanced-info-accordion"
- Adds the "closeSupportGroup" method to archive support group conversations
- Modify the "deleteConversation" method to archive conversations of type "direct" and "group" (deleted the query string "forall = true")
- Adds the "generateGroupAvatar" method in the conversation-detail.page
- Adds the input "groupDetails" to the "app-info-content" component
- Displays an image icon in the conversation list if the conversation type is image
- Enhances right sidebar for "direct" conversations
- Implements the right sidebar for group type conversations (in progerss)
- Improves "actionScrollBottom" method
- Fixes the bug: "startsWith" of undefined in the method "isGroup"

# 3.0.22
- Fixes the bug: the modal login window opens even if the user is logged in
- Fixes the bug: contact avatar is not displayed in the contact list (write to)
- Manages scroll position in concversation detail page as widget behaviour 
- Bug fixed onInit selected conversation in ion-list-conversations.component
- Improves the conversation list graphics in the left side panel
- Implemented the method for archiving conversations
- Fixes the bug: clicking on an archived conversation does not update the 'read conversation' badge
- Fixes the bug: the messages in the conversation detail are all aligned to the left
- Fixes the bug: the selected active conversation is no longer selected when the user returns to active conversations from archived conversations
- Deletes the persistence of the last open conversation from the local storage
- Restores the button 'open conversation detail'
- Changes the mqtt library (v4.2.6) loading: from external loaded in index.html to local loaded in angular.json
- Adds checking for user existence before running "setPresence" in the goOnLine method of app.component
- Adds a path to "Conversation-detail" with only the conversation ID parameter
- Renames (and improves) the method connect in subscribeToConversations and removes the subscriptions to the conversation detail
- Modifies the "getConversationDetail" method to return a callback and moves the subscription to the method from the "conversation details" page to the "information-content" component
- Changes the "setConversationRead" method to accept the conversation ID as parameter and no longer the selected conversation
- Closes the contacts modal window when a contact is selected
- Moves conversations subscription in "app.component" from "conversation-list-page"
- Fixes the bug: the "loadContactsFromUrl" service does not work if the chatEngine is "mqtt"
- Fixes the bug: when the user logs out, the "removePresence" method throws errors because it is executed after the "signOut" method of Firebase
- Renamed "pushUploadMessage" in upload-service with "upload()"
- Implemented new NATIVE-UPLOAD-SERVICE and added in mqtt app.module uploadFactory section (not active yet)
- Handled promise of upload in message-text-area while upload a file/image
- Fixes the bug: the images are not loaded in the current conversation
- Fixes the bug: the right panel does not display information relating to the type of conversation selected
- Fixes the bug: the 'channelType' in messages is incorrect
- Fixes the bug: the link of the downloaded file is not displayed
- Fixes the bug: the right side panel does not show the content related to the selected conversation type
- Handled archivedconversations service in dispose method of chat-manager
- Bug fixed on logout
- Bug fixed chat21client undefined in MqttArchivedConversationsHandlerService
- Renamed group-service with groups-handler.service
- Added MQTTArchivedConversationsHandler in the archivedConversationsHandlerFactory
- Adds the ability to manage responses with the project's 'canned responses' and select them with the keyboard's up and down arrows

# 3.0.21
- Fixes the bug: on the browser the archived conversation window is opened multiple times by clicking on the 'Archived' button
- Fixes the bug: on mobile the archived conversations window is no longer displayed if it has been opened once
- Highlights the archived conversation with a background color
- Fixes the bug: the detail of the selected conversation does not open on mobile


# 3.0.20
- Adds the ability to display the archived conversations

# 3.0.17
- bug fix: changed abstract classes in app module
- **changed**: class presence
- **changed**: class typing

# 3.0.16


# 3.0.15
- bug-fix: changed routing removing url parameters
- bug-fix: create new conversation
- **changed**: create abstract classes for services
- bug-fix: scroll-page
- **changed**: replaced Observable with BehaviourSubject

# 3.0.14
- new: create new conversation
- new: added conversations cache

# 3.0.13
- bug-fix: open/close modal login
- new: added alert on error login
- bug-fix: auth with JWT token from url queryParams
- bug-fix: routing list detail
- new: added BehaviourSubject on authChange
- new: load chat components after login
- bug-fix: contact list: load contacts


# 3.0.11
- new: set persistence firebase from environment 
- new: get JWT token from url queryParams and signin with token 
- new: save token in localstorage

# 3.0.10
- bug-fix: url navigation
- bug-fix: CONTACTS_URL from environment

# 3.0.9
- bug-fix: info conversation right sidebar

# 3.0.8
- new: added Scrivi a...

# 3.0.7
- bug fix: navigation and routing

# 3.0.6
- test build platforms browser, ios, android --prod

# 3.0.1
- add scrollBarButton
- adds CHANGELOG.md