const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/APIError");

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });
