import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Shape of a user document. `comparePassword` is an instance method we add below
// so controllers can check a plain password against the stored hash.
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name: string;
  about: string;
  avatar: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true, // usernames are unique
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      // letters, numbers and underscores only — no spaces or symbols
      match: [/^[a-z0-9_]+$/, "Username can only contain letters, numbers and underscores."],
    },
    email: {
      type: String,
      required: true,
      unique: true, // no two accounts can share an email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    // Display name shown in chats (defaults to the username on signup).
    name: { type: String, trim: true, default: "" },
    about: { type: String, trim: true, default: "Hey there! I'm using Root." },
    // Cloudinary URL of the profile picture ("" = use initials avatar).
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

// Hash the password before saving, but only when it actually changed (so we
// don't re-hash an already-hashed value on unrelated updates).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
