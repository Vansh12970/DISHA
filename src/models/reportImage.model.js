import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reportImageSchema = new Schema(
    {
        imageFile: {
            type: String,
            required: true,  //cloudinary url
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },{timestamps:true})

reportImageSchema.plugin(mongooseAggregatePaginate)

export const reportImage = mongoose.model("ReportImage", reportImageSchema)