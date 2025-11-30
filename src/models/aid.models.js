import mongoose, {Schema} from "mongoose"

const aidSchema = new Schema(
    {
        aidType: {
            type: String,
            required: true,
        },
        quantity: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },{timestamps: true})


export const Aid = mongoose.model("Aid", aidSchema)