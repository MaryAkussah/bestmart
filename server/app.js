import express from 'express'
import cors from 'cors'
import profileRouter from './routes/profile.js'
import productsRouter from './routes/products.js'
import cartRouter from './routes/cart.js'
import checkoutRouter from './routes/checkout.js'
import ordersRouter from './routes/orders.js'
import sellerRouter from './routes/seller.js'
import conversationsRouter from './routes/conversations.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/profile', profileRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/conversations', conversationsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
