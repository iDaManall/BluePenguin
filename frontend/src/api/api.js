// import axios from "axios";
// import { ACCESS_TOKEN } from "./constants";

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL
// })

// api.interceptors.request.use(
//     // accept config, look inside our local storage and see if we have access token
//     (config) => {
//         const token = localStorage.getItem(ACCESS_TOKEN);
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`
//         }
//         return config
//     },
//     (error) => {
//         return Promise.reject(error)
//     }
// )

import { AUTH_ENDPOINTS, ACCOUNT_ENDPOINTS, PROFILE_ENDPOINTS, ITEM_ENDPOINTS } from './endpoints';


const BASE_URL = import.meta.env.VITE_API_URL; // Replace with your actual base URL

const apiFetch = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const config = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    return response.status !== 204 ? await response.json() : null;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};


export const authService = {
  register: (userData) => apiFetch(AUTH_ENDPOINTS.REGISTER, 'POST', userData),
  signin: (credentials) => apiFetch(AUTH_ENDPOINTS.SIGNIN, 'POST', credentials),
  signout: () => apiFetch(AUTH_ENDPOINTS.SIGNOUT, 'POST'),
};

export const accountService = {
  updateSettings: (pk, settingsData, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.UPDATE_SETTINGS(pk), 'PUT', settingsData, token),
  setShippingAddress: (pk, addressData, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.SET_SHIPPING_ADDRESS(pk), 'POST', addressData, token),
  setPaypalDetails: (pk, paypalData, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.SET_PAYPAL_DETAILS(pk), 'POST', paypalData, token),
  setCardDetails: (pk, cardData, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.SET_CARD_DETAILS(pk), 'POST', cardData, token),
};

export const profileService = {
  getProfile: (pk, token) => apiFetch(PROFILE_ENDPOINTS.VIEW(pk), 'GET', null, token),
  editProfile: (pk, profileData, token) => 
    apiFetch(PROFILE_ENDPOINTS.EDIT(pk), 'PUT', profileData, token),
  rateProfile: (pk, ratingData, token) => 
    apiFetch(PROFILE_ENDPOINTS.RATE(pk), 'POST', ratingData, token),
  reportUser: (pk, reportData, token) => 
    apiFetch(PROFILE_ENDPOINTS.REPORT(pk), 'POST', reportData, token),
  getSavedItems: (pk, token) => 
    apiFetch(PROFILE_ENDPOINTS.SAVES(pk), 'GET', null, token),
  deleteSavedItem: (pk, itemId, token) => 
    apiFetch(PROFILE_ENDPOINTS.DELETE_SAVED_ITEM(pk), 'DELETE', { itemId }, token),
};

export const itemService = {
  postItem: (itemData, token) => 
    apiFetch(ITEM_ENDPOINTS.POST, 'POST', itemData, token),

  getItem: (pk, token) => 
    apiFetch(ITEM_ENDPOINTS.VIEW(pk), 'GET', null, token),
  
  deleteItem: (pk, token) => 
    apiFetch(ITEM_ENDPOINTS.DELETE(pk), 'DELETE', null, token),

  // Browse items by collection
  browseByCollection: (title, token) => 
    apiFetch(`${ITEM_ENDPOINTS.SEARCH}?collection__title=${title}&ordering=total_bids&availability=available`, 'GET', null, token),

  // Browse available items by profile
  browseAvailableByProfile: (profileId, token) => 
    apiFetch(`${ITEM_ENDPOINTS.SEARCH}?profile__account_id=${profileId}&ordering=-date_posted&availability=available`, 'GET', null, token),

  // Browse unavailable items by profile
  browseUnavailableByProfile: (profileId, token) => 
    apiFetch(`${ITEM_ENDPOINTS.SEARCH}?profile__account_id=${profileId}&ordering=-date_posted&availability=sold`, 'GET', null, token),

  // Browse items by collection and bid range
  browseByCollectionAndBidRange: (title, minBid, maxBid, token) => 
    apiFetch(`${ITEM_ENDPOINTS.SEARCH}?collection__title=${title}&ordering=total_bids&availability=available&highest_bid__gt=${minBid}&highest_bid__lt=${maxBid}`, 'GET', null, token),

  // Generic search with multiple filters
  searchItems: (searchParams, token) => {
    const queryString = new URLSearchParams(searchParams).toString();
    return apiFetch(`${ITEM_ENDPOINTS.SEARCH}?${queryString}`, 'GET', null, token);
  },

  saveItem: (pk, token) => 
    apiFetch(ITEM_ENDPOINTS.SAVE(pk), 'POST', null, token),
  
  // Comment-related methods
  postComment: (pk, commentData, token) => 
    apiFetch(ITEM_ENDPOINTS.COMMENT(pk), 'POST', commentData, token),
  viewComments: (pk, token) => 
    apiFetch(ITEM_ENDPOINTS.VIEW_COMMENTS(pk), 'GET', null, token),
  replyToComment: (pk, replyData, token) => 
    apiFetch(ITEM_ENDPOINTS.REPLY_COMMENT(pk), 'POST', replyData, token),
  viewReplies: (pk, token) => 
    apiFetch(ITEM_ENDPOINTS.VIEW_REPLIES(pk), 'GET', null, token),
  deleteComment: (pk, commentId, token) => 
    apiFetch(ITEM_ENDPOINTS.DELETE_COMMENT(pk), 'DELETE', { commentId }, token),
  likeComment: (pk, commentId, token) => 
    apiFetch(ITEM_ENDPOINTS.LIKE_COMMENT(pk), 'POST', { commentId }, token),
  dislikeComment: (pk, commentId, token) => 
    apiFetch(ITEM_ENDPOINTS.DISLIKE_COMMENT(pk), 'POST', { commentId }, token),
};


export default apiFetch; // Export the function to be used elsewhere in the app
