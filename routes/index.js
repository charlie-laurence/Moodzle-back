var express = require("express");
var router = express.Router();
var moodModel = require("../models/moods");
var activityModel = require("../models/activities");
var userModel = require("../models/users");
var funfactModel = require("../models/funfacts");
var mongoose = require("mongoose");
var uid2 = require("uid2");
var bcrypt = require("bcrypt");

const cost = 10;

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

//////// HOME SCREEN ////////

// Sign-up
router.post("/sign-up", async function (req, res, next) {
  var result = false;
  var token = null;

  const hash = bcrypt.hashSync(req.body.password, cost);

  const data = await userModel.findOne({
    username: req.body.username,
    email: req.body.email,
  });
  if (data === null) {
    var newUser = new userModel({
      username: req.body.username,
      token: uid2(32),
      email: req.body.email,
      password: hash,
    });
    var saveUser = await newUser.save();
    if (saveUser) {
      result = true;
      token = saveUser.token;
    }
  }
  res.json({ result, saveUser, token });
});

// Sign-In
router.post("/sign-in", async function (req, res, next) {
  var result = false;
  var token = null;

  try {
    const data = await userModel.findOne({
      email: req.body.email,
    });
    console.log(data);
    const passwordCheck = bcrypt.compareSync(req.body.password, data.password);

    if (passwordCheck) {
      res.json({
        result: true,
        msg: "login success",
        username: data.username,
        token: data.token,
      });
    } else {
      res.json({ result: false, msg: "erreur login", err: "password pas bon" });
    }
  } catch (err) {
    res.json({ result: false, msg: "erreur login", err: err.message });
  }
});

// Route pour récupérer le pseudo de l'utilisateur à l'ouverture de l'application (quand local storage contient le token)
router.get("/retrieve-user-info/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await userModel.findOne({ token });
    res.json(user.username);
  } catch (err) {
    res.json(err);
  }
});

//////// MOOD SCREEN ////////

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

// Récupération des activités enregistrées en base de données (pour peupler la recherche dans la ActivityBar)
router.get("/load-activities", async function (req, res, next) {
  var activityDataList = await activityModel.find();
  res.json(activityDataList);
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

// Réaction de Moodz
router.post("/fun-fact", async function (req, res, next) {
  // Récupération, en BDD, d'un tableau de FunFacts correspondant au score du mood récupéré depuis le front
  const dataFunFact = await funfactModel.find({ mood_score: req.body.mood });

  // Traitement pour choisir un FunFact en aléatoire dans le tableau précédent
  var thisFunFact = [Math.floor(Math.random() * dataFunFact.length)];

  // Récupération du texte du FunFact en question
  var funFact = dataFunFact[thisFunFact].text;

  // Envoi du FunFact vers le Front
  res.json(funFact);
});

// Dashboard : récupère tout l'historique de l'utilisateur
router.get("/dashboard/:token", async function (req, res, next) {
  try {
    const { token } = req.params;
    var userHistory = await userModel
      .findOne({ token })
      .populate({
        path: "history",
        populate: { path: "activity" },
      })
      .exec();
    res.json(userHistory);
  } catch (err) {
    res.json(err);
  }
});

//////// CHARTS SCREEN ////////

router.post("/history", async function (req, res, next) {
  var result = false;
  var date = new Date(req.body.startdate);
  var filterType = req.body.type;

  const { token } = req.body;

  switch (filterType) {
    case "month":
      var firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
        1
      ).toISOString();
      var lastDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        1,
        1
      ).toISOString();
      break;
    case "week":
      var firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() + 1,
        1
      ).toISOString();
      var lastDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() + 7,
        1
      ).toISOString();
      break;
    case "year":
      var firstDay = new Date(date.getFullYear(), 0, 1, 1).toISOString();
      var lastDay = new Date(date.getFullYear(), 11, 31, 1).toISOString();
      break;
    default:
      var firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() - 7,
        1
      ).toISOString();
      var lastDay = date.toLocaleDateString(undefined);
      break;
  }

  var moodsHistory = await userModel
    .findOne({ token: req.body.token })
    .populate({
      path: "history",
      match: { date: { $gte: firstDay, $lte: lastDay } },
      populate: { path: "activity" },
    })
    .exec();
  res.json(moodsHistory);
});

//////// SETTINGS SCREEN ////////

router.put("/modifications", async (req, res) => {
  try {
    var usernameModified = req.body.username;
    var user = await userModel.findOne({ token: req.body.token });
    console.log("check");
    // Récupération des values de l'input pour modifier le mdp
    var actualPasswordFromFront = req.body.actualPassword;
    var newPassword = req.body.newPassword;
    var confirmedPassword = req.body.confirmedPassword;
    var newPasswordCrypted = bcrypt.hashSync(newPassword, cost);
    //compare mot de passe envoyé et mot de passe de bdd
    const passwordCheck = bcrypt.compareSync(
      actualPasswordFromFront,
      user.password
    );

    // Mise à jour de la base de données (username ou password)
    if (user.username != usernameModified) {
      await userModel.updateOne(
        { token: req.body.token },
        { username: usernameModified }
      );
    } else if (passwordCheck && newPassword == confirmedPassword) {
      await userModel.updateOne(
        { token: req.body.token },
        { password: newPasswordCrypted }
      );

      console.log("user", user.password);
      console.log("pseudo", newPasswordCrypted);
    }

    res.json({ usernameModified, userPassword: user.password });
  } catch (err) {
    console.log("check");

    res.json(err);
  }
});

////////////////// FONCTIONS HELPER ET ROUTES TEST

// Route test pour récupérer un mood spécifique (vérification du bon enregistrement en base de données)
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

// Route test pour les mots de passes (comparaison des hash)
router.get("/testpassword", async function (req, res, next) {
  const hash = bcrypt.hashSync("abc", cost);

  await userModel.findByIdAndUpdate(
    { _id: "603cc2c9ea48e108447d1e3c" },
    { email: "test@test.com" }
  );
  res.json({ result: true });
});

// Fonction pour récupérer les id des activités en base de données (utilisée dans la route 'save-mood')
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

//////////////////  PROCEDURE INITIALE POUR REMPLIR LA BASE DE DONNEES AVEC UTILISATEUR TEST

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

// Route pour générer les données
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

module.exports = router;