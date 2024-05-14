const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:user_id/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({ user_id: req.params.user_id, id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  const port = process.env.PORT || 3000;
  await client.connect();
  console.log("connected to database");

  await createTables();
  console.log("tables created");

  const [christina, jennifer, angelina, corgi, husky, scottie] =
    await Promise.all([
      createUser({ username: "christina", password: "secret" }),
      createUser({ username: "jennifer", password: "secret1" }),
      createUser({ username: "angelina", password: "secret2" }),
      createProduct({ name: "corgi" }),
      createProduct({ name: "husky" }),
      createProduct({ name: "scottie" }),
    ]);

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const favorite = await createFavorite({
    user_id: christina.id,
    product_id: corgi.id,
  });

  console.log(await fetchFavorites(christina.id));
  await destroyFavorite({ user_id: christina.id, id: favorite.id });
  console.log(await fetchFavorites(christina.id));

  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
