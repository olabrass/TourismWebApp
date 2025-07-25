const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIfeatures = require('./../utils/apiFeatures');

// Factory function to handle common CRUD operations
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            runValidators:true
        });
        if (!doc) {
            return next(new AppError(`No document found with that ID`, 404));   
        }
            res.status(200).json({
                status: 'success',
         data: {
             data: doc
            }
        }) 
     });

     exports.createOne = Model => catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
     res.status(201).json({
            status: 'success',
            data:{
                data: doc
            }
        });
        });

        exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
            let query = Model.findById(req.params.id);
            if (popOptions) query = query.populate(popOptions);

            const doc = await query;

            if (!doc) {
                return next(new AppError('No document found with that ID', 404));
            }

            res.status(200).json({
                status: 'success',
                data: {
                    data: doc
                }
            });
        });

        exports.getAll = Model => catchAsync(async(req, res, next) => {
            //To allow for nested routes, we check if tourId is present in the request parameters
            let filter = {};
            // If a tourId is provided in the request parameters, filter reviews by that tour
            if(req.params.tourId) filter = { tour: req.params.tourId };
        
                const features = new APIfeatures(Model.find(filter), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();
                const doc = await features.query;
                // const doc = await features.query.explain();
       
            res.status(200).json({
                status: 'success',
                result : doc.length,
                data:{
                    data:doc
                }
            });
          
        });