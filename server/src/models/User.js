import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true},
    phone:{type: Number, unique: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    role: {type: String, enum:["user", "admin", "astrologer"]},

})

const User = mongoose.model('User', UserSchema);

export default User;