
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.Port || 5000;


const app = express();

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xg2xq3m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{

        const appointmentOptionCollection = client.db('doctorPortal').collection('appointmentOptions');
        const bookingsCollection = client.db('doctorPortal').collection('bookings');
        
        app.get('/appointmentOptions', async(req, res) =>{
            const date= req.query.date;
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();
            const bookingQuery = {appointmentDate: date }
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();
            
            options.forEach(option =>{
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookedSlots = optionBooked.map(book => book.slot);
                console.log(date, option.name,bookedSlots);
            })
            res.send(options);
        });

        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);

        })

    }
    finally{

    }
}

run().catch(console.log())

app.get('/',async (req,res) => {
    res.send('Doctors portal server is running');
})

app.listen(port, () => console.log(`Doctor Portal is running on ${port}`))