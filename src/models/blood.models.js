import mongoose, {Schema} from "mongoose"

const bloodSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        age: {
            type: String,
            required: true,
        },
        bloodGroup: {
            type: String,
            required: true
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


export const Blood = mongoose.model("Blood", bloodSchema)