//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

mongoose.connect("mongodb+srv://admin-alex:5qmyiUYYx4ZuufwF@cluster0.3g1xz.mongodb.net/travel?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });

const countrySchema = mongoose.Schema({
  name: String,
  links: Array,
  citizens_accepted: Boolean,
  info: String,
  no_restrictions: Array,
  covid_test_to_board: Array,
  covid_test_to_board_info: String,
  covid_test_on_arrival: Array,
  covid_test_on_arrival_info: String,
  exceptions: String,
  quarantine_info: String,
  flagURL: String
})

const Country = mongoose.model("Country", countrySchema);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.set('view engine', 'ejs');

let EU_members = ["Austria","Italy", "Belgium", "Latvia", "Bulgaria", "Lithuania",
"Croatia","Luxembourg", "Cyprus", "Malta", "Czechia", "Netherlands",
"Denmark","Poland","Estonia","Portugal","Finland","Romania","France","Slovakia",
"Germany","Slovenia","Greece","Spain","Hungary","Sweden","Ireland"];

// From https://www.worldometers.info/geography/alphabetical-list-of-countries/

let world_countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
"Argentina","Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
"Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
"Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
"Central African Republic","Chad", "Chile", "China", "Colombia", "Comoros",
"Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czechia (Czech Republic)","Democratic Republic of the Congo","Denmark",
"Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador", "England", "Equatorial Guinea",
"Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland",
"France","Gabon", "Gambia", "Georgia", "Germany", "Ghana",
"Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Holy See",
"Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
"Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
"Kazakhstan","Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
"Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
"Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
"Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
"Mongolia","Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia",
"Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea",
"North Macedonia","Norway","Oman","Pakistan","Palau","Palestine State","Panama",
"Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
"Qatar","Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
"Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles",
"Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
"South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
"Sweden","Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand",
"Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
"Uganda","Ukraine","United Arab Emirates","United Kingdom","USA","Uruguay","Uzbekistan",
"Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

app.get("/", function(req, res){
  res.render("home", {world_countries: world_countries, date: date.getDate()});
})

app.get("/about", function(req, res){
  res.render("about");
})

app.get("/contact", function(req, res){
  res.render("contact");
})

app.get("/:passport/:destination/:departure", function(req, res){

  let passport = req.params.passport;
  let destination = req.params.destination;
  let departure = req.params.departure;

  Country.findOne({name: destination}, function(err, foundItems){
    if (err || !foundItems) {
      res.redirect("/");
    } else {
      let test_info_bool = false;
      let test_info = "";
      let travelBan = !foundItems.no_restrictions.includes(departure);
      if (foundItems.citizens_accepted && passport === destination) {
        travelBan = false;
      }
      if (destination == departure) {
        travelBan = false;
      }
      if (foundItems.covid_test_on_arrival.includes(departure)) {
        test_info_bool = true;
        test_info = foundItems.covid_test_on_arrival_info;
      }
      if (foundItems.covid_test_to_board.includes(departure)) {
        test_info_bool = true;
        test_info = foundItems.covid_test_to_board_info;
      }
      if (test_info === "") {
        test_info = "You do not need a COVID-19 test to enter " + destination + "."
      }
      res.render("page", {
        dest: destination,
        passport: passport,
        departure: departure,
        urls: foundItems.links,
        travelBan: travelBan,
        information: foundItems.info,
        test_info_bool: test_info_bool,
        test_info: test_info,
        exceptions: foundItems.exceptions,
        date: date.getDate(),
        quarantine_info: foundItems.quarantine_info,
        flagURL: foundItems.flagURL
      });
      }
  })


})

app.post("/", function(req, res){

  let passport = req.body.passport;
  let destination = req.body.destination;
  let departure = req.body.departure;

  res.redirect("/"+passport+"/"+destination+"/"+departure);
})

app.listen(3000, function(){
  console.log("Server running on port 3000");
})
