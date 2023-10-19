const { parentPort, workerData } = require("worker_threads");
var convert = require("xml-js");
const Modifiers = require("../models/mongoose/Modifiers");
var https = require("follow-redirects").https;
const mongoose = require("mongoose");

var result = "";
var resultJson = "";

// req body data
const IP = workerData.value.IP;
const PORT = workerData.value.PORT;
const username = workerData.value.username;
const password = workerData.value.password;
const objID = workerData.value.objID;

// console.log(" workerData Modifiers ==> ", workerData.value);

const MongoConnect = async () => {
  mongoose.set("strictQuery", false);
  await mongoose
    .connect(
      "mongodb+srv://qrMenuOrders:qrMenuOrders2023@qrmenuorders.pkn07fr.mongodb.net/test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("MongoDB Connected Modifiers..."))
    .catch((err) => console.log(err));
};
MongoConnect();

// token
const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");

// https agent
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// request options
var options = {
  method: "POST",
  hostname: IP,
  port: PORT,
  agent,
  path: "/rk7api/v0/xmlinterface.xml",
  headers: {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/xml",
  },
  maxRedirects: 0,
};

// get menu items request / -> r-keeper /
var requestGetModifiers = https.request(options, function (response) {
  var chunks = [];

  response.on("data", function (chunk) {
    chunks.push(chunk);
  });

  response.on("end", function (chunk) {
    var body = Buffer.concat(chunks);

    const requestBody = body.toString();
    result = convert.xml2json(requestBody, {
      compact: true,
      spaces: 2,
      ignoreDeclaration: true,
      attributesKey: false,
    });

    resultJson = JSON.parse(result);
    var results = [];
    results = resultJson.RK7QueryResult.CommandResult.RK7Reference.Items.Item;
    // console.log("results Modifiers ==> ", results);
    results.map(function (rkdata) {
      Modifiers.findOne({ id: rkdata._attributes.Ident })
        .then((doc) => {
          if (doc === null) {
            Modifiers.insertMany({
              objID: objID,
              id: rkdata._attributes.Ident,
              max_one_dish: rkdata._attributes.MaxOneDish,
              use_limited_qnt: rkdata._attributes.UseLimitedQnt,
              modi_group_id: rkdata._attributes.MainParentIdent,
              menu_item_id: rkdata._attributes.Dish,
              name: rkdata._attributes.Name,
              code: rkdata._attributes.Code,
            });
          } else {
            Modifiers.findOneAndUpdate(
              { id: rkdata._attributes.Ident },
              {
                $set: {
                  id: rkdata._attributes.Ident,
                  max_one_dish: rkdata._attributes.MaxOneDish,
                  use_limited_qnt: rkdata._attributes.UseLimitedQnt,
                  modi_group_id: rkdata._attributes.MainParentIdent,
                  menu_item_id: rkdata._attributes.Dish,
                  name: rkdata._attributes.Name,
                  code: rkdata._attributes.Code,
                },
              },
              { new: true, runValidators: true },
              (err, doc) => {
                if (err) {
                  console.log("error", err);
                }
              }
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });

  response.on("error", function (error) {
    console.error(error);
  });
});

var postData =
  '<?xml version="1.0" encoding="utf-8"?><RK7Query>   <RK7Command CMD="GetRefData" RefName="Modifiers" OnlyActive="1" MacroPropTags="true"   WithMacroProp="1" PropMask="Items.(Ident, ItemIdent, MaxOneDish, UseLimitedQnt, Name, Code, MainParentIdent, Dish  )" ></RK7Command></RK7Query>';

requestGetModifiers.write(postData);
requestGetModifiers.end();

parentPort.postMessage(resultJson);
