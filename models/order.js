const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  cart: { type: Object, required: true },
  address: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: false,
    default: Date.now
  },
  phoneNumber: {
    type: String,
    required: true
  },
  tinhtrang:{
    type:String,
    required: false,
    default:'chờ xác nhận'
  }
});

module.exports = mongoose.model("Order", orderSchema);
