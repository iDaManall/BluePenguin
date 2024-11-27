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
  
  // Get token from localStorage if not provided
  const authToken = token || localStorage.getItem('access_token');

  // Debug log for token
  console.log('Token being used:', authToken ? 'Present' : 'Missing');

  if (authToken) {
    // Use token exactly as stored (already includes 'Bearer' prefix)
    headers.Authorization = authToken;
    console.log('Auth header being sent:', {
      headerValue: headers.Authorization.substring(0, 20) + '...',
      endpoint
    });
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: 'include',
      mode: 'cors'  // Add this line
    });

    // Debug unauthorized requests
    if (response.status === 401) {
      console.log('Unauthorized request:', {
        endpoint,
        token: authToken ? 'Present' : 'Missing',
        headers: headers
      });
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error.message.includes('401')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    throw error;
  }
};


export const authService = {
  register: (userData) => apiFetch(AUTH_ENDPOINTS.REGISTER, 'POST', userData),
  signin: (credentials) => apiFetch(AUTH_ENDPOINTS.SIGNIN, 'POST', credentials),
  signout: () => apiFetch(AUTH_ENDPOINTS.SIGNOUT, 'POST'),
};

export const accountService = {
  updateSettings: (settingsData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.UPDATE_SETTINGS, 'PATCH', settingsData, token),
  setShippingAddress: (addressData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_SHIPPING_ADDRESS, 'POST', addressData, token),
  setPaypalDetails: (paypalData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_PAYPAL_DETAILS, 'POST', paypalData, token),
  setCardDetails: (cardData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_CARD_DETAILS, 'POST', cardData, token),
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
