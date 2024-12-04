export const AUTH_ENDPOINTS = {
    REGISTER: '/api/accounts/register/',
    SIGNIN: '/api/auth/signin/',
    SIGNOUT: '/api/auth/signout/',
    REQUEST_QUIT: '/api/accounts/request-quit/',
    APPLY_TO_BE_USER: '/api/accounts/apply-to-be-user/',
    PAY_SUSPENSION_FINE: '/api/accounts/pay-suspension-fine/',
  };
  
  export const ACCOUNT_ENDPOINTS = {
    UPDATE_SETTINGS: `/api/accounts/update-account-settings/`,
    SET_SHIPPING_ADDRESS: `/api/accounts/set-shipping-address/`,
    SET_PAYPAL_DETAILS: `/api/accounts/set-paypal-details/`,
    SET_CARD_DETAILS:  `/api/accounts/update-card-details/`,

    VIEW_TRANSACTIONS: '/api/transactions/seller-transactions/',
    VIEW_BALANCE: '/api/accounts/view-current-balance/',
    ADD_BALANCE: '/api/accounts/add-to-balance/',
    VIEW_POINTS: '/api/accounts/view-current-points/',
    ADD_POINTS: '/api/accounts/add-points-to-balance/',
    ACCEPT_WIN: (pk) => `/api/accounts/${pk}/accept_win/`,
    REJECT_WIN: (pk) => `/api/accounts/${pk}/reject_win/`,
    VIEW_PENDING_BIDS: (pk) => `/api/accounts/${pk}/view-pending-bids/`,
  };
  
  export const PROFILE_ENDPOINTS = {
    VIEW: (pk) => `/api/profiles/${pk}/`,
    VIEW_OWN: '/api/profiles/me/',
    EDIT: `/api/profiles/edit-profile/`,
    RATE: (pk) => `/api/profiles/${pk}/rate-profile/`,
    REPORT: (pk) => `/api/profiles/${pk}/report-user/`,
    SAVES: `/api/profiles/saves/`,
    DELETE_SAVED_ITEM: `/api/profiles/delete-saved-item/`,
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

    PERFORM_BID: (pk) => `/api/items/${pk}/perform-bid/`,
    CHANGE_DEADLINE: (pk) => `/api/items/${pk}/change-deadline/`,
    VIEW_ITEM_BIDS: (pk) => `/api/items/${pk}/view-item-bids/`,
    CHOOSE_WINNER: (pk) => `/api/items/${pk}/choose-winner/`,
  };

  export const TRANSACTION_ENDPOINTS = {
    SELLER_TRANSACTIONS: '/api/transactions/seller-transactions/',
    AWAITING_ARRIVALS: '/api/transactions/view-awaiting-arrivals/',
    NEXT_ACTIONS: '/api/transactions/next-actions/',
    SHIP_ITEM: (pk) => `/api/transactions/${pk}/ship/`,
    MARK_RECEIVED: (pk) => `/api/transactions/${pk}/received-item/`,
  };

  export const EXPLORE_ENDPOINTS = {
    TRENDING_CATEGORIES: '/api/explore/trending-categories/',
    RECENT_BIDS: '/api/explore/recent-bids/',
    POPULAR_ITEMS: '/api/explore/popular/',
    BEST_DEALS: '/api/explore/best-deals/',
    BY_RATING: '/api/explore/by-rating/',
  };