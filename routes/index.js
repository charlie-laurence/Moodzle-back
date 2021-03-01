var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Enregistrement du userName */
router.post('/sign-in', function(req, res, next) {
  var result = false;
  //var token = uid2(32);
  var userName = req.body.username;
  /*enregistrement en bdd + result = true*/
  res.json(result, token);
});

/* Enregistrement de l'humeur/activités */
router.post('/mood', function(req, res, next) {
  var result = false;
  //var token = user.token;
  /*Récupère le score du mood (enregistré dans le store) et les activités + enregistrement en bdd + result = true*/
  res.json(result, token);
});

/* Réaction de Moodz */
router.get('/fun-fact', function(req, res, next) {
  var result = false;
  var moodOfTheDay = /*récupère le score du mood du jour*/
  //var token = user.token;
  /* récupère un fun-fact lié au score du mood + result = true*/
  res.json(result, token, moodOfTheDay);
});

/* History */
router.get('/history', function(req, res, next) {
  var result = false;

var moodsHistory = await userModel.findById('603cc2c9ea48e108447d1e3c')   
.populate('history')  
.exec();

console.log(moodsHistory)

  /* récupère tous les mood/activities + result = true*/
  res.json(result);
});

/* Data */
router.post('/data', function(req, res, next) {
  var result = false;
  /* récupère tous les mood/activities + result = true*/
  res.json(result);
});

module.exports = router;
