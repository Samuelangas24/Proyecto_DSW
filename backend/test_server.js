const express = require('express');
const app = express();
app.use(express.json());
app.use((req,res,next)=>{console.log('TEST SERVER RECEIVED', req.method, req.path); next();});
app.post('/auth/login', (req,res)=>{console.log('TEST login body', req.body); res.json({ok:true});});
app.listen(4000, ()=>console.log('Test server listening 4000'));
