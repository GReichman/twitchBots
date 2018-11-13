const tmi = require("tmi.js");
const express = require('express');
const mysql = require('mysql');
const app = express();
var ArrayList = require("arraylist")

const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "DawgsReplacement",
        password: "oauth:0jovy45s32pj3mer4y753aurto9ep5"
    },
    channels: ["shal152","dawgnukem"]
};

const client = new tmi.client(options);
var currChannel="shal152";

// Connect the client to the server..
client.connect();
//botSetup End

//db stuff
var dbConnect = mysql.createConnection({
//properties
host     : 'localhost',
user     : 'root',
password : '1g9s9r5',
database : 'twitchbot'
});

dbConnect.connect(function(error){
    if(!!error){
        
        console.log("Error: "+error.message);
    }//if not working

    else{
        console.log("connected");
    }//else working

});
/*
app.get('/', function(req,resp){
    //about mysql
    dbConnect.query("UPDATE ship_names SET usage = usage+1 WHERE shipName='Tanva'", function(error,rows,fields){
        //callback
        if(!!error){
            console.log("error in query "+error.message);
             throw(error);
        }//if error
        else{

        }//else no error
    });//query

});//get


app.listen(1337);
*/



var numBully=0;
var socksTO = false;
var chatBully=0;
var crewJoined=false;
var shipList = new ArrayList;

dbConnect.query("SELECT * FROM ship_names", function(error,rows,fields){
    //callback
if(!!error){
    throw(error);
        console.log("error in query "+error.message);
}//if error
else{
    //parse with rows/fields
     console.log("successful query");

    for(var i=0; i<rows.length;i++){
        shipList.add(rows[i].shipName);
    }//for each row
}//else working
});//function


//whenever a message is sent in chat
client.on("chat", function (channel, user, message, self) {
    // Don't listen to my own messages..
    if (self) return;

    for(var xt = 0; xt<shipList.length;xt++){
        if(message.toLowerCase().indexOf(shipList.get(xt))>-1){

            dbConnect.query("UPDATE `ship_names` SET `usage` = `usage`+1 WHERE `shipName`='"+shipList.get(xt)+"'", function(error,rows,fields){
                //callback
                if(!!error){
                    console.log("error in query "+error.message);
                     throw(error);
                }//if error
                else{
                    console.log(shipList.get(xt)+" incremented");
                }//else no error
            });//query  

        }//if contains a ship

    }//check list

    console.log(user["display-name"]+" says: "+message);

    if(user["display-name"]==="dawgnukem"&&message==="Hey Robo-Me, how mean is Shal to chat?"){

        if(chatBully===0){
            client.say(currChannel,"Shal hasnt bullied anyone yet. Her mic must be muted Kappa");
        }

        else{
            client.say(currChannel,"Shal has bullied roughly "+chatBully+" of her poor, innocent viewers this session BibleThump");
        }

    }//if bully check


    if(user["display-name"]==="dawgnukem" && message==="Hey Robo-Me, what is shal?"){
        client.say(currChannel,"Shal is a massive nerd");
    }//if me



    if(user["display-name"]==="dawgnukem"&&message.indexOf("Hey Robo-Me, ship Eva and ")> -1){

        var match = message.slice(message.indexOf("and") + 3);
        
        
        var length = match.length;

        var first=match.slice(0,length/2)+"va";
        var last ="ev"+ match.slice(length/2);

        var msg = "Possible names for this pairing are: "+first+" or "+last;
        client.say(currChannel,msg);

    }//if shipping

    if(user["display-name"]==="dawgnukem" && message==="D:"){
        numBully++;

        if(numBully===1){
            client.say(currChannel,"Dawg has been bullied for no reason "+numBully+" time in this session");
        }//if first
        else{
            client.say(currChannel,"Dawg has been bullied for no reason "+numBully+" times in this session");
        }
        
    }//if me


    if(message.indexOf("Thump")> -1 || message.indexOf("Cry")> -1 || message.indexOf("NoNoNo")> -1 || message.indexOf("hiroF")> -1 || message.indexOf("D:")> -1|| message.indexOf("selF")> -1|| message.indexOf(":(")> -1 || message.indexOf("FeelsBad")> -1|| message.indexOf("PepeHands")> -1|| message.indexOf("Booli")> -1){

        chatBully++;
    }//booli counter

    // Do your stuff.

    if(user["display-name"]==="crew_neck" && crewJoined===false){

        client.say(currChannel, "Oh god vrews here... 8)");
        crewJoined=true;
    }//if crew

    if((message.indexOf("dawg")>-1 || message.indexOf("Dawg")> -1)&&user["display-name"]!="dawgnukem"){
        const play = require('audio-play');
        const load = require('audio-loader');


        load('./bap_me_harder(shal).wav').then(play);
        console.log("bapped");

    }//if im mentioned

    if(message==="!waterpump" && user["mod"]===true){

        client.say(currChannel,"Water Pump shalREEE REEEEEEEE");

    }// water pump

    if(user["display-name"]==="dawgnukem" && message==="ey bubu"){
        client.say(currChannel,"hey bu bu let's go get us a pic-a-nic basket 🐻 ");
    }//rhona

    if((user["mod"]||user["display-name"]==="dawgnukem")===true && message==="Yo dawg, what are the current ships"){

        dbConnect.query("SELECT * FROM ship_names", function(error,rows,fields){
            //callback
        if(!!error){
            throw(error);
                console.log("error in query "+error.message);
        }//if error
        else{
            //parse with rows/fields
             console.log("successful query");
            var list = "";
        
            for(var i=0; i<rows.length;i++){
            
                if(list.length==0){
                list+=rows[i].shipName;
                }
                else if(i+1==rows.length){
                    if(rows.length==2){
                    list+=" and "+rows[i].shipName;
                    }
                    else{
                    list+=", and "+rows[i].shipName;
                    }
                }//if last
                else{
                list+=", "+rows[i].shipName;
                }
        
            }//for each name
        console.log(list);

        client.say(currChannel,"Current ships are: "+list);
        }//else no error
        });//query

    }//ship list
//
if(user["mod"]===true && message.indexOf("!ship")> -1 && message.indexOf("as:")> -1){
    //!ship x and y as: z
    var newMes = message.slice(6);
    var split = newMes.indexOf(" and ");
    var split2 = newMes.indexOf(" as: ");

    var first = newMes.slice(0,split);
    var last = newMes.slice(split+5,split2);
    var combo = newMes.slice(split2+5);

    console.log(first+" "+last+" "+combo);

    dbConnect.query("INSERT INTO ship_names VALUES ('"+combo+"', '"+first+"', '"+last+"',0);", function(error,rows,fields){
        //callback
        if(!!error){
            throw(error);
            console.log("error in query "+error.message);
        }//if error
        else{
            //parse with rows/fields
            console.log("successful query");
        
        }//else no error
    });//query

    shipList.add(combo);
    client.say(currChannel,combo+" added!");

}//if new ship

if(message.toLowerCase() === "!shiplist"){

    dbConnect.query("SELECT * FROM ship_names ORDER BY `usage` DESC", function(error,rows,fields){
        //callback
        if(!!error){
            console.log("error in query "+error.message);
             throw(error);
        }//if error
        else{
            var list = "The shippiest ships are: \n"+rows[0].shipName+" with: "+rows[0].usage+", \n"+rows[1].shipName+" with: "+rows[1].usage
            +", \n and "+rows[2].shipName+" with: "+rows[2].usage;
            //console.log(list);
            client.say(currChannel,list);
        }//else no error
    });//query

}//post list

if(message.toLowerCase()==="nanva katiev" && user["display-name"]==="BamseBrom"){
    client.say(currChannel,"Nanva AngelThump")
}//bamse


});//on chat

client.on("subscription", function (channel, username, method, message, userstate) {
    client.say(currChannel, "Thanks for subbing @"+username+" BisexualPride bleedPurple <3 shalHi");
});//sub

client.on("resub", function (channel, username, months, message, userstate, methods) {
    // Do your stuff.
    client.say(currChannel, "Thanks for re-subbing @"+username+" BisexualPride bleedPurple <3 shalHi");
});//resub

client.on("hosted", function (channel, username, viewers, autohost) {
    // Do your stuff.
    console.log("hosted");
    client.say(currChannel, "Thank you @"+username+" for subjecting "+viewers+" of your innocent viewers to our nonsense!");
    client.say(currChannel,"!so "+username);
});//host

client.on("cheer", function (channel, userstate, message) {
    client.say(currChannel,"Thanks for showing us your bitties @"+userstate["display-name"]+" Kreygasm ");
});

/*
COMMANDS:
Yo dawg, what are the current ships
Hey Robo-Me, ship Eva and x
!ship x and y as: z
!shiplist
!waterpump
Hey Robo-Me, what is shal?
Hey Robo-Me, how mean is Shal to chat?
*/

