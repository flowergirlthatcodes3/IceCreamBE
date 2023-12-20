const pg = require("pg");
const client = new pg.Client("postgres://localhost/icecreamBE");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

//receiving all flavors.
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
        SELECT * FROM flavors;
        `;
    console.log("in db");

    const response = await client.query(SQL);
    res.send(response.rows);
    //res.status(202)
  } catch (error) {
    next(error);
  }
});

/// receiving one specfic flavor
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    console.log(req.params.id);
    const SQL = `
        SELECT * from flavors WHERE id=$1
        `;
    const response = await client.query(SQL, [req.params.id]);
    if (!response.rows.length) {
      next({
        name: "id error",
        message: `flavors with id ${req.params.id} is not found`,
      });
    } else {
        res.send(response.rows[0])
    }
  } catch (error) {
    next(error);
  }
});

// deleting a flavor
app.delete('/api/flavors/:id', async (req,res,next) =>{
    try { 
        const SQL = `
        DELETE FROM flavors WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])
        console.log(response)
        res.sendStatus(204)
        
    } catch (error) {
        next(error)
    }
})

//This is considered an Error Handler
app.use((error,req,res,next) => {
    res.send(error)
    res.status(500)
})

///catching all errors, use at bottom so that way all routes are checked.
app.use('*', (req,res,next) =>{
    res.send("No such route exists")
})

const start = async () => {
  await client.connect();
  console.log("connected to db");

  const SQL = `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(25),
);

INSERT INTO flavors(name) VALUES ('Vanilla Bean');
INSERT INTO flavors(name) VALUES ('Pralines & Cream');
INSERT INTO flavors(name) VALUES ('Strawberry Sorbet');
INSERT INTO flavors(name) VALUES ('OH No, Not My CookieDough');
INSERT INTO flavors(name) VALUES ('Caramel Brownie Blast');
`;
  await client.query(SQL);
  console.log("table create and seeded");

  const port = process.env.PORT || 3333;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

start();
