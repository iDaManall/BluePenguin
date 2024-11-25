export const AUTH_ENDPOINTS = {
    REGISTER: '/api/accounts/register/',
    SIGNIN: '/api/auth/signin/',
    SIGNOUT: '/api/auth/signout/',
  };
  
  export const ACCOUNT_ENDPOINTS = {
    UPDATE_SETTINGS: (pk) => `/api/accounts/${pk}/update-account-settings`,
    SET_SHIPPING_ADDRESS: (pk) => `/api/accounts/${pk}/set-shipping-address`,
    SET_PAYPAL_DETAILS: (pk) => `/api/accounts/${pk}/set-paypal-details`,
    SET_CARD_DETAILS: (pk) => `/api/accounts/${pk}/set-card-details`,
  };
  
  export const PROFILE_ENDPOINTS = {
    VIEW: (pk) => `/api/profiles/${pk}`,
    EDIT: (pk) => `/api/profiles/${pk}/edit-profile`,
    RATE: (pk) => `/api/profiles/${pk}/rate-profile`,
    REPORT: (pk) => `/api/profiles/${pk}/report-user`,
    SAVES: (pk) => `/api/profiles/${pk}/saves`,
    DELETE_SAVED_ITEM: (pk) => `/api/profiles/${pk}/delete-saved-item`,
  };
  
  export const ITEM_ENDPOINTS = {
    POST: '/api/items/post-item/',
    VIEW: (pk) => `/api/items/${pk}/`,
    DELETE: (pk) => `/api/items/${pk}/delete-item/`,
    SEARCH: '/api/items/',
    SAVE: (pk) => `/api/items/${pk}/save_items`,
    COMMENT: (pk) => `/api/items/${pk}/comment`,
    VIEW_COMMENTS: (pk) => `/api/items/${pk}/view_comments`,
    REPLY_COMMENT: (pk) => `/api/items/${pk}/reply`,
    VIEW_REPLIES: (pk) => `/api/items/${pk}/replies`,
    DELETE_COMMENT: (pk) => `/api/items/${pk}/delete-comment`,
    LIKE_COMMENT: (pk) => `/api/items/${pk}/like-comment`,
    DISLIKE_COMMENT: (pk) => `/api/items/${pk}/dislike-comment`,
  };