var express = require('express');
var router = express.Router();
var moodModel = require('../models/moods')
var activityModel = require('../models/activities')
var userModel = require('../models/users')
var funfactModel = require('../models/funfacts');
var mongoose = require('mongoose');
var uid2 = require('uid2')
const activityList = [{category: 'sport', name: 'football'}, {category: 'social', name: 'boire un verre'}, {category: 'culture', name: 'cinema'}, {category: 'culture', name: 'piano'}, {category: 'sport', name: 'piscine'}]



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Enregistrement du userName */

router.post('/sign-up', async function(req, res, next) {
  
  var result = false;

  // var token = null;

  // const data = await userModel.findOne({
  //   username: req.body.usernameFromFront
  // });

  var newUser = new userModel({
      username: req.body.usernameFromFront,
    });

  var saveUser = await newUser.save();

    if(saveUser){
      result = true;
    }
  
  /*enregistrement en bdd + result = true*/
  res.json(result, saveUser);
  console.log('result :', result, 'saveUser :', saveUser)

});

// /* Enregistrement de l'humeur/activités */
// router.post('/mood', function(req, res, next) {
//   var result = false;
//   //var token = user.token;
//   /*Récupère le score du mood (enregistré dans le store) et les activités + enregistrement en bdd + result = true*/
//   res.json(result, token);
// });

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
router.get('/generate-activity', async function(req, res, next) {

  for (var i = 0; i < activityList.length; i++) {
    
    var newActivity = new activityModel({
      _id: new mongoose.Types.ObjectId(),
      name: activityList[i].name,
      category: activityList[i].category
    })

    var acitivitySave = await newActivity.save()
  }
  res.render('index', { title: 'Express' });
})

router.get('/generate-data', async function(req, res, next) {
  var moodListID = []

  var startDate = new Date('2020-01-01')
  var now = new Date()

  // Générer les historiques avec un score aléatoire (allant de 1 à 5)
  for (var i = startDate; i < now; i.setDate(i.getDate() + 1)) {

    var activityIDList = []
    var rndActivityCt = Math.floor(Math.random() * Math.floor(2)) + 1

    for (var j = 0; j < rndActivityCt; j++) {
      var activityName = activityList[Math.round(Math.random() * Math.floor(4))].name
      var activityFind = await activityModel.findOne({name: activityName})
      activityIDList.push(activityFind._id)
    }


    // Ajout des moods score entre 
    var newMood = new moodModel ({
      _id: new mongoose.Types.ObjectId(),
      date: new Date(i),
      mood_score: (Math.round(Math.random() * Math.floor(4))+1),
     });
    
     newMood.activity = activityIDList
    
    moodListID.push(newMood._id)

    var moodSave = await newMood.save()
  }

  var newUser = new userModel({
    username: 'test_user',
    token: uid2(32),
    history: moodListID
  })

  var userSave = await newUser.save()

   res.render('index', { title: 'Express' });
})

/* History */
router.post('/history', async function(req, res, next) {
  var result = false;
  var searchDate = new Date('2020-02-27'); // sera remplacé par req.body.dateDebut
  var dadate = new Date('2020-03-01') // sera remplacé par req.body.dateFin

// Populate multiple level et trouver des dates gte (greater than) la date de début souhaité et lge (lower than) date de fin
  var moodsHistory = await userModel.findOne({token : 'fT26ZkBbbsVF7BSDl5Z2HsMDbdJqXVC1'})   
  .populate({
  path : 'history',
  match : {date : {$gte: searchDate, $lte: dadate} } ,
    populate : {path : 'activity'}
  })  
  .exec();

// console.log('history',moodsHistory.history)
// console.log('activity',moodsHistory.history[0].activity)

// var firstDayMonth = new Date(date. getFullYear(), date. getMonth(), 1);
// var lastDayMonth = new Date(date. getFullYear(), date. getMonth() + 1, 0)

  /* récupère tous les mood/activities + result = true*/
  res.json(moodsHistory);
});


module.exports = router;
