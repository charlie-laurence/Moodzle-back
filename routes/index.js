var express = require("express");
var router = express.Router();
var moodModel = require("../models/moods");
var activityModel = require("../models/activities");
var userModel = require("../models/users");
var funfactModel = require("../models/funfacts");
var mongoose = require("mongoose");
var uid2 = require("uid2");
const { route } = require("./users");
const activityList = [
  { category: "sport", name: "Football" },
  { category: "social", name: "Boire un verre" },
  { category: "culture", name: "Cinema" },
  { category: "culture", name: "Piano" },
  { category: "sport", name: "Piscine" },
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

router.post("/sign-up", async function (req, res, next) {
  var result = false;
  var token = null;
  const data = await userModel.findOne({
    username: req.body.usernameFromFront,
    token: req.body.token,
  });
  if (data === null) {
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      token: uid2(32),
    });
    var saveUser = await newUser.save();
    if (saveUser) {
      result = true;
      token = saveUser.token;
    }
  }
  res.json({ result, saveUser, token });
});

// Enregistrement d'un mood (mood score, activité & date)
router.post("/save-mood", async (req, res, next) => {
  try {
    const token = req.body.token;
    const storedMoodId = req.body.storedMoodId;
    console.log(storedMoodId);
    const mood = req.body.mood;
    const activity = req.body.activitySelection;

    let activitiesId = await getAllId(activity);
    console.log(activitiesId);

    //Traitement pour gérer l'existence d'un mood pour le jour ou non :
    //Si aucun mood renseigné pour la journée -> création d'un nouveau mood et ajout à l'utilisateur
    //Si un mood a déjà été renseigné -> update du mood dans le document de l'utilisateur

    if (!storedMoodId) {
      // enregistrement du mood en bdd :
      const newMood = new moodModel({
        date: new Date(),
        mood_score: mood,
        activity: activitiesId,
      });
      const savedMood = await newMood.save();
      console.log(savedMood._id);
      // on récupère l'id du mood créé :
      const moodId = savedMood._id;
      // on update le user en ajoutant l'id du mood/activités :
      const updateUser = await userModel.updateOne(
        { token },
        { $push: { history: moodId } }
      );
      res.json({
        msg: `mood ${moodId} créé avec succès pour l'utilisateur ${token}`,
        moodId,
        updateUser,
      });
    } else {
      const updatingMood = await moodModel.updateOne(
        { _id: storedMoodId },
        { date: new Date(), mood_score: mood, activity: activitiesId }
      );
      res.json({
        msg: `mood ${storedMoodId} mis à jour avec succès pour l'utilisateur ${token}`,
        moodId: storedMoodId,
        updatingMood,
      });
    }
  } catch (err) {
    res.json({ msg: "Erreur lors de la création du mood", err: err.message });
  }
});

// Enregistrement d'une nouvelle activité en base de données
router.post("/add-activity", async (req, res, next) => {
  try {
    const { name, category } = req.body;
    const resultFromDb = await activityModel.findOne({ name, category });
    console.log(resultFromDb);
    if (!resultFromDb) {
      const newActivity = new activityModel({
        name,
        category,
      });
      const savedActivity = await newActivity.save();
      res.json(savedActivity);
    } else {
      res.json({ msg: `${name}-${category} déjà en base de données` });
    }
  } catch (err) {
    res.json(err);
  }
});

// Vérification de l'existence d'un mood enregistré le jour-même (route appelée au niveau du HomeScreen)
router.get("/daily-mood/:token", async (req, res, next) => {
  try {
    const dateNow = new Date();
    const dayNow = dateNow.getDate();
    const monthNow = dateNow.getMonth();
    const yearNow = dateNow.getFullYear();
    const { token } = req.params;
    const user = await userModel
      .findOne({ token })
      .populate({ path: "history", populate: { path: "activity" } })
      .exec();
    //Filtre sur l'historique de l'utilisateur afin de vérifier l'existence d'un mood enregistré ce-jour
    const filteredHistory = user.history.filter(
      (mood) =>
        new Date(
          mood.date.getFullYear(),
          mood.date.getMonth(),
          mood.date.getDate() + 1
        ) >= new Date(yearNow, monthNow, dayNow + 1)
    );
    filteredHistory.length > 0
      ? res.json({
          mood: true,
          mood_data: {
            id: filteredHistory[0]._id,
            score: filteredHistory[0].mood_score,
            activity: filteredHistory[0].activity,
          },
        })
      : res.json({ mood: false, data: null });
  } catch (err) {
    res.json({
      msg: "Erreur lors de la vérification de l'existence d'un mood pour ajd",
      err,
    });
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
      var firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() - 7
      );
      var lastDay = date;
      break;
  }

  console.log(firstDay);
  console.log(lastDay);
  // Populate multiple level et trouver des dates gte (greater than) la date de début souhaité et lge (lower than) date de fin

  var moodsHistory = await userModel
    .findOne({ token: "fT26ZkBbbsVF7BSDl5Z2HsMDbdJqXVC1" })
    .populate({
      path: "history",
      match: { date: { $gte: firstDay, $lte: lastDay } },
      populate: { path: "activity" },
    })
    .exec();
  res.json(moodsHistory);
});

// FONCTIONS HELPER ET ROUTES TEST

//Route test pour récupérer un mood spécifique (vérification du bon enregistrement en base de données)
router.get("/mood/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const mood = await moodModel
      .findById(id)
      .populate({ path: "activity" })
      .exec();
    console.log(mood);
    res.json(mood);
  } catch (err) {
    res.json(err);
  }
});

//Fonction pour récupérer les id des activités en base de données (utilisée dans la route 'save-mood')
async function getAllId(activity) {
  try {
    let idTab = [];
    for (var i = 0; i < activity.length; i++) {
      let activityFromMongo = await activityModel.findOne({
        name: activity[i].name,
        category: activity[i].category,
      });
      let id = activityFromMongo._id;
      idTab.push(id);
    }
    return idTab;
  } catch (err) {
    console.log(err);
    return err;
  }
}

module.exports = router;
