import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}

export default App
