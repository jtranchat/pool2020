const mysql = require('mysql');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv')
const app = express();
const bodyparser = require('body-parser');

dotenv.config({ path: './.env'});

app.use(bodyparser.json());

const frontDirectory = path.join(__dirname, '../front');
app.use(express.static(frontDirectory));

const mysqlConnection = mysql.createConnection({
    host: process.env.DATABASE_HOST ,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});

//fonction permettant de lire la base de données
//recuperer les information d'une annonce specifique
app.get("/information/:id", (req, res, next) => {
        mysqlConnection.query('SELECT Annonce.idAnnonce, Annonce.nom, Annonce.description, Annonce.salaires,Annonce.Contrat, Entreprise.nomEntreprise AS nomEntreprise \
        FROM Annonce INNER JOIN Entreprise ON Annonce.idEntreprise = Entreprise.idEntreprise WHERE idAnnonce =' 
        + req.params.id, function(err, rows, fields) {
            if (err) throw err;
            res.status(200).json(rows);
    });
});

//récuperer idPersonne par le mail
app.get("/personne/:mail", (req, res, next) => {
    mysqlConnection.query("SELECT idPersonne FROM Personne WHERE mail=?", [req.params.mail], function(err, rows, fields) {
        if (err) throw err;
        res.status(200).json(rows);
    })
})

//récupérer idPersonne par identifiant et motDePasse
app.get("/page_login/personne/:identifiant/:motDePasse", (req, res) => {
    mysqlConnection.query("SELECT idPersonne FROM Personne WHERE identifiant= ? AND motDePasse= ?\
    ", [req.params.identifiant, req.params.motDePasse], function(err, rows, fields) {
        if (err) throw err;
        res.status(200).json(rows);
    })
})

//récupérer les annonces 
app.get("/annonce", (req, res, next) => {
    mysqlConnection.query('SELECT Annonce.idAnnonce, Annonce.description, Entreprise.nomEntreprise AS nomEntreprise FROM Annonce INNER JOIN Entreprise ON \
    Annonce.idEntreprise = Entreprise.idEntreprise' , function(err, rows, fields) {
        if (err) throw err;
        res.status(200).json(rows);
    })
})

//fonction permettant d'écrire dans la base de données
app.post('/addPersonne', function(req, res) {
    let data = req.body;
    mysqlConnection.query('INSERT INTO Personne SET ?', data, function(err, rows, fields) {
        console.log(res.end(JSON.stringify(rows)));
        res.end(JSON.stringify(rows));
    });
});

//fonction permettant de delete une personne
app.delete('/deletePersonne/:id', function(req, res) {
    mysqlConnection.query('DELETE FROM Personne WHERE idPersonne=?', [req.params.id], function(err, rows, fields) {
        if (err) throw err;
        res.end(JSON.stringify(rows));
    });
});

//fonction permmettant de mettre à jour les données d'une personne
app.put('/updatePersonne/:mail', function(req, res) {
    data = req.body;
    mysqlConnection.query('UPDATE Personne SET nom = ?, prenom= ?, sexe= ?, telephone= ?, identifiant= ?, motDePasse= ?, status= ? WHERE\
     mail= ?', [data.nom, data.prenom, data.sexe, data.telephone, data.identifiant, data.motDePasse, data.status, req.params.mail], function(err, rows, fields) {
        if (err) throw err;
        res.end(JSON.stringify(rows));
     })
})

//fonction permettant d'ajouter une candidature
app.post('/candidature', function(req, res) {
    let data = req.body;
    mysqlConnection.query("INSERT INTO Candidature SET idAnnonce= ?, \
    idPersonne= ?, contenuMail= ?", [data.idAnnonce, data.idPersonne, data.message], function(err, rows, fiels) {
        if (err) throw err;
        res.end(JSON.stringify(rows));
    })
});

module.exports = app;