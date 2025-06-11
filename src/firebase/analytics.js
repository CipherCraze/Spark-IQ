import { analytics } from './firebaseConfig';
import { logEvent } from 'firebase/analytics';

// Common event names
export const EVENT_NAMES = {
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  CHAT_START: 'chat_start',
  CHAT_MESSAGE: 'chat_message',
  QUESTION_ASKED: 'question_asked',
  QUESTION_ANSWERED: 'question_answered',
  RESOURCE_VIEW: 'resource_view',
  RESOURCE_DOWNLOAD: 'resource_download',
  ERROR: 'error'
};

// Track page views
export const trackPageView = (pageName, pageTitle) => {
  if (!analytics) return;
  
  logEvent(analytics, EVENT_NAMES.PAGE_VIEW, {
    page_name: pageName,
    page_title: pageTitle,
    page_location: window.location.href,
    page_referrer: document.referrer
  });
};

// Track user actions
export const trackUserAction = (actionName, actionParams = {}) => {
  if (!analytics) return;
  
  logEvent(analytics, actionName, actionParams);
};

// Track errors
export const trackError = (errorName, errorDetails = {}) => {
  if (!analytics) return;
  
  logEvent(analytics, EVENT_NAMES.ERROR, {
    error_name: errorName,
    ...errorDetails
  });
};

// Track chat events
export const trackChatEvent = (eventType, chatDetails = {}) => {
  if (!analytics) return;
  
  logEvent(analytics, eventType, {
    timestamp: new Date().toISOString(),
    ...chatDetails
  });
};

// Track question events
export const trackQuestionEvent = (eventType, questionDetails = {}) => {
  if (!analytics) return;
  
  logEvent(analytics, eventType, {
    timestamp: new Date().toISOString(),
    ...questionDetails
  });
};

// Track resource events
export const trackResourceEvent = (eventType, resourceDetails = {}) => {
  if (!analytics) return;
  
  logEvent(analytics, eventType, {
    timestamp: new Date().toISOString(),
    ...resourceDetails
  });
}; 