require ('dotenv').config();
//import expressjs
const express = require('express');
//initialise the server
const app = express();
//Server initial communication
app.get ('/',((req,res)=>{ 
    res.send("Welcome to the Netisens LMS Backend server!, The server is live.");
    })
        );
//Port Configuration
const port =  process.env.port || 5000;
app.listen (port,(()=>{
    console.log(`The port is running and listening on port ${port}`);

    })  

        );