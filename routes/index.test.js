var app = require("../app")
var request = require("supertest")

test('Inscription avec un utilisateur déjà existant', async (done) => {
    await request(app).post('/sign-up')
        .send({email: "test@test.com", password: "abc", username: ""})
        .expect({result: false, token: null})
    done();
})

test("Connexion de l'utilisateur DiegoElPibeDeOro réussie", async (done) => {
    await request(app).post('/sign-in')
        .send({email: "Diego@diego", password: "diego"})
        .expect({
            result: true,
            msg: "login success",
            username: "DiegoElPibeDeOro",
            token: "3N6ERCZNZqIGbsdqhYcSGaRQTgQUalSq"
        })
    done();
})

test("Ajout d'une activité déjà existante", async (done) => {
    await request(app).post('/add-activity')
        .send({name: "Football", category: "sport"})
        .expect({
            msg: "Football-sport déjà en base de données"
        })
    done();
})


// test('Sign-in réussie', async (done) => {
//     await request(app).post('/sign-in')
//         .send({username: 'toto'})
//         .expect(result).toBe(true)
//         .expect(token).toBeDefined()
// })

// test('Ajout de mood réussi', async (done) => {
//     await request(app).post('/save-mood')
//         .send({score: 2})
//         .expect({result: true})
// })

// test("Ajout d'activite en BDD", async (done) => {
//     await request(app).post('/add-activity')
//         .send({score: 3})
//         .expect(result).toBe(true)
//         .expect(moodOfTheDay).toBeDefined()
// })

// test("Chargement des activités depuis la BDD", async (done) => {
//     await request(app).post('/load-activity')
//         .send({score: 3})
//         .expect(result).toBe(true)
//         .expect(moodOfTheDay).toBeDefined()
// })


// test("Vérifier qu'un mood du jour a déjà été ajouté (ou non) en BDD", async (done) => {
//     await request(app).post('/daily-mood/:token')
//         .expect(result).toBe(true)
//         .expect(findResult).toBeDefined()
// })

// test("Génération aléatoire de fun-fact", async (done) => {
//     await request(app).post('/fun-fact')
//         .send({timeframe: "semaine", startDate: new Date()})
//         .expect(result).toBe(true)
//         .expect(findResult).toBeDefined()
// })


// test("Chargement de l'historique de moods à partir du Token", async (done) => {
//     await request(app).post('/dashboard/:token')
//         .send({timeframe: "semaine", startDate: new Date()})
//         .expect(result).toBe(true)
//         .expect(findResult).toBeDefined()
// })

// test("Chargement des données Hebdo/Mois/Annee de l'utilisateur", async (done) => {
//     await request(app).post('/history')
//         .send({timeframe: "semaine", startDate: new Date()})
//         .expect(result).toBe(true)
//         .expect(findResult).toBeDefined()
// })

// test("Changement de mdp", async (done) => {
//     await request(app).post('/modifications')
//         .send({timeframe: "semaine", startDate: new Date()})
//         .expect(result).toBe(true)
//         .expect(findResult).toBeDefined()
// })

module.exports = {
    testEnvironment: 'node'
  };
  