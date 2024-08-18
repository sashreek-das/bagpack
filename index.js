const express = require("express");
const cors = require("cors");

const app = express(); 

app.use(cors());
app.use(express.json());

const port = 3000;

const rootRouter = require("./routes/index");
app.use("/api/v1/", rootRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
