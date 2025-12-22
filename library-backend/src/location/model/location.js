import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        area : { type: String, required: true },
        shelf : { type: String, required: true },
        row : { type: String, required: true },
        position : { type: String, required: true },
    },
    { timestamps: true
    }
);

export default mongoose.model("Location", locationSchema);