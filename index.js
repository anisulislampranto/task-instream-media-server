const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const fileUpload = require("express-fileupload");
const { ObjectId } = require("mongodb");

const port = process.env.PORT || 4040;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9uobc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const customersCollection = db.collection("customers");

    // get api for all customers from db
    app.get("/customers", async (req, res) => {
      const cursor = customersCollection.find({});
      const customers = await cursor.toArray();
      // when argument is not a JSON object res.json will ensure it to sent res as json
      res.json(customers);
    });

    // post api to add specific customer data to db
    app.post("/addCustomer", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const age = req.body.age;
      const country = req.body.country;
      const gender = req.body.gender;
      const picture = req.files.profilePic;
      const pictureData = picture.data;
      const encodedImage = pictureData.toString("base64");
      const bufferImage = Buffer.from(encodedImage, "base64");

      const customer = {
        name,
        email,
        age,
        country,
        gender,
        profilePic: bufferImage,
      };

      const result = await customersCollection.insertOne(customer);
      console.log(result);
      // when argument is not a JSON object res.json will ensure it to sent res as json
      res.json(result);
    });

    // dynamic api for indedtifying specific customer and update that customer info
    app.put("/customers/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      // update and insert = upsert || will ensure if matches not found will insert as new
      const options = { upsert: true };
      const updatedName = req.body.name;
      const updatedAge = req.body.age;
      const updatedCountry = req.body.country;
      const updatedGender = req.body.gender;
      const updatedEmail = req.body.email;
      const updatedProfilePic = req.files.profilePic;
      const pictureData = updatedProfilePic.data;
      const encodedImage = pictureData.toString("base64");
      const bufferImage = Buffer.from(encodedImage, "base64");

      const updateCustomerInfo = {
        $set: {
          name: updatedName,
          age: updatedAge,
          country: updatedCountry,
          gender: updatedGender,
          email: updatedEmail,
          profilePic: bufferImage,
        },
      };
      const result = await customersCollection.updateOne(
        // filtering customer by object id
        filter,
        updateCustomerInfo,
        // if dont find any data by filtering will insert as a new
        options
      );
      // when argument is not a JSON object res.json will ensure it to sent res as json object
      res.json(result);
    });
  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
