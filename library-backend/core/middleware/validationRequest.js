import StatusCodes from "../utils/statusCode/statusCode.js";

function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      // validate and use the cleaned value returned by Joi
      const value = await schema.validateAsync(req.body, { abortEarly: false });
      req.body = value;
      next();
    } catch (error) {
      console.log(error);
      const details = Array.isArray(error?.details) ? error.details : [];
      const errors = details.map((err) => ({
        message: err.context?.message || err.message,
        path: err.path,
      }));
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: details.map((err) => err.message),
        errors,
      });
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((err) => ({
        message: err.message,
        path: err.path,
      }));

      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: error.details.map((err) => err.message),
        errors,
      });
    }
    next();
  };
}

export { validateRequest, validateQuery };
