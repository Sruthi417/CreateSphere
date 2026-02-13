import mongoose from "mongoose";

const { Schema } = mongoose;

/* -------------------------
   Creator Profile (optional)
----*/
const CreatorProfileSchema = new Schema(
  {
    displayName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    fullBio: { type: String, trim: true },

    portfolio: [{ type: String }],

    moderation: {
      reason: { type: String, default: null },
      hiddenUntil: { type: Date, default: null },
      strikeCount: { type: Number, default: 0 }
    },


    categories: [
      { type: Schema.Types.ObjectId, ref: "Category" }
    ],

    products: [
      { type: Schema.Types.ObjectId, ref: "Product" }
    ],

    tutorials: [
      { type: Schema.Types.ObjectId, ref: "Tutorial" }
    ],

    rating: { type: Number, default: 0 },

    followers: [
      { type: Schema.Types.ObjectId, ref: "User" }
    ],

    followersCount: { type: Number, default: 0 },

    /* -------------------------
       Verification System
    -------------------------- */

    verified: { type: Boolean, default: false }, // UI quick flag

    verificationStatus: {
      type: String,
      enum: ["none", "requested", "reviewing", "verified", "rejected", "revoked"],
      default: "none",
      index: true
    },

    verificationRequestedAt: { type: Date, default: null },

    verifiedAt: { type: Date, default: null },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    rejectionReason: {
      type: String,
      default: null
    },

    /* -------------------------
       Deactivation Support
    -------------------------- */

    isDeactivated: {
      type: Boolean,
      default: false,
    },

  },
  { _id: false }
);


/* -------------------------
   Admin Details (optional)
-------------------------- */
const AdminDetailsSchema = new Schema(
  {
    isSuperAdmin: { type: Boolean, default: false },

    permissions: [
      {
        type: String,
        enum: [
          "MANAGE_USERS",
          "MODERATE_CONTENT",
          "VIEW_REPORTS",
        ],
      },
    ],

    notes: { type: String },
  },
  { _id: false }
);

/* -------------------------
        USER SCHEMA
-------------------------- */
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // never return password by default
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },


    role: {
      type: String,
      enum: ["user", "creator", "admin"],
      default: "user",
      index: true,
    },

    onboardingStatus: {
      type: String,
      enum: ["none", "creator_pending", "creator_completed"],
      default: "none",
      index: true
    },


    avatarUrl: String,


    isBlocked: {
      type: Boolean,
      default: false,
    },

    moderation: {
      status: { type: String, default: "active" },
      strikeCount: { type: Number, default: 0 },
      suspendedUntil: { type: Date, default: null },
      lastAction: { type: String, default: null },
      lastReason: { type: String, default: null }
    },




    favoriteProducts: [
      { type: Schema.Types.ObjectId, ref: "Product" }
    ],

    enrolledTutorials: [
      { type: Schema.Types.ObjectId, ref: "Tutorial" }
    ],

    following: [
      { type: Schema.Types.ObjectId, ref: "User" }
    ],

    creatorProfile: {
      type: CreatorProfileSchema,
      default: null,
    },

    adminDetails: {
      type: AdminDetailsSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* -------------------------
   Indexes for performance
-------------------------- */
/*UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ "creatorProfile.followersCount": -1 });*/

export default mongoose.model("User", UserSchema);
