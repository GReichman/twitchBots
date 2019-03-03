const mysql = require('mysql');
const ArrayList = require("arraylist");
const request = require("request");


//db stuff
var dbConnect = mysql.createConnection({
    //properties
    host     : 'localhost',
    user     : 'root',
    password : '1g9s9r5',
    database : 'twitchbot'
    });

    var currChannel;

exports.setChannel = function(channel){
    currChannel = channel;
}

exports.chatBully = async function(){
    var numBully=0;
    numBully = await getChatBully();
    return numBully;

}//chatBully

async function getChatBully(){
    var numBully=0;
    return new Promise(function(resolve,reject){

        dbConnect.query("SELECT * FROM misc_table WHERE main = main;", function(error,rows,fields){
       
            console.log("starting with ", rows[0].numBully, " instances of bullying");
            numBully=rows[0].numBully;
            console.log(typeof numBully);
            resolve( numBully);
        });//numBully query
        

    });
}//getChatBully

exports.meBully = async function(){
    var numBully=0;
    numBully = await getMeBully();
    return numBully;
}//meBully

async function getMeBully(){
    var numBully=0;
    return new Promise(function(resolve,reject){

        dbConnect.query("SELECT * FROM misc_table WHERE main = main;", function(error,rows,fields){
       
            console.log("starting with ", rows[0].meBully, " instances of bullying");
            numBully=rows[0].meBully;
            
            resolve( numBully);
        });//numBully query
        

    });

}//getMeBully

exports.updateMeBully = function(){
    
    dbConnect.query("UPDATE misc_table SET meBully = meBully + 1 WHERE main = main;",function(error,rows,fields){
 
        
        });//update meBully
}

exports.updateChatBully = function(){

    dbConnect.query("UPDATE misc_table SET numBully = numBully + 1 WHERE main = main;",function(error,rows,fields){
 
       
        });//update bully table

}


exports.addPoints = async function(){
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

}//add points to viewers

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
            }//if no results (fringe case)

            else{
                resolve(body.data[0].id);
            }

        }//if no error
    
        else{
            console.log("oops ",error);
        }
    });
   });

}//getViewerID

async function getViewerList(){
    /*
    *get list of viewers from twitch api
    *fill viewList from json response
    *return viewList
    */
    var viewList = new ArrayList;
        
    var body= await requestViewerList();
        
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

exports.getPoints = async function(usr){

    return new Promise(function(resolve,reject){

        dbConnect.query("SELECT * FROM viewers ORDER BY pointsCurr DESC;",function(error,rows,fields){
            let found = false;
            let pos = 0;
            let points=0;
            let msg="";
            while(!found && pos<rows.length){
                if(rows[pos].displayName.toLowerCase()== usr.toLowerCase()){
                    found=true;
                    points=rows[pos].pointsCurr;
                }//if correct user
                pos++;
            }//while user hasnt been found
           
            if(found==true){
             msg = "@"+usr+" you have "+points+" points. Your rank is: "+pos;
            }//if exists
           
            else{
                msg="Couldn't find user in database."
            }
           resolve(msg);
        });//get sorted list
    
    });//promise

}//getPoints

exports.timeStampUpdate = function(usr,usrID,timeStamp){

    dbConnect.query("SELECT * FROM viewers WHERE `displayName`='"+usr+"';",function(error,rows,fields){
 
        if(rows.length==0){
            console.log("adding new viewer");
            dbConnect.query("INSERT INTO viewers VALUES ('"+usr+"','"+timeStamp+"', 0,0,"+usrID+");", function(error,rows,fields){
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
            dbConnect.query("UPDATE viewers SET `lastMessage` ='"+timeStamp +"' WHERE (`displayName` = '"+usr+"');",function(error,rows,fields){
                
                console.log(usr," timestamp updated to",timeStamp);
                });

        }//else update timestamp

    });//check if chatter is in DB

}//update on chat

exports.leaderBoard = function(){

    dbConnect.query("SELECT * FROM viewers ORDER BY pointsCurr DESC;",function(error,rows,fields){
            
        let msg = "The Top 3 are: 1. "+rows[0].displayName+"("+rows[0].pointsCurr+"), 2. "+rows[1].displayName+"("+rows[1].pointsCurr+"), 3."+rows[2].displayName+"("+rows[2].pointsCurr+")";
        return msg;
    });//get sorted list

}//leaderboard