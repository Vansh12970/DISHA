import mongoose, {Schema} from "mongoose"

const moneySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            required: true,
        },
        owner : {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },{timestamps: true})

export const Money = mongoose.model("Money", moneySchema)