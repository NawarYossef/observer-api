const DATABASE_NAME = "observer";
exports.DATABASE_URL =
  process.env.DATABASE_URL ||
  global.DATABASE_URL ||
  `mongodb://localhost/${DATABASE_NAME}`;

exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  global.TEST_DATABASE_URL ||
  `mongodb://localhost/test-${DATABASE_NAME}`;

exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || "fizbuzzfizzbuzz2468";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || `7d`;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
