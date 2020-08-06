//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

mongoose.connect("mongodb+srv://admin-alex:5qmyiUYYx4ZuufwF@cluster0.3g1xz.mongodb.net/travel?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });

const countrySchema = mongoose.Schema({
  name: String,
  info: String,
  citizenship_whitelist: Array,
  citizenship_blacklist: Array,
  citizenship_message: String,
  entry_whitelist: Array,
  entry_blacklist: Array,
  entry_message: String,
  quarantine_whitelist: Array,
  quarantine_blacklist: Array,
  quarantine_message: String,
  required_testing_whitelist: Array,
  required_testing_blacklist: Array,
  required_testing_message: String,
  links: Array,
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
"Burundi", "Ivory Coast", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
"Central African Republic","Chad", "Chile", "China", "Colombia", "Comoros",
"Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Congo DR","Denmark",
"Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador", "Equatorial Guinea",
"Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
"France","Gabon", "Gambia", "Georgia", "Germany", "Ghana",
"Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Vatican",
"Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
"Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
"Kazakhstan","Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
"Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
"Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
"Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
"Mongolia","Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
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

      let citizenship_ok = false;
      let entry_ok = false;
      let quarantine_ok = false;
      let testing_ok = false;

      // Citizenship requirements
      if (!foundItems.citizenship_blacklist && foundItems.citizenship_whitelist) {
        if (foundItems.citizenship_whitelist.includes(passport)) {
          citizenship_ok = true;
        } else if (foundItems.citizenship_whitelist.includes("EU_members") && EU_members.includes(passport)) {
          citizenship_ok = true;
        }

      }
      // Entry requirements
      if (!foundItems.entry_blacklist && !foundItems.entry_whitelist) {
        entry_ok = true;
      } else if (!foundItems.entry_blacklist && foundItems.entry_whitelist) {
        if (foundItems.entry_whitelist.includes(departure)) {
          entry_ok = true;
        } else if (foundItems.entry_whitelist.includes("EU_members") && EU_members.includes(departure)) {
          entry_ok = true;
        } else {
          entry_ok = false;
        }
      }

      console.log(citizenship_ok);
      console.log(entry_ok);

      let travelBan = !citizenship_ok && !entry_ok;

      // Quarantine requirements
      if (!foundItems.quarantine_blacklist && !foundItems.quarantine_whitelist) {
        quarantine_ok = true;
      } else if (!foundItems.quarantine_blacklist && foundItems.quarantine_whitelist) {
        if (foundItems.quarantine_whitelist.includes(departure)) {
          quarantine_ok = true;
        } else if (foundItems.quarantine_whitelist.includes("EU_members") && EU_members.includes(departure)) {
          quarantine_ok = true;
        } else {
          quarantine_ok = false;
        }
      } else if (foundItems.quarantine_blacklist && !foundItems.quarantine_whitelist) {
        if (foundItems.quarantine_blacklist.includes(departure)) {
          quarantine_ok = false;
        } else if (foundItems.quarantine_blacklist.includes("EU_members") && EU_members.includes(departure)) {
          quarantine_ok = false;
        } else {
          quarantine_ok = true;
        }
      }

      // Testing requirements
      if (!foundItems.required_testing_blacklist && !foundItems.required_testing_whitelist) {
        testing_ok = true;
      } else if (!foundItems.required_testing_blacklist && foundItems.required_testing_whitelist) {
        if (foundItems.required_testing_whitelist.includes(departure)) {
          testing_ok = true;
        } else if (foundItems.required_testing_whitelist.includes("EU_members") && EU_members.includes(departure)) {
          testing_ok = true;
        } else {
          testing_ok = false;
        }
      } else if (foundItems.required_testing_blacklist && !foundItems.required_testing_whitelist) {
        if (foundItems.required_testing_blacklist.includes(departure)) {
          testing_ok = false;
        } else if (foundItems.required_testing_blacklist.includes("EU_members") && EU_members.includes(departure)) {
          testing_ok = false;
        } else {
          testing_ok = true;
        }
      }

      let quarantine_info = "";
      if (quarantine_ok) {
        quarantine_info = "You will not need to quarantine on arrival."
      } else {
        quarantine_info = foundItems.quarantine_message;
      }
      let testing_info = "";
      if (testing_ok) {
        testing_info = "You will not need to get tested before departure."
      } else {
        testing_info = foundItems.required_testing_message;
      }

      res.render("page", {
        dest: destination,
        passport: passport,
        departure: departure,
        urls: foundItems.links,
        travelBan: travelBan,
        date: date.getDate(),
        flagURL: foundItems.flagURL,
        information: foundItems.info,
        test_info: testing_info,
        quarantine_info: quarantine_info
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
