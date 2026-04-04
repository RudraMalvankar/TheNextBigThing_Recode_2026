const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },  // bcrypt hashed
  avatar:     { type: String, default: "" },      // initials fallback
  plan:       { type: String, enum: ["free","pro"], default: "free" },
  sites:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Site" }],
  createdAt:  { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare method
UserSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);
