import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  isPremium: boolean;
  plan: "free" | "basic" | "pro";
  usageCount: number;
  freeLimit: number;
  stripeCustomerId?: string;
  stripeSessionId?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    plan: { type: String, enum: ["free", "basic", "pro"], default: "free" },
    usageCount: { type: Number, default: 0 },
    freeLimit: { type: Number, default: 3 },
    stripeCustomerId: { type: String },
    stripeSessionId: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
