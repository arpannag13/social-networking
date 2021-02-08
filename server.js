const express = require("express");
const connectDB = require("./config/db");

const app = express();

//connect database
connectDB();

//Init Middleware
app.use(express.json({
    extended: false
}));

app.get('/', function(req, res){
    res.send("API Running");
});

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = 5000;

app.listen(PORT, function(){
    console.log(`Server started on port ${PORT}`);
})