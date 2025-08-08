const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const bugRoutes = require('./routes/bugRoutes')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/bugs', bugRoutes)

app.get('/', (req, res) => {
  res.send('🚀 Bug Dashboard Backend is Running!')
app.get('/api', (req, res) => {
  res.send("🚀 Bug Dashboard API is live!");
});

})

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected")
}).catch(err => {
  console.error("❌ MongoDB failed:", err)
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})

