import { Routes } from '@angular/router';
import { Home } from './home/home';
import { SellerAuth } from './seller-auth/seller-auth';
import { SellerHome } from './seller-home/seller-home';
import { authGuardGuard } from '../services/auth-guard-guard';
import { sellerAuthGuard } from '../services/seller-auth.guard';
import { SellerAddProduct } from './seller-add-product/seller-add-product';
import { SellerUpdateForm } from './seller-update-form/seller-update-form';
import { Search } from './search/search';
import { ProductDetail } from './product-detail/product-detail';
import { UserAuth } from './user-auth/user-auth';
import { CartList } from './cart-list/cart-list';
import { Checkout } from './checkout/checkout';

// ❌ REMOVED: import { MyOrders } from './my-orders/my-orders';
// This import statement loads the MyOrders component immediately when the app starts (EAGER LOADING)
// By removing it, we can use LAZY LOADING instead (see route configuration below)
export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'seller-auth',
        component: SellerAuth,
        canActivate: [sellerAuthGuard]
    },
    {
        path: 'seller-home',
        component: SellerHome,
        canActivate: [authGuardGuard]
    },
    {
        path: 'seller-add-product',
        component: SellerAddProduct,
        canActivate: [authGuardGuard]

    },
    {
        path: 'seller-upadte-form/:id',
        component: SellerUpdateForm,
        canActivate: [authGuardGuard]
    },
    {
        path: 'search/:query',
        component: Search
    },
    {
        path: 'details/:id',
        component: ProductDetail
    },
    {
        path: "userauth",
        component: UserAuth
    }, {
        path: "cart",
        component: CartList
    }, {
        path: "checkout",
        component: Checkout
    },

    // ============================================================================
    // 🚀 LAZY LOADING EXAMPLE - MyOrders Route
    // ============================================================================
    {
        path: "myorders",

        // ✅ LAZY LOADING: Using loadComponent instead of component property
        // This is the key difference between eager and lazy loading!

        loadComponent: () =>
            // Dynamic import() - This is a JavaScript ES6 feature
            // The import() function returns a Promise that resolves when the module is loaded
            // Angular will only execute this import when the user navigates to '/myorders'
            import('./my-orders/my-orders')

                // .then() handles the Promise resolution
                // 'm' is the imported module containing all exports from my-orders.ts
                .then(m => m.MyOrders)
        // We extract and return the MyOrders component class from the module

        // 📊 HOW IT WORKS:
        // 1. App starts → MyOrders component is NOT loaded (saves initial bundle size)
        // 2. User clicks link to '/myorders' → Angular triggers the loadComponent function
        // 3. import() downloads the my-orders.ts file and its dependencies
        // 4. .then() extracts the MyOrders component from the loaded module
        // 5. Angular renders the MyOrders component
        // 6. Subsequent visits to '/myorders' use the cached component (no re-download)

        // 💡 BENEFITS:
        // ✓ Smaller initial bundle size (faster app startup)
        // ✓ Component only loaded when needed (better performance)
        // ✓ Automatic code splitting by Angular CLI
        // ✓ Better user experience for large applications

        // 📝 COMPARISON:
        // EAGER LOADING (old way):
        //   component: MyOrders  ← Component loaded at app startup
        //
        // LAZY LOADING (new way):
        //   loadComponent: () => import('...').then(m => m.MyOrders)  ← Loaded on-demand
    }
];
