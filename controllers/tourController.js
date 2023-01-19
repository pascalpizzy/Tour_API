const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// const checkID = (req, res, next, val) => {
//   console.log(`tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID ',
//     });
//   }
//   next();
// };

// const checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'missing name or price',
//     });
//   }
//   next();
// };

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = async (req, res) => {
  console.log(req.requestTime);

  //ALL THE ABOVE STEP IS USED FOR ONLY MONGOOSE
  try {
    //console.log(req.query);
    //this is for our filter and the conventional way of doing it.
    //BUILD THE QUERY
    // 1a) FILTERING
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // //this way we loop the excluded fields array with el and delete each of them from the queryObj object.
    // excludedFields.forEach(el => delete queryObj[el]);

    // //ADVANCE FILTER BUILDER
    // // 1b) ADvance filter
    // //here we are trying to filter using the (greater than or equal to, less than or equal to, less than, greater than) and also the query and mongoose query command differ by "$" so we are trying to make the two to be the same so first we need to convert or queryObj to string.

    // //this first line converts the queryObj into a string.
    //let queryStr = JSON.stringify(queryObj);

    // //in this second line \b---b/ makes the search to be exact and not affecting words that contains only the letters but the exact letters and the "g" at the end means for it to replace the entire occurence.
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));
    // //how we use it in postman 127.0.0.1:3000/api/v1/tours?duration[lte]=5&difficulty=easy

    // //THIS IS basic query filter
    // // const query = Tour.find({
    // //   duration: 5,
    // //   difficulty: 'easy',
    // // });

    // //THIS IS query from mongoose and their inbuilt function
    // // const query = Tour.find()
    // //   .where('duration')
    // //   .equals(5)
    // //   .where('difficulty')
    // //   .equals('easy');

    // //THis is for using POSTMAN but if we do it this way then there is no way we could acyually implement the sort, pagination e.t.c to the query so the best thing to do is to save this part  "Tour.find(queryObj)" into a query so that at the end we can then await.
    // //..............const tours = await Tour.find(queryObj);
    //let query = Tour.find(JSON.parse(queryStr));

    // 2)SORTING
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   //default sorting
    //   query = query.sort('-createdAt');
    // }
    //how we use it in postman 127.0.0.1:3000/api/v1/tours?sort=-price,-ratingAverage

    // 3) Limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }
    // //how we use it in postman  127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price

    // 4) PAGINATION
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;

    // //this formular calculates the number of pages and data to be skipped before showing the requested page.
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('this page does not exist!');
    // }
    //how we use it in postman  127.0.0.1:3000/api/v1/tours?page=2&limit=10

    //EXECUTE THE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();
    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid request!!',
    });
  }
};

const createTour = async (req, res) => {
  // const newTour = new Tour({});
  // newTour.save();
  try {
    const newTour = await Tour.create(req.body);
    console.log(newTour);

    res.status(201).json({
      status: 'success',
      data: {
        newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Data sent!',
    });
  }
};

const getTour = async (req, res) => {
  //const tour = tours.find(el => el.id === id);

  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (eer) {
    res.status(40).json({
      status: 'fail',
      message: 'failed to fetch tour!',
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'failed to update tour!',
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    console.log('deleted!');
    res.status(204).json({
      status: 'success',
      tour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'failed to delete tour!',
    });
  }
};

const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStats: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: `$_id` },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numToursStats: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

module.exports = {
  //tours,
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  //checkID,
  //checkBody,
};
