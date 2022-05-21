const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 4040;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9uobc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

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
