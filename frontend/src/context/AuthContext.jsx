import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/client'
import { authService } from '../api/api';
import { profileService } from '../api/api';

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rehydrateUser = async () => {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      const userStatus = localStorage.getItem('user_status');
      
      if (token && userId) {
        const cleanToken = token.replace('Bearer ', '');
        
        const rehydratedUser = {
          id: userId,
          access_token: `Bearer ${cleanToken}`,
          status: userStatus,
          email: localStorage.getItem('user_email'),
          username: localStorage.getItem('username'),
          first_name: localStorage.getItem('first_name'),
          last_name: localStorage.getItem('last_name')
        };

        setUser(rehydratedUser);

        // Fetch fresh profile data from Django backend
        try {
          const profile = await profileService.viewOwnProfile(`Bearer ${cleanToken}`);
          if (profile) {
            localStorage.setItem('profile_id', profile.id);
            setProfile(profile);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }

        return true;
      }
      return false;
    };
  
    rehydrateUser();
    setLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && !user) {
        const userStatus = localStorage.getItem('user_status');
        const newUser = {
          ...session.user,
          status: userStatus || 'V'
        };
        setUser(newUser);

        const { data: profileData } = await supabase
          .from('api_profile')
          .select('*')
          .eq('account_id', newUser.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
    });

    return () => subscription.unsubscribe()
  }, [window.location.pathname])

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

      // Fetch and store profile data immediately after login
    const { data: profileData } = await supabase
    .from('api_profile')
    .select('*')
    .eq('account_id', djangoResponse.user.id)
    .single();

  if (profileData) {
    // Store profile_id in localStorage
    localStorage.setItem('profile_id', profileData.id);
    setProfile(profileData);
  }

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
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_status');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('profile_id');
    
    setUser(null);
    setProfile(null);
  }

  // Provides these values to all child components. Renders the children only when the loading state is false.
  return (
    <AuthContext.Provider value={{ user, profile, signIn, signUp, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}