export const checkPermissions = {
    // Auth Check
    isAuthenticated: (user) => !!user,  // Checks if user exists from Supabase session
    
    // User Status Checks
    isNotVisitor: (user) => user?.status !== 'VISITOR',
    isNotSuspended: (user) => !user?.is_suspended,
    
    canApplyToBeUser: (user) => (
        !!user && 
        user.status === 'VISITOR' && 
        !user.is_suspended
      ),
      
    // Item Actions
    canBid: (user, item) => (
        !!user && // Must be authenticated
        user.status !== 'VISITOR' && 
        item.seller.id !== user.id && 
        item.availability === 'AVAILABLE' &&
        !user.is_suspended
    ),
    
    // ... rest of your existing checks with auth ...
    canEditItem: (user, item) => (
        !!user &&
        user.id === item.seller.id && 
        !user.is_suspended
    ),

    canDeleteItem: (user, item) => (
        !!user &&
        user.id === item.seller.id && 
        user.status !== 'VISITOR'
    ),

    // Comment Actions
    canComment: (user) => (
        !!user &&
        user.status !== 'VISITOR' && 
        !user.is_suspended
    ),
    
    canDeleteComment: (user, comment) => (
        !!user &&
        user.id === comment.user.id
    ),
    
    canLikeComment: (user, comment) => (
        !!user &&
        user.id !== comment.user.id
    ),

    // Save Actions
    canSaveItem: (user, item) => (
        !!user &&
        user.status !== 'VISITOR' && 
        user.id !== item.seller.id
    ),

    // Transaction Actions
    canMarkAsShipped: (user, transaction) => (
        !!user &&
        user.id === transaction.seller.id && 
        user.status !== 'VISITOR'
    ),
    
    canMarkAsReceived: (user, transaction) => (
        !!user &&
        user.id === transaction.buyer.id && 
        user.status !== 'VISITOR'
    ),

      // Settings/Profile Actions
      canUpdateSettings: (user) => (
        !!user &&
        user.status !== 'VISITOR' && 
        !user.is_suspended
    ),
    
    canSetPaymentDetails: (user) => (
        !!user &&
        user.status !== 'VISITOR' && 
        !user.is_suspended
    )
};