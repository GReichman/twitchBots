/*
TODO

*/


const tmi = require("tmi.js");
const express = require('express');
const mysql = require('mysql');
const moment = require('moment');
const timeFormat = 'YYYY-MM-DD hh:mm:ss';
const ArrayList = require("arraylist");
const dbManager = require("./dbManager.js");

const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "dawgsreplacement",
        password: "oauth:0jovy45s32pj3mer4y753aurto9ep5"
    },
    channels: ["shal152","dawgnukem"]
};

const client = new tmi.client(options);
var currChannel="dawgnukem";
const authToken="0jovy45s32pj3mer4y753aurto9ep5";
const clientID = "5viqs42p5sk6vhcqa3lyk5nfdbjbfs";
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


/*
dbConnect.connect(function(error){
    if(!!error){
        
        console.log("Error: "+error.message);
    }//if not working

    else{
        console.log("connected");
    }//else working

});




dbConnect.query("INSERT INTO viewers VALUES ('"+user['display-name']+"','"+messageTime+"', 0,0,"+user['user-id']+") ON DUPLICATE KEY UPDATE pointsCurr = pointsCurr+1, pointsTotal = pointsTotal+1;", function(error,rows,fields){
        //callback
        if(!!error){
            console.log("error in query "+error.message);
            throw(error);
            
        }//if error
        else{
            //parse with rows/fields
            console.log("new user successfully added");
        
        }//else no error
    });//query

*/

var tst =moment(Date.now());
console.log(tst.format(timeFormat));
console.log(moment.isMoment(tst));
var numBully=0;
var chatBully=0;

var crewJoined=false;


init();


function withinTwenty(timeStamp){
    var currTime = moment(Date.now());
    var timelimit = moment(tst).subtract(20,"minutes");


    console.log(moment(timeStamp).isBetween(timelimit,currTime));
    return moment(timeStamp).isBetween(timelimit,currTime);
    
}//check if last message was within 20 min ago


function eventTimer(rep){
//every 20 min, start an event
    setTimeout(() => {
       
        eventTimer(++rep);
        
    }, 1.2e+6);
    
}//eventTimer


function pointGainTimer(rep){
    /*
        *every 5 min, add a point to every viewer in DB
        *if new viewer, create entry for them in DB
    */

    setTimeout(() => {
        dbManager.addPoints();
        
        console.log("points updated");
       pointGainTimer(++rep);
        
    }, 300000);
    //300000
    
}//pointGainTimer

async function displayUserPoints(usr){

    let msg = await dbManager.getPoints(usr);
    client.say(currChannel,msg);

}//display users points



//https://api.twitch.tv/helix/users/follows?from_id=40219009&to_id=175071133'


async function init(){

dbManager.setChannel(currChannel);
chatBully += await dbManager.chatBully();
numBully += await dbManager.meBully();

//add points to current viewers at startup
dbManager.addPoints();

//start timers
eventTimer(0);
pointGainTimer(0);

}//startUp


//whenever a message is sent in chat
client.on("chat", function (channel, user, message, self) {
    // Don't listen to my own messages..
    if (self) return;


    //current timestamp
    var messageTime = moment(Date.now()).format(timeFormat);
    
    console.log("Sent at: "+messageTime);
    
    //if message is from viewer that isnt in DB, create new entry for the viewer
    dbManager.timeStampUpdate(user['display-name'],user['user-id'],messageTime);
    
    if(message === "!points"){
        displayUserPoints(user['display-name']);
    }//checking users points

    if(message === "!oneOfYouMods" && user['display-name']==="dawgnukem"){
        client.say(currChannel,"@draiodoir get to it");
    }

    if(message==="!booli"){

        if(chatBully===0){
            client.say(currChannel,"Shal hasnt bullied anyone yet. Her mic must be muted Kappa");
        }

        else{
           client.say(currChannel,"Shal has bullied roughly "+chatBully+" of her poor, innocent viewers BibleThump");
        }

    }//if bully check

    if(message=="!leaderboard"){
        var msg = dbManager.leaderBoard();
        client.say(currChannel,msg);

    }//checking leaderboards

    //me shipping eva
    if(user["display-name"]==="dawgnukem"&&message.indexOf("Hey Robo-Me, ship Eva and ")> -1){

        var match = message.slice(message.indexOf("and") + 3);
        
        
        var length = match.length;

        var first=match.slice(0,length/2)+"va";
        var last ="ev"+ match.slice(length/2);

        var msg = "Possible names for this pairing are: "+first+" or "+last;
        client.say(currChannel,msg);

    }//if shipping

    //me being bullied
    if(user["display-name"]==="dawgnukem" && message==="D:"){
        numBully++;
        dbManager.updateMeBully();
        console.log(typeof numBully);
        if(numBully===1){
            client.say(currChannel,"Dawg has been bullied for no reason "+numBully+" time");
        }//if first
        else{
            client.say(currChannel,"Dawg has been bullied for no reason "+numBully+" times");
        }
        
    }//if me being bullied


    if(message.indexOf("Thump")> -1 || message.indexOf("Cry")> -1 || message.indexOf("NoNoNo")> -1 || message.indexOf("hiroF")> -1 || message.indexOf("D:")> -1|| message.indexOf("selF")> -1|| message.indexOf(":(")> -1 || message.indexOf("FeelsBad")> -1|| message.indexOf("PepeHands")> -1|| message.indexOf("Booli")> -1){
        chatBully++;

       dbManager.updateChatBully();
       console.log(chatBully);
    }//booli counter

    if(message === "!draiodork" && user['display-name']=="dawgnukem"){
        client.say(currChannel,"amateur moderator and massive nerd PixelBob");
    }

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

//

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

client.on("timeout",function(channel,username,reason,duration){
    console.log(username+" was timed out");
if(username == "dawgsreplacement"){
    client.whisper("draiodoir","bully...");
    console.log("message sent");
}
});//if bot is timed out

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
