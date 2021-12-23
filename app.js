const express = require('express')

const app = express()

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = `mongodb+srv://hyperlogic:6408@healthcare.s6oc1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`




var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'a4db.cxoldwqckoj4.ap-northeast-2.rds.amazonaws.com',
  user     : 'a4',
  password : '123456789',
  database : 'a4db'
});
  
connection.connect();



// const bodyParser = require('body-parser')
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var Redis = require('ioredis');
var redisClient = new Redis({port: 6379, host: 'cluster-example.hqrloz.0001.apn2.cache.amazonaws.com'});

app.use(session({
    secret: 'redis-session-test',
    store: new RedisStore({client: redisClient}),
    resave: false,
    saveUninitialized: true
}));

app.get('/session', function (req, res) {
    var session = req.session;
    console.log(session.user);
    if (session.user) {
        res.send('session already saved. user = ' + session.user);
    } else {
        session.user = 'test';
        res.send('session saved');
    }
});


MongoClient.connect(url,(e,client)=>{
  var db = client.db('caseup')
  app.get('/upload',(req,res)=>{

    const post = req.query
    db.collection('posts').insertOne(post)
  })

  app.get('/update',(req,res)=>{
    req.query_id =  new mongodb.ObjectId(req.query._id)
    db.collection('posts').updateOne({ _id : req.query_id},{
      $set:{
        status : req.query.status,
        title : req.query.title,
        decision : req.query.decision,
        context : req.query.context,
        date : req.query.date,
        imgUrl : req.query.imgUrl
      }
    })
    .then(obj=>{
      console.log(obj)
    })
  })

  app.get('/getPosts',(req,res)=>{
    db.collection('posts').find(req.query).toArray((err,docs) =>{
      res.send(docs)
    })
  })

  app.get('/delete',(req,res)=>{
    console.log(req.query)
    db.collection('posts').deleteOne({_id : new mongodb.ObjectId(req.query._id)},(err,docs)=>{
      console.log('삭제완료')
      res.send(true)
    })
  })

  app.get('/signUp',(req,res)=>{
    console.log(req.query)
    db.collection('userInfo').find({userId : req.query.userId}).toArray((err,docs)=>{
      
      if(docs.length>0){
        res.send('이미 사용중인 아이디입니다.')
      }
      else{
        db.collection('userInfo').insertOne(req.query)
        // res.cookie('userId',req.query.userId,{maxAge:3000})
        res.send(true)
      }
    })
  })

  app.get('/commentInsert',(req,res)=>{
    db.collection('comments').insertOne(req.query)
  })

  app.get('/comment',(req,res)=>{
    console.log(req.query)
    db.collection('comments').find({parentId : req.query.parentId}).toArray((err,docs)=>{
      console.log(docs)
      res.send(docs)
    })
  })

  app.get('/signIn',(req,res) => {
    db.collection('userInfo').find(req.query).toArray((err,docs)=>{
      console.log(req.query)
      if(docs.length == 0)
        res.send(false)
      else
        res.send(docs)
    })
  })



})

app.listen(8100)