var express=require('express');
var app=express();
var path=require('path');
var MongoClient=require('mongodb').MongoClient;
var bodyParser=require('body-parser');
var expressValidator=require('express-validator');
var server=require('http').createServer(app);
var client=require('socket.io').listen(server);
server.listen(process.env.PORT||7777);


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname,'index.html'));
});


MongoClient.connect('mongodb://admin:admin@ds133348.mlab.com:33348/chat1',function(err,db){
	if (err) {
		console.log('Not able to connect to database');
	}
	else {
		var i=0;
		var col=db.collection('messages');
		client.on('connection',function(socket){
		i++;
		//console.log(i+' Users connected to Server');

		col.find().limit(7).sort({_id:1}).toArray(function(er,res){
			socket.emit('output',res);
			//console.log(res);
		});

		socket.on('input',function(data){
			var name=data.name;
			var message=data.message;
			pattern=/^\s*$/
			if(pattern.test(name)){
				socket.emit('status','Empty Name not allowed');
				console.log('Empty Name not allowed');
			}
			else if(pattern.test(message)){
				socket.emit('status','Empty Message not allowed');
				console.log('Empty Message not allowed');
			}
			else{
				client.emit('output',[data]);
				//console.log([data]);
				var newmsg={
					'name':name,
					'message':message
					}
				col.insert(newmsg,function(error,docs){
					//console.log('Data Inserted');
					socket.emit('status','clear');
				 });
			}
			});
		});
	}
});
