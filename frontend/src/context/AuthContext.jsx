import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/client'
import { authService } from '../api/api';

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rehydrateUser = () => {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      const userStatus = localStorage.getItem('user_status');
      
      if (token && userId) {
        // Remove 'Bearer ' prefix if it exists
        const cleanToken = token.replace('Bearer ', '');
        
        // Rehydrate the user object from localStorage with proper structure
        const rehydratedUser = {
          id: userId,
          access_token: `Bearer ${cleanToken}`,
          status: userStatus // Make sure this matches exactly what your backend returns ('U' or 'V')
        };

        console.log('Rehydrating user:', rehydratedUser); // Debug log
        setUser(rehydratedUser);
        return true; // indicate successful rehydration
      }
      return false;
    };
  
    // First try to rehydrate from localStorage
    const wasRehydrated = rehydrateUser();

    // Only check Supabase session if rehydration failed
    if (!wasRehydrated) {
      // If rehydration failed, check Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // If we have a Supabase session, try to get status from localStorage
          const userStatus = localStorage.getItem('user_status');
          setUser({
            ...session.user,
            status: userStatus || 'V' // Default to visitor if no status found
          });
        } else {
          setUser(null);
        }
      });
    }

    setLoading(false); // Move this here to ensure user is set before loading ends

    // Listen for changes on auth state (keep this part)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !user) {
        const userStatus = localStorage.getItem('user_status');
        setUser({
          ...session.user,
          status: userStatus || 'V'
        });
      }
    });

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      // First authenticate with Django
      const djangoResponse = await authService.signin({email, password});
      
      if (!djangoResponse) {
        throw new Error('Failed to authenticate with backend');
      }
  
      // Store tokens first
      // Store the complete token with Bearer prefix
      const tokenWithBearer = `Bearer ${djangoResponse.access_token}`;
      localStorage.setItem('access_token', tokenWithBearer);
      localStorage.setItem('token_timestamp', new Date().getTime().toString());
      localStorage.setItem('refresh_token', djangoResponse.refresh_token);
      localStorage.setItem('user_id', djangoResponse.user.id);
      localStorage.setItem('user_status', djangoResponse.user.status); // Make sure this is 'U' or 'V'

      // Debug log
      console.log('Setting user state:', {
        ...djangoResponse.user,
        access_token: tokenWithBearer,
        status: djangoResponse.user.status
      });

      setUser({
        ...djangoResponse.user,
        access_token: tokenWithBearer,
        status: djangoResponse.user.status // Ensure this is included
      });

      return djangoResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // const signIn = async (email, password) => {
  //   try {
  //     const response = await axios.post(AUTH_ENDPOINTS.SIGNIN, { email, password });
  //     const { access_token, refresh_token } = response.data;

  //     // Store tokens in local storage
  //     localStorage.setItem('access_token', access_token);
  //     localStorage.setItem('refresh_token', refresh_token);

  //     // Fetch user data from Supabase
  //     const { data, error } = await supabase.auth.getUser(access_token);
  //     if (error) throw error;

  //     setUser(data.user);
  //     return data;
  //   } catch (error) {
  //     throw new Error('Invalid login credentials');
  //   }
  // };

  const signUp = async (email, password, username, firstName, lastName) => {
    try {
      // First register with django
      const djangoResponse = await authService.register({
        email,
        password,
        username,
        first_name: firstName,
        last_name: lastName
      });
  
      if (!djangoResponse) {
        throw new Error('Failed to register with backend');
      }
  
      // Then create Supabase account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) throw error;
      return {...data, djangoUser: djangoResponse};
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error;
    // Clear all relevant localStorage items
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_status');
    localStorage.removeItem('token_timestamp');
    setUser(null);
  }

  // Provides these values to all child components. Renders the children only when the loading state is false.
  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}