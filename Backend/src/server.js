import app from './app.js';
import dotenv from 'dotenv';
import connectDb from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

connectDb();

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
    });
