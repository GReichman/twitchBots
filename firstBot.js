/*
TODO
    update timestamp on chat
*/


const tmi = require("tmi.js");
const express = require('express');
const mysql = require('mysql');
const app = express();
const moment = require('moment');
const timeFormat = 'YYYY-MM-DD hh:mm:ss';
const ArrayList = require("arraylist");
const request = require("request");

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
var socksTO = false;
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
        addPointsToViewers();
        console.log("points updated");
       pointGainTimer(++rep);
        
    }, 300000);
    //300000
    
}//pointGainTimer


async function addPointsToViewers(){
    /*
        *get list of viewers
        *if viewer isnt in DB, create entry
        *if viewer exists, add a point
    */
    var viewList = new ArrayList();
    viewList = await getViewerList();
        //after compiling viewer list, either add them to DB or add a point to them if they already exist
        for(let i=0; i<viewList.length;i++){

            dbConnect.query("SELECT * FROM viewers WHERE `displayName`='"+viewList[i]+"';",function(error,rows,fields){
               // console.log("testing truth check");
             if(error){
                    console.log("oopsies "+error);
             }//if error

             else{    
                if(rows.length==0){
                   // console.log("newViewer");
                addViewerToDB(viewList.get(i));
               // console.log(viewList.get(i)+" added to DB");
                }//if not in DB

                else{

                    dbConnect.query("UPDATE viewers SET `pointsCurr` = `pointsCurr`+1, `pointsTotal`=`pointsTotal`+1 WHERE `displayName`='"+viewList.get(i)+"';");
                    console.log(viewList.get(i)+"'s points incremented");
                }//if in DB
             }//else no error
            });//check if viewer is/isnt in list

        }//for list viewers


}//addPointsToViewers

function getViewerID(name){
    /*
        *get viewer ID using their display name
        *return ID
    */
   return new Promise(function(resolve,reject){
    const opts = {
        url:'https://api.twitch.tv/helix/users?login='+name,
        method: 'GET',
        json:true,
        headers: {
            'Client-ID': clientID,
             'Accept': 'application/vnd.twitchtv.v5+json'}
    }
    request(opts, function(error,response,body){
        
        
        if(!error && response.statusCode===200){
            if(body.data.length==0){
                resolve(-1);
            }
            else{
            resolve(body.data[0].id);
            }
        }
    
        else{
            console.log("oops ",error);
        }
    });
   });


}//getViewerID

async function addViewerToDB(name){
    /*
        *add viewer from list to DB
        *get viewers id from getViewerID function
    */

    var thisID = await getViewerID(name);
    console.log("This ID is: "+thisID);
    var nullTime = "00-00-0000 00:00:00";

    dbConnect.query("INSERT INTO viewers VALUES ('"+name+"','"+nullTime+"', 0,0,"+thisID+");", function(error,rows,fields){
        //callback
        if(!!error){
            console.log("error in query "+error.message);
            throw(error);
            
        }//if error
        else{
            //parse with rows/fields
            console.log(name+" successfully added");
        
        }//else no error
    });//query


}//addViewerToDB

function requestViewerList(){
return new Promise(function(resolve,reject){

    request({   
        url:'https://tmi.twitch.tv/group/user/'+currChannel+'/chatters',
        json:true
     }, function(error,response,body){
         
            if(!error && response.statusCode===200){
               // console.log(body);
               resolve(body);
           
        }//if no error

        else{
            console.log("cant get chat list: "+error);
        }//if error
        
    });//JSON request viewer list 

});

}//requestViewerList

async function getUserPoints(usr){

    return new Promise(function(resolve,reject){

        dbConnect.query("SELECT * FROM viewers ORDER BY pointsCurr DESC;",function(error,rows,fields){
            let found = false;
            let pos = 0;
            let points=0;
            while(!found){
                if(rows[pos].displayName.toLowerCase()== usr.toLowerCase()){
                    found=true;
                    points=rows[pos].pointsCurr;
                }//if correct user
                pos++;
            }//while user hasnt been found
            
            let msg = "@"+usr+" you have "+points+" points. Your rank is: "+pos;
           resolve(msg);
        });//get sorted list
    


    });
}//get users points

async function displayUserPoints(usr){

    let msg = await getUserPoints(usr);
    client.say(currChannel,msg);

}//display users points

async function getViewerList(){
    /*
        *get list of viewers from twitch api
        *fill viewList from json response
        *return viewList
    */
    var viewList = new ArrayList;

    var body;
    body = await requestViewerList();

    return new Promise(function(resolve,reject){

    
     //go through each section of json response and add any viewers to viewList
     console.log("adding viewers to array list");

     for(let i=0; i<body.chatters.vips.length;i++){
        viewList.add(body.chatters.vips[i]);
     }
                
     for( let i=0; i<body.chatters.moderators.length;i++){
        viewList.add(body.chatters.moderators[i]);
     }
    
     for(let i=0; i<body.chatters.staff.length;i++){
        viewList.add(body.chatters.staff[i]);
     }
    
     for(let i=0; i<body.chatters.admins.length;i++){
        viewList.add(body.chatters.admins[i]);
     }
    
     for(let i=0; i<body.chatters.global_mods.length;i++){
        viewList.add(body.chatters.global_mods[i]);
     }
    
     for(let i=0; i<body.chatters.viewers.length;i++){    
        viewList.add(body.chatters.viewers[i]);
     }

    resolve(viewList);
    });

}//getViewerList

//https://api.twitch.tv/helix/users/follows?from_id=40219009&to_id=175071133'


function init(){

    //load value of numBully
dbConnect.query("SELECT * FROM misc_table WHERE main = main;", function(error,rows,fields){
    chatBully = rows[0].numBully;
    console.log("starting with ", chatBully, " instances of bullying");
});//numBully query

dbConnect.query("SELECT * FROM misc_table WHERE main = main;", function(error,rows,fields){
    numBully = rows[0].meBully;
    console.log("starting with ", numBully, " instances of bullying");
});//numBully query

//add points to current viewers at startup
addPointsToViewers();

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

    //var dbq=dbConnect.query("SELECT 1 FROM viewers WHERE EXISTS(SELECT 1 FROM viewers WHERE displayName ='"+user['display-name']+"');");
    
    //if message is from viewer that isnt in DB, create new entry for the viewer
    dbConnect.query("SELECT * FROM viewers WHERE `displayName`='"+user['display-name']+"';",function(error,rows,fields){
 
        if(rows.length==0){
            console.log("adding new viewer");
            dbConnect.query("INSERT INTO viewers VALUES ('"+user['display-name']+"','"+messageTime+"', 0,0,"+user['user-id']+");", function(error,rows,fields){
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
        
        }//if user isnt already in database
    
        else{
            dbConnect.query("UPDATE viewers SET `lastMessage` ='"+messageTime +"' WHERE (`displayName` = '"+user['display-name']+"');",function(error,rows,fields){
                
                console.log(user['display-name']," timestamp updated to",messageTime);
                });

        }//else update timestamp

    });//check if chatter is in DB
 
    if(message === "!points"){
        //displayUserPoints(user['display-name']);
        displayUserPoints("icepick94");
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
        dbConnect.query("SELECT * FROM viewers ORDER BY pointsCurr DESC;",function(error,rows,fields){
            
            let msg = "The Top 3 are: 1. "+rows[0].displayName+"("+rows[0].pointsCurr+"), 2. "+rows[1].displayName+"("+rows[1].pointsCurr+"), 3."+rows[2].displayName+"("+rows[2].pointsCurr+")";
            client.say(currChannel,msg);
        });//get sorted list

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

        dbConnect.query("UPDATE misc_table SET meBully = meBully + 1 WHERE main = main;",function(error,rows,fields){
 
            console.log(numBully);
            });//update meBully

        if(numBully===1){
            client.say(currChannel,"Dawg has been bullied for no reason "+numBully+" time in this session");
        }//if first
        else{
            client.say(currChannel,"Dawg has been bullied for no reason "+numBully+" times in this session");
        }
        
    }//if me being bullied


    if(message.indexOf("Thump")> -1 || message.indexOf("Cry")> -1 || message.indexOf("NoNoNo")> -1 || message.indexOf("hiroF")> -1 || message.indexOf("D:")> -1|| message.indexOf("selF")> -1|| message.indexOf(":(")> -1 || message.indexOf("FeelsBad")> -1|| message.indexOf("PepeHands")> -1|| message.indexOf("Booli")> -1){
    chatBully++;

        dbConnect.query("UPDATE misc_table SET numBully = numBully + 1 WHERE main = main;",function(error,rows,fields){
 
    console.log(chatBully);
    });//update bully table

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
