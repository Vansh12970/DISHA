const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((error) => next(error))

    }
}
export { asyncHandler }
//accept as a function and return as a function promise