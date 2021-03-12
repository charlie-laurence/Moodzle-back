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

module.exports = {
    testEnvironment: 'node'
  };
  