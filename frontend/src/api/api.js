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

  const headers = {};

  // Only set Content-Type if we're not sending FormData
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
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
    // Only stringify if not FormData
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : null),
    mode: 'cors',
    credentials: 'include',
  };

  try {
    // Log the exact request being made
    console.log('Making request to:', `${BASE_URL}${endpoint}`);
    console.log('With config:', {
      method,
      headers,
      body: body instanceof FormData 
        ? Object.fromEntries(body.entries())
        : body
    });

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Add these lines to see the raw response
    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    // Log response safely
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Only try to parse as JSON if we have content
    return responseText ? JSON.parse(responseText) : null;
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
  setShippingAddress: async (addressData, token, method = 'POST') => {
    try {
      console.log(`Sending address data to backend using ${method}:`, addressData);
      const response = await apiFetch(
        ACCOUNT_ENDPOINTS.SET_SHIPPING_ADDRESS, 
        method,  // Use the method passed in
        addressData, 
        token
      );
      console.log('Backend response:', response);
      return response;
    } catch (error) {
      console.error('Shipping address error details:', error);
      throw error;
    }
  },
  setPaypalDetails: (paypalData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_PAYPAL_DETAILS, 'POST', paypalData, token),
  setCardDetails: (cardData, token) => 
      apiFetch(ACCOUNT_ENDPOINTS.SET_CARD_DETAILS, 'POST', cardData, token),

  getShippingAddress: async (token) => {
    try {
      // First get the profile data
      const { data: profile, error: profileError } = await supabase
        .from('api_account')
        .select(`
          id,
          shipping_address:shipping_address_id (
            street_address,
            address_line_2,
            city,
            state,
            zip,
            country
          )
        `)
        .eq('user_id', localStorage.getItem('user_id'))
        .single();
  
      if (profileError) {
        console.error('Profile error:', profileError);
        return {
          street_address: '',
          address_line_2: '',
          city: '',
          state: '',
          zip: '',
          country: ''
        };
      }
  
      if (!profile?.shipping_address) {
        console.log('No address found for profile');
        return {
          street_address: '',
          address_line_2: '',
          city: '',
          state: '',
          zip: '',
          country: ''
        };
      }
  
      // Transform the data to match the component's expected structure
      return {
        street_address: profile.shipping_address.street_address,
        address_line_2: profile.shipping_address.address_line_2,
        city: profile.shipping_address.city,
        state: profile.shipping_address.state,
        zip: profile.shipping_address.zip,
        country: profile.shipping_address.country
      };
    } catch (error) {
      console.error('Error fetching shipping address:', error);
      return {
        street_address: '',
        address_line_2: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      };
    }
  },

  // viewTransactions: async (token) => {
  //   try {
  //     const response = await apiFetch(ACCOUNT_ENDPOINTS.VIEW_TRANSACTIONS, 'GET', null, token);
  //     return Array.isArray(response) ? response : [];
  //   } catch (error) {
  //     console.error('Error fetching transactions:', error);
  //     return [];
  //   }
  // },
  viewTransactions: async (token) => {
    try {
      // First get the account ID for the current user
      const { data: account, error: accountError } = await supabase
        .from('api_account')
        .select('id')
        .eq('user_id', localStorage.getItem('user_id'))
        .single();
  
      if (accountError) throw accountError;
  
      // Then get transactions with related bid and profile information
      const { data: transactions, error: transactionError } = await supabase
        .from('api_transaction')
        .select(`
          bid_id,
          api_bid!inner (
            bid_price,
            time_of_bid,
            profile_id,
            api_profile:profile_id (
              id,
              display_name
            )
          )
        `)
        .eq('seller_id', account.id)
        .order('estimated_delivery', { ascending: false });
  
      if (transactionError) throw transactionError;
  
      // Transform the data to match the component's expected structure
      return transactions.map(t => ({
        id: t.id,
        amount: t.api_bid.bid_price,
        date: t.api_bid.time_of_bid ? new Date(t.api_bid.time_of_bid).toLocaleDateString() : 'Pending',
        account: t.api_bid.api_profile.display_name,
        profileId: t.api_bid.api_profile.id, // Include this if you want to link to the profile
        status: t.status
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },
  viewBalance: async (id) => {
    try {
      // Get balance from api_account table using user_id
      const { data: account, error: accountError } = await supabase
        .from('api_account')
        .select('balance')
        .eq('user_id', id)
        .single();

      if (accountError) throw accountError;

      return {
        balance: account?.balance || 0
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },
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
  getArithmeticQuestion: (token) => 
    apiFetch(AUTH_ENDPOINTS.APPLY_TO_BE_USER, 'GET', null, token),
  applyToBeUser: (answerData, token) => 
    apiFetch(AUTH_ENDPOINTS.APPLY_TO_BE_USER, 'POST', answerData, token),
  paySuspensionFine: (token) => 
    apiFetch(AUTH_ENDPOINTS.PAY_SUSPENSION_FINE, 'POST', null, token),
};

export const profileService = {
  getProfile: (pk, token) => apiFetch(PROFILE_ENDPOINTS.VIEW(pk), 'GET', null, token),
  editProfile: (profileData, token) => 
    apiFetch(PROFILE_ENDPOINTS.EDIT, 'PATCH', profileData, token),
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
  postItem: async (itemData, token) => {
    try {
      // Get the profile ID from the API first
      const profileResponse = await apiFetch('/api/profiles/me/', 'GET', null, token);
      // Convert the data to match what the backend expects
      const requestData = {
        title: itemData.title,
        description: itemData.description,
        selling_price: parseFloat(itemData.selling_price),
        maximum_bid: parseFloat(itemData.maximum_bid),
        minimum_bid: parseFloat(itemData.minimum_bid),
        deadline: itemData.deadline,
        collection: itemData.collection,
        profile: profileResponse.id,
        image_urls: Array.isArray(itemData.image_urls) ? itemData.image_urls : []
      };
  
      // Log the exact data being sent
      console.log('Sending item data:', JSON.stringify(requestData, null, 2));

      return await apiFetch(ITEM_ENDPOINTS.POST, 'POST', requestData, token);
    } catch (error) {
      console.error('Error in postItem:', error);
      throw error;
    }
  },

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
