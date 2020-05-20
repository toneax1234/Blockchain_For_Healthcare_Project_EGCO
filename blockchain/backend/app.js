const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

var network = require('./pateint2')

app.use(cors({origin: true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))

const patient =[
    {
      "id": "P001",
      "name": "TA",
      "age" : "21",
    },
    {
      "id": "P002",
      "name": "MUCH",
      "age" : "21",
    },
    {
       "id": "P003",
       "name": "AKE",
       "age" : "40",
    }
]



app.get('/patient', (req, res) => {
  res.json(patient)
})

/*app.post('/patient', (req, res) => {
    patient.push(req.body)
    //console.log(req.body)
    res.status(201).json(req.body)
})*/


app.post('/patient', (req, res) => { 
  console.log(req.body);
    network.createCar(req.body.id, req.body.name, req.body.age, req.body.weight)
      .then((response) => {
        res.send(response)
    })  
})
  
app.listen(3000, () => {
  console.log('Start server at port 3000.')
})