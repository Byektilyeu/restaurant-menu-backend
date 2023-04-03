const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  IP: {
    type: String,
    required: [true, "ip address zaaval oruulna uu"],
  },
  port: {
    type: Number,
    required: [true, "port zaaval oruulna uu"],
  },
  username: {
    type: String,
    required: [true, "username zaaval oruulna uu"],
  },
  password: {
    type: String,
    required: [true, "password zaaval oruulna uu"],
  },
  stationID: {
    type: String,
    required: [true, "stationID zaaval oruulna uu"],
  },
  paymentID: {
    type: String,
    required: [true, "paymentID zaaval oruulna uu"],
  },
  waiterID: {
    type: String,
    required: [true, "waiterID zaaval oruulna uu"],
  },
  stationCode: {
    type: Number,
    required: [true, "stationCode zaaval oruulna uu"],
  },
  restCode: {
    type: Number,
    required: [true, "restCode zaaval oruulna uu"],
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);
