import mongoose, { Schema } from "mongoose";

const safeRouteSchema = new Schema(
    {
            startLocation: {
              type: {
                lat: { type: Number, required: true },
                lon: { type: Number, required: true }
              },
              required: true
            },
            destination: {
              type: {
                lat: { type: Number, required: true },
                lon: { type: Number, required: true }
              },
              required: true
            }    
    }, {timestamps: true})

export const SafeRoute = mongoose.model("SafeRoute", safeRouteSchema)