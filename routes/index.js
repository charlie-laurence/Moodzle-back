var express = require("express");
var router = express.Router();
var moodModel = require("../models/moods");
var activityModel = require("../models/activities");
var userModel = require("../models/users");
var funfactModel = require("../models/funfacts");
var mongoose = require("mongoose");
var uid2 = require("uid2");
const activityList = [
  { category: "sport", name: "football" },
  { category: "social", name: "boire un verre" },
  { category: "culture", name: "cinema" },
  { category: "culture", name: "piano" },
  { category: "sport", name: "piscine" },
];

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/load-activities", async function (req, res, next) {
  var activityDataList = await activityModel.find();
  res.json(activityDataList);
});

/* Enregistrement du userName et du token en BDD */

router.post('/sign-up', async function(req, res, next) {
  
  var result = false;
  var token = null;

 const data = await userModel.findOne({
 username: req.body.usernameFromFront,
 token: req.body.token
 });
 
if(data === null){ 
  
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      token: uid2(32),
    });
    // console.log("usernameFromFront : ", req.body.usernameFromFront)

  var saveUser = await newUser.save();

    if(saveUser){
      result = true;
      token = saveUser.token;
    }}
 
  res.json({result, saveUser, token});
  // console.log(token)

});

// /* Enregistrement de l'humeur/activités */
router.post("/save-mood", async (req, res, next) => {
  const { mood, selectActivity } = req.body;
  console.log(mood, selectActivity);
  //var token = user.token;
  /*Récupère le score du mood (enregistré dans le store) et les activités + enregistrement en bdd + result = true*/
  res.json({ msg: "requête bien reçue et exécutée" });
});

// Enregistrement Nouvelle Activité en base de données
router.post("/add-activity", async (req, res, next) => {
  try {
    const { name, category } = req.body;
    const newActivity = new activityModel({
      name,
      category,
    });
    const savedActivity = await newActivity.save();
    res.json(savedActivity);
  } catch (err) {
    res.json(err);
  }
});

// /* Réaction de Moodz */
// router.get('/fun-fact', function(req, res, next) {
//   var result = false;
//   var moodOfTheDay = /*récupère le score du mood du jour*/
//   //var token = user.token;
//   /* récupère un fun-fact lié au score du mood + result = true*/
//   res.json(result, token, moodOfTheDay);
// });

// /* History */
// router.get('/history', function(req, res, next) {
//   var result = false;
//   /* récupère tous les mood/activities + result = true*/
//   res.json(result);
// });

// /* Data */
// router.post('/data', function(req, res, next) {
//   var result = false;
//   /* récupère tous les mood/activities + result = true*/
//   res.json(result);
// });

// Route pour générer des activités
router.get("/generate-activity", async function (req, res, next) {
  for (var i = 0; i < activityList.length; i++) {
    var newActivity = new activityModel({
      _id: new mongoose.Types.ObjectId(),
      name: activityList[i].name,
      category: activityList[i].category,
    });

    var acitivitySave = await newActivity.save();
  }
  res.render("index", { title: "Express" });
});

router.get("/generate-data", async function (req, res, next) {
  var moodListID = [];

  var startDate = new Date("2020-01-01");
  var now = new Date();

  // Générer les historiques avec un score aléatoire (allant de 1 à 5)
  for (var i = startDate; i < now; i.setDate(i.getDate() + 1)) {
    var activityIDList = [];
    var rndActivityCt = Math.floor(Math.random() * Math.floor(2)) + 1;

    for (var j = 0; j < rndActivityCt; j++) {
      var activityName =
        activityList[Math.round(Math.random() * Math.floor(4))].name;
      var activityFind = await activityModel.findOne({ name: activityName });
      activityIDList.push(activityFind._id);
    }

    // Ajout des moods score entre
    var newMood = new moodModel({
      _id: new mongoose.Types.ObjectId(),
      date: new Date(i),
      mood_score: Math.round(Math.random() * Math.floor(4)) + 1,
    });

    newMood.activity = activityIDList;

    moodListID.push(newMood._id);

    var moodSave = await newMood.save();
  }

  var newUser = new userModel({
    username: "test_user",
    token: uid2(32),
    history: moodListID,
  });

  var userSave = await newUser.save();

  res.render("index", { title: "Express" });
});

/* History */
router.post("/history", async function (req, res, next) {
  var result = false;
  var date = new Date(req.body.startdate);
  var filterType = req.body.type;

  switch (filterType) {
    case "month":
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      break;
    case "week":
      var firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() + 1
      );
      var lastDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() + 7
      );
      break;
    case "year":
      var firstDay = new Date(date.getFullYear(), 0, 1);
      var lastDay = new Date(date.getFullYear(), 11, 31);
      break;
    default:
      var firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 7);
      var lastDay = date;
      break;
  }
  
  console.log(firstDay)
  console.log(lastDay)
// Populate multiple level et trouver des dates gte (greater than) la date de début souhaité et lge (lower than) date de fin

  var moodsHistory = await userModel.findOne({token : 'fT26ZkBbbsVF7BSDl5Z2HsMDbdJqXVC1'})   
  .populate({
    path : 'history',
    match : {date : {$gte: firstDay, $lte: lastDay} } ,
    populate : {path : 'activity'}
  }).exec();
  res.json(moodsHistory);
});

module.exports = router;
