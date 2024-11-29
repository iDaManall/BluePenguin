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
import { supabase } from '../utils/client';

const BASE_URL = import.meta.env.VITE_API_URL; // Replace with your actual base URL

const apiFetch = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: 'include',
      mode: 'cors'  // Add this line
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
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

  getItem: async (id) => {
    try {
      const { data, error } = await supabase
        .from('api_item')
        .select(`
          *,
          api_profile:profile_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

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
  searchItems: async (searchParams) => {
    try {
      let query = supabase
        .from('api_item')
        .select(`
          id,
          title,
          image_urls,
          description,
          selling_price,
          highest_bid,
          deadline,
          date_posted,
          total_bids,
          availability,
          collection_id
        `);

      // Add filters based on the searchParams
      if (searchParams.availability) {
        query = query.eq('availability', 'A');
      }

      if (searchParams.collection__title) {
        // First get the collection ID from the collection title
        const { data: collectionData } = await supabase
          .from('api_collection')
          .select('id')
          .eq('title', searchParams.collection__title)
          .single();

        if (collectionData) {
          query = query.eq('collection_id', collectionData.id);
        }
      }

      if (searchParams.ordering) {
        const orderField = searchParams.ordering.startsWith('-') 
          ? searchParams.ordering.substring(1)
          : searchParams.ordering;
        const orderDirection = searchParams.ordering.startsWith('-') ? 'desc' : 'asc';
        query = query.order(orderField, { ascending: orderDirection === 'asc' });
      }

      if (searchParams.limit) {
        query = query.limit(searchParams.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return { results: data };
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
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

  placeBid: async (itemId, bidData) => {
    try {
      const { data, error } = await supabase
        .from('api_bid')
        .insert([{
          item_id: itemId,
          bid_price: bidData.bid_price,
          // Add other necessary bid data
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  }
};

export default apiFetch; // Export the function to be used elsewhere in the app
