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

import { AUTH_ENDPOINTS, ACCOUNT_ENDPOINTS, PROFILE_ENDPOINTS, ITEM_ENDPOINTS, TRANSACTION_ENDPOINTS, EXPLORE_ENDPOINTS } from './endpoints';


const BASE_URL = import.meta.env.VITE_API_URL; // Replace with your actual base URL
const TOKEN_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const checkTokenExpiration = () => {
  const tokenTimestamp = localStorage.getItem('token_timestamp');
  const currentTime = new Date().getTime();
  
  if (tokenTimestamp && (currentTime - parseInt(tokenTimestamp) > TOKEN_EXPIRY_TIME)) {
    // Token has expired, clear storage
    localStorage.clear();
    return false;
  }
  return true;
};
const apiFetch = async (endpoint, method = "GET", body = null, token = null) => {
  // Check token expiration before making any API call
  if (!checkTokenExpiration()) {
    // Redirect to login or handle expired session
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const headers = {
    "Content-Type": "application/json",
  };
  
  // Get token from localStorage if not provided
  const authToken = token || localStorage.getItem('access_token');

  // // Debug log for token
  // console.log('Token being used:', authToken ? 'Present' : 'Missing');

  if (authToken) {
    // Remove any existing 'Bearer ' prefix before adding it
    const cleanToken = authToken.replace('Bearer ', '');
    // headers.Authorization = `Bearer ${cleanToken}`;
    // Use a custom header instead
    headers['X-Auth-Token'] = `Bearer ${cleanToken}`;
  }
  
  // Log headers safely
  console.log('Sending request with headers:', headers);

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    mode: 'cors',
    credentials: 'include',
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    // Log response safely
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
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
  updateSettings: (settingsData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.UPDATE_SETTINGS, 'PATCH', settingsData, token),
  setShippingAddress: (addressData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_SHIPPING_ADDRESS, 'POST', addressData, token),
  setPaypalDetails: (paypalData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_PAYPAL_DETAILS, 'POST', paypalData, token),
  setCardDetails: (cardData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_CARD_DETAILS, 'POST', cardData, token),
  viewBalance: (token) => 
    apiFetch(ACCOUNT_ENDPOINTS.VIEW_BALANCE, 'GET', null, token),
  addBalance: (amount, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.ADD_BALANCE, 'POST', { amount }, token),
  viewPoints: (token) => 
    apiFetch(ACCOUNT_ENDPOINTS.VIEW_POINTS, 'GET', null, token),
  addPoints: (points, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.ADD_POINTS, 'POST', { points }, token),
  acceptWin: (pk, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.ACCEPT_WIN(pk), 'POST', null, token),
  rejectWin: (pk, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.REJECT_WIN(pk), 'POST', null, token),
  viewPendingBids: (pk, token) => 
    apiFetch(ACCOUNT_ENDPOINTS.VIEW_PENDING_BIDS(pk), 'GET', null, token),
  requestQuit: (token) => 
    apiFetch(AUTH_ENDPOINTS.REQUEST_QUIT, 'POST', null, token),
  applyToBeUser: (token) => 
    apiFetch(AUTH_ENDPOINTS.APPLY_TO_BE_USER, 'POST', null, token),
  paySuspensionFine: (token) => 
    apiFetch(AUTH_ENDPOINTS.PAY_SUSPENSION_FINE, 'POST', null, token),
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
  viewOwnProfile: (token) => 
    apiFetch(PROFILE_ENDPOINTS.VIEW_OWN, 'GET', null, token),
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
    apiFetch(`${ITEM_ENDPOINTS.SEARCH}?profile__id=${profileId}&ordering=-date_posted&availability=available`, 'GET', null, token),

  // Browse unavailable items by profile
  browseUnavailableByProfile: (profileId, token) => 
    apiFetch(`${ITEM_ENDPOINTS.SEARCH}?profile__id=${profileId}&ordering=-date_posted&availability=sold`, 'GET', null, token),

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

  performBid: (pk, bidData, token) => 
    apiFetch(ITEM_ENDPOINTS.PERFORM_BID(pk), 'POST', bidData, token),
  changeDeadline: (pk, deadlineData, token) => 
    apiFetch(ITEM_ENDPOINTS.CHANGE_DEADLINE(pk), 'PATCH', deadlineData, token),
  viewItemBids: (pk, token) => 
    apiFetch(ITEM_ENDPOINTS.VIEW_ITEM_BIDS(pk), 'GET', null, token),
  chooseWinner: (pk, winnerData, token) => 
    apiFetch(ITEM_ENDPOINTS.CHOOSE_WINNER(pk), 'POST', winnerData, token),
};

export const transactionService = {
  getSellerTransactions: (token) => 
    apiFetch(TRANSACTION_ENDPOINTS.SELLER_TRANSACTIONS, 'GET', null, token),
  getAwaitingArrivals: (token) => 
    apiFetch(TRANSACTION_ENDPOINTS.AWAITING_ARRIVALS, 'GET', null, token),
  getNextActions: (token) => 
    apiFetch(TRANSACTION_ENDPOINTS.NEXT_ACTIONS, 'GET', null, token),
  shipItem: (pk, token) => 
    apiFetch(TRANSACTION_ENDPOINTS.SHIP_ITEM(pk), 'POST', null, token),
  markReceived: (pk, token) => 
    apiFetch(TRANSACTION_ENDPOINTS.MARK_RECEIVED(pk), 'POST', null, token),
};

export const exploreService = {
  getTrendingCategories: (token) => 
    apiFetch(EXPLORE_ENDPOINTS.TRENDING_CATEGORIES, 'GET', null, token),
  getRecentBids: (token) => 
    apiFetch(EXPLORE_ENDPOINTS.RECENT_BIDS, 'GET', null, token),
  getPopularItems: (token) => 
    apiFetch(EXPLORE_ENDPOINTS.POPULAR_ITEMS, 'GET', null, token),
  getBestDeals: (token) => 
    apiFetch(EXPLORE_ENDPOINTS.BEST_DEALS, 'GET', null, token),
  getByRating: (token) => 
    apiFetch(EXPLORE_ENDPOINTS.BY_RATING, 'GET', null, token),
};

export default apiFetch; // Export the function to be used elsewhere in the app
