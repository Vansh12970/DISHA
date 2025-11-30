import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reportSchema = new Schema(
    {
        videoFile: {
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
        location:{
            type: {
              lat: { type: Number, required: true },
              lon: { type: Number, required: true }
            },
            required: true
          },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },{timestamps:true})

reportSchema.plugin(mongooseAggregatePaginate)

export const Report = mongoose.model("Report", reportSchema)