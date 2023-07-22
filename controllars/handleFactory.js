const AppError = require("./../utils/AppError");
const CatchAssync = require("./../utils/CatchAssync");
const ApiFeatures = require("./../utils/ApiFeatures");

exports.deleteOne = (Model) =>
  CatchAssync(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new AppError("no document found with that id", 404));
    }
    res.status(200).json({
      status: "success",
      data: null,
    });
  });
exports.updateOne = (Model) =>
  CatchAssync(async (req, res, next) => {
    const { id } = req.params;
    const Doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!Doc) {
      return next(new AppError("no Document found with that id", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        Doc,
      },
    });
  });
exports.createOne = (Model) =>
  CatchAssync(async (req, res, next) => {
    // try {
    const Document = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: Document,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  CatchAssync(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (populateOptions) query.populate(populateOptions);
    const Doc = await query;
    if (!Doc) {
      return next(new AppError("no Docment found with that id", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        Doc,
      },
    });
  });
exports.getAll = (model) =>
  CatchAssync(async (req, res, next) => {

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    
    const Features = new ApiFeatures(model.find(filter), req.query)
      .filter()
      .sorting()
      .limilfields()
      .pagination();
    const Doc = await Features.query.explain();
    res.status(200).json({
      status: "success",
      results: Doc.length,
      data: {
        Doc,
      },
    });
  });
// CatchAssync(async (req, res,next) => {
//   const Features = new ApiFeatures(Tour.find(), req.query)
//   .filter()
//   .sorting()
//   .limilfields()
//   .pagination();
//   const tour = await Features.query;
//   res.status(200).json({
//     status: "success",
//     results: tour.length,
//     data: {
//       tour,
//     },
//   });

// });
// CatchAssync(async (req, res,next) => {
//   // try {
//     const { id } = req.params;
//     const tour = await Tour.findById(id).populate({
//       path:'review'
//     });
//     if(!tour){
//       return next(new AppError('no tour found with that id',404));
//     }
//     res.status(200).json({
//       status: "success",
//       data: {
//         tour,
//       },
//     });

//   });
//   exports.UpdateTour = CatchAssync(async (req, res,next) => {

//     const { id } = req.params;
//     const tour = await Tour.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if(!tour){
//       return next(new AppError('no tour found with that id',404));
//     }
//     res.status(200).json({
//       status: "success",
//       data: {
//         tour,
//       },
//     });

// });

// exports.DeleteAtour = CatchAssync(async (req, res,next) => {

//     const { id } = req.params;
//     const tour = await Tour.findByIdAndDelete(id);
//     if(!tour){
//       return next(new AppError('no tour found with that id',404));
//     }
//     res.status(200).json({
//       status: "success",
//       data: null,
//     });

// });
