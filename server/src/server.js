import  express  from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import MongoDBConnect from './config/MongoDBConnect.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatsRoutes from './routes/chatsRoutes.js'
dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', userRoutes );
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatsRoutes)



MongoDBConnect()

app.listen(process.env.PORT || 5000, () =>{
    console.log(`server is running on port ${process.env.port}`)
})