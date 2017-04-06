'use strict';

//problem:The scraper.js should get the price, title, url and image url from the product page and save this information into a CSV file.
//solution :use node.js to connect to  http://shirts4mike.com 's API to get all information to print out
//Connect to the url API

//for date and time purpose
var moment = require('moment');

//request to make http call
var request = require('request');

//cheerio for the use to traverse DOM
var cheerio = require("cheerio");

// json 2 csv for converting the scraped data into a CSV file.
var json2csv = require('json2csv');

//fs is for creating file and folders
var fs = require('fs');


//website for scrape
var  url = "http://shirts4mike.com/";

//function for handling errors
 
var errorhandling = function (error) {
console.log(error.message);
console.log('The Scraper could not get the ' + url + ' it may be because of server down problem');

//create new date for log file
var logdate = new Date();

//create message as a variable
var errorlog = '[' + logdate + '] ' + error.message + '\n';
//when the error occurs, log that to the error logger file
fs.appendFile('scraper-error.log', errorlog, function (er) {
  if (er) throw er;
  console.log('There was an error,it has been logged to scraper-error.log');
});
};



var allshirts = new Array();
// header for csv
var fields = ['Title', 'Price', 'ImageURL', 'url', 'Time'];
request(url, function (error, response, body) {
  if (!error) {
    // use cheerio to traverse DOM
    var $ = cheerio.load(body);
    // find the path to the page with the shirts on it
   
    var shirtpath = $(".shirts > a").attr("href");
    var shirtsurl = url + shirtpath
      request(shirtsurl, function (error, response, body) {
      if(!error) {
        //use cheerio to traverse DOM
        var $ = cheerio.load(body);
    // total number of shirts on the page
    var finished = $(".products > li > a").length;
    $(".products > li > a").each(function (index) {
      var urlshirt = ("http://shirts4mike.com/"+ $(this).attr("href"));
      //make http request
      request(urlshirt, function (error, response, body) {
        if (!error) {
          //load into cheero to enable DOM traversal
       
          var $ = cheerio.load(body);
          //traverse the DOM to get the necessary info
      
       var title = $('body').find(".shirt-details > h1").text().slice(4); // slice to remove the price form the title
       var price = $('body').find(".price").text();
       var imageurl = $('.shirt-picture').find("img").attr("src");
       // create JSON object for each shirt, formatting the details of the shirt into JSON to allow for conversion to CSV
     
       var shirtObject = {}
       shirtObject.Title = title;
       shirtObject.Price = price;
       shirtObject.ImageURL = imageurl;
       shirtObject.url = urlshirt;
       shirtObject.Time = moment().format('MMMM Do YYYY, h:mm:ss a');
       allshirts.push(shirtObject);
       if (allshirts.length == finished) {
         //get today's date courtesy of moment.js
         var today = moment().format('YYYY[-]MM[-]DD')
          // make a new data folder if one doesn't already exist
          var dir = './data';
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }
		   //turn the shirts JSON file into a shirts CSV file with today's date as a file name.
 
         json2csv({ data: allshirts, fields: fields }, function(err, csv) {
         if (err) console.log(err);
         fs.writeFile( dir + "/" + today + '.csv', csv, function(err) {
           if (err) throw err;
           console.log('file is saved');
         });
       });
       }
       return allshirts;
     }
     else {
       errorhandling(error);
    }});
    });
  }
   else {
     errorhandling(error);
   }
 });
}
  else {
    errorhandling(error);
  }});






































