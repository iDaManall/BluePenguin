import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/client'
import { authService } from '../api/api';

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      // First authenticate with Django
      const djangoResponse = await authService.signin({email, password});
      
      if (!djangoResponse) {
        throw new Error('Failed to authenticate with backend');
      }
  
      // Then authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      // Store tokens
      localStorage.setItem('access_token', djangoResponse.access_token);
      localStorage.setItem('refresh_token', djangoResponse.refresh_token);

      return {...data, djangoUser: djangoResponse};
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(error.message || 'Invalid login credentials');
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