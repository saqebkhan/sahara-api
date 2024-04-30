const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
mongoose.set("strictQuery", false);
const dotenv = require("dotenv");

const cors = require("cors");
app.use(bodyParser.json());

dotenv.config("./.env");


const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
const port = process.env.PORT;

const uri =
  "mongodb+srv://saqebk619:eGLSYh9EjwvJV8pV@cluster12.jdw95pj.mongodb.net/usersApp?retryWrites=true&w=majority";
// const uri = 'mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority';

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB Atlas", err);
  });

const mySchema = new mongoose.Schema({
  id: Number,
  name: String,
  fatherName: String,
  email: String,
  permanentAddress: String,
  contactNumber: String,
  parentsContactNumber: String,
  emergencyContactNumber: String,
  saharaHostelNumber: String,
  placeOfWorkOrStudy: String,
  dateOfJoining: Date,
  aadharNumber: String,
  expectedDateOfLeaving: Date,
  amountDeposited: String,
  monthlyRentPayment: String,
  roomNumber: String,
  bedNumber: String,
  permanentAddressPincode: String,
  bikeRegistrationNumber: String,
  sharingRoom: String,
  isApprovedTNC: Boolean,
  payHistory: [
    {
      paidDays: Number,
      payMonth: String,
      payAmount: Number,
      paymentMode: String,
      paidTo: String,
      paidYear: String,
    },
  ],
});

const MyModel = mongoose.model("inmates", mySchema);

app.get("/allInmates", (req, res) => {
  MyModel.find({}, (err, data) => {
    if (err) {
      res.status(500).send(err);
      console.log(err, "err");
    } else {
      console.log(data, "data");
      res.send(data);
    }
  });
});

app.post("/inmates", (req, res) => {
  let count = 0;
  app.get("/allInmates", (rq, rqs) => {
    MyModel.find({}, (er, data) => {
      if (er) {
        res.status(500).send(err);
        console.log(er, "err");
      } else {
        count = data.length + 1;
      }
    });
  });
  const newItem = new MyModel(req.body);

  newItem.save((err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({ id: count, ...newItem });
    }
  });
});

app.put("/inmates/:id", (req, res) => {
  MyModel.findByIdAndUpdate(req.params.id, req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

app.delete("/inmates/:id", (req, res) => {
  MyModel.findByIdAndRemove(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({ message: "Item deleted" });
    }
  });
});

app.listen(port, () => {
  console.log("listening at ", port);
});
