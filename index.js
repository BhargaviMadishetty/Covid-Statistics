const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080;
const { tallySchema } = require('./schema');

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');
const { data } = require('./data');


app.listen(port, () => console.log(`App listening on port ${port}!`));

app.get("/totalRecovered", async (req, res) => {
    try {
        const data = await connection.find();
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            total += data[i].recovered;
            //console.log(data[i].recovered);
        }
        res.status(200).json({
            data: { _id: "total", recovered: total },
        })
    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
})

app.get("/totalActive", async (req, res) => {
    //Active cases = (infected-recovered)
    try {
        const data = await connection.find();
        let total = 0;
        let infectedCases = 0;
        let recoveredCases = 0;
        for (let i = 0; i < data.length; i++) {
            infectedCases += data[i].infected;
            recoveredCases += data[i].recovered;
        }
        total = infectedCases - recoveredCases;
        res.status(200).json({
            data: { _id: "total", active: total },
        })
    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
})

app.get("/totalDeath", async (req, res) => {
    try {
        const data = await connection.find();
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            total += data[i].death;
        }
        res.status(200).json({
            data: { _id: "total", death: total },
        })
    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
})


app.get("/hotspotStates", async (req, res) => {
    //rate value can be calculated as ((infected - recovered)/infected)
    //rate value is greater than 0.1
    try {
        const data = await connection.find();
        let infectedCases = 0;
        let recoveredCases = 0;
        let rate = 0;
        let states = [];
        for (let i = 0; i < data.length; i++) {
            infectedCases = data[i].infected;
            recoveredCases = data[i].recovered;
            rate = (infectedCases - recoveredCases) / infectedCases;
            if (rate > 0.1) {
                //{data: [{state: "Maharashtra", rate: 0.17854}, {state: "Punjab", rate: 0.15754}]}.
                states.push({ state: data[i].state, rate: rate.toFixed(5) })
            }
        }
        res.status(200).json({
            data: states
        });
    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
})

app.get("/healthyStates", async (req, res) => {
    //whose mortality value is less than 0.005. mortality value can be calculated as (death/infected).
    try {
        const Data = await connection.find();
        let morality = 0;
        let deathCases = 0;
        let infectedCases = 0;
        let states = [];
        for (let i = 0; i < data.length; i++) {
            deathCases = data[i].death;
            infectedCases = data[i].infected;
            morality = deathCases / infectedCases;
            if (morality < 0.005) {
                //{data: [{state: "Maharashtra", mortality: 0.0004}, {state: "Punjab", mortality: 0.0007}]}
                states.push({ state: data[i].state, morality: morality.toFixed(5) });
            }
        }
        res.status(200).json({
            data: states
        });
    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
})


module.exports = app;