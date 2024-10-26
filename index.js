// Imports
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const { expressjwt: jwt } = require("express-jwt");
const jwks = require("jwks-rsa");

const pool = require("./database/db");
const userRoute = require("./routes/userRoutes");
const postRoute = require("./routes/postRoutes");
const profileRoute = require("./routes/profileRoutes");
const messagesRoute = require("./routes/messagesRoutes");
const followRoute = require("./routes/followRoutes");

const verifyJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
}).unless({ path: ["/"] });

const currentUserCheck = async (req, res, next) => {
  const auth0Id = req.auth.sub;
  const query = await pool.query(
    `SELECT * FROM app_user WHERE "auth0Id" = $1`,
    [auth0Id]
  );
  const user = query.rows;
  if (user.length == 0) {
    try {
      const accessToken = req.headers.authorization.split(" ")[1];
      const response = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const userInfo = response.data;
      pool.query(
        `INSERT INTO app_user ("auth0Id", email, "joinedDate") VALUES ($1, $2, $3)`,
        [userInfo.sub, userInfo.email, new Date()]
      );
    } catch (error) {
      console.log(error);
    }
  }
  next();
};

const app = express();
const port = process.env.SERVER_PORT || 3001;
require("dotenv").config();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN_URL }));

app.use("/api/users", verifyJwt, currentUserCheck, userRoute);
app.use("/api/posts", postRoute);
app.use("/api/profile", profileRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/follow/", followRoute);

app.listen(port, () => console.log(`Listening on port ${port}....`));
