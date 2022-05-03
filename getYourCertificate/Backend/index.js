require('dotenv').config()
const express = require('express');
const bodyParser=require('body-parser');
const axios=require('axios');
const cors=require('cors');
const app = express();
app.use(cors({
    origin:'*',
    methods:['GET','POST']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send("Hello Looser!!")
})

app.get('/getAllEvents',(req,res) => { 
    
    //Fetches all events from spreadsheet present in PUBLIC folder
    //Location of Spreadsheet - PUBLIC > Automated Certificate Genetrator > Admin Sheet

    axios.get(process.env.spreadSheetLink)
    .then(result=>{
        var eventArr=[];
        var statusArr=[];

        result.data.feed.entry.forEach((entry)=>{
            if(entry.gs$cell.row>1 && entry.gs$cell.col==5){//check for active events
            if(entry.gs$cell.inputValue.toLowerCase()=='active' )
                statusArr.push(1);
            else 
                statusArr.push(0);
            }
            if(entry.gs$cell.row>1 && entry.gs$cell.col==1){//ckecks for all events
            eventArr.push({
                val:entry.gs$cell.inputValue,
                row:entry.gs$cell.row
            })
            }
        })

        var ddArr=[];
        for (let index = 0; index < statusArr.length; index++) { //adds only active events to the ddArr
            if(statusArr[index]==1){
            ddArr.push(eventArr[index])
            }
        }
        res.status(200).send(ddArr);
    })
    .catch(err=>{
        console.log(err)
    })
});

app.post('/checkAuthenticity',(req,res)=>{
    var { name , email , eventID } = req.body;
    var xVal, yVal, imageLink, participantsListLink, participantsListAPI;
    //get all the other values of the event
    axios.get(process.env.spreadSheetLink)
    .then(result=>{
                result.data.feed.entry.forEach(entry=>{
                if(entry.gs$cell.row==eventID){
                if(entry.gs$cell.col==2) xVal=entry.gs$cell.inputValue;
                if(entry.gs$cell.col==3) yVal=entry.gs$cell.inputValue;
                if(entry.gs$cell.col==4) imageLink=entry.gs$cell.inputValue;
                if(entry.gs$cell.col==6) participantsListLink=entry.gs$cell.inputValue;
            }
        })
       participantsListAPI=changeSpreadsheetToAPI(participantsListLink) 
    })
    .then(()=>{
        axios.get(participantsListAPI)
        .then(result=>{
            var row1,row2;
            result.data.feed.entry.forEach(entry=>{
                if(entry.gs$cell.inputValue.toLowerCase()==email.toLowerCase()){
                    row1=entry.gs$cell.row;
                }
                if(entry.gs$cell.inputValue.toLowerCase()==name.toLowerCase()){
                    row2=entry.gs$cell.row;
                }
            })
            if(row1 && row2 && row1==row2){
                res.status(200).send({xVal, yVal, imageLink})
                console.log("Genuine user")
            }
            else{
                res.send({msg:"Information Entered does not match our records. Please contact the Admin"})
                console.log("Information missing")
            }
        })
    })
    .catch(err=>{
        console.log(err)
    })
})

//convert the spreadsheet link to api which is retrieved from the admin spreadsheet
function changeSpreadsheetToAPI(participantsListLink){ 

  // for any help refer this video: https://www.youtube.com/watch?v=pFpytftOYiw&t=2s
  // and doc: https://api-university.com/wp-content/uploads/2020/05/google-sheets-worksheet.txt?utm_source=sendfox&utm_medium=email&utm_campaign=google-sheets-api-worksheet

  var spreadSheetID=participantsListLink.split("/")[5];
  var convertedAPI="https://spreadsheets.google.com/feeds/cells/"+spreadSheetID+"/1/public/full?alt=json";
  return convertedAPI;
}

app.listen( PORT ,()=>{
    console.log("Server listening at port ",PORT)
});