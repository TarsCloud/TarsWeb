if (req.query.level == 1) {
  next(null, {
    "ret_code": 200,
    "data": [
      "a",
      "accc",
      "ap",
      "app",
      "appHw",
      "readx",
      "tars",
      "TestApp",
      "testzhifei"
    ],
  });
} else if(req.query.level == 2) {
  next(null, {
    "ret_code": 200,
    "data": [
      "serverHw",
      "serverHw2"
    ],
  });
} else if (req.query.level == 3) {
  next(null, {
    "ret_code": 200,
    "data": [
      "",
      "name.area.0802",
      "name.area.8819",
    ],
  });
}else if (req.query.level == 4) {
  next(null, {
    "ret_code": 200,
    "data": [
      "1.1.1.1",
      "19.98.08.02",
    ],
  });
}