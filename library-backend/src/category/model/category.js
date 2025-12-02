import mongoose from "mongoose";
import slugify from "slugify";

const CategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: false, unique: true, trim: true },
        // description: { type: String},
        icon: { type: String},
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 1 },
        viName: { type: String, default: "" },
    },
    { timestamps: true }
);

CategorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, { 
            lower: true, // chữ thường
            locale: "vi", // hỗ trợ tiếng việt
            remove: /[*+~.()'"!:@]/g, // loại bỏ ký tự đặc biệt
        });
    }
    next();
});

export default mongoose.model("Category", CategorySchema);