import mongoose, {Schema} from "mongoose"

const volunteerSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        contactDetails: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },{timestamps: true})


export const Volunteer = mongoose.model("Volunteer", volunteerSchema)