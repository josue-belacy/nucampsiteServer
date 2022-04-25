const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorite) => res.status(200).json(favorite))
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          // [{'_id':'campsite ObjectId'}, {'_id':'campsite ObjectId'}]
          req.body.forEach((fav) => {
            if (!favorite.campsites.includes(fav._id)) {
              favorite.campsites.push(fav._id);
            }
          });
          favorite
            .save()
            .then((favorite) => {
              res.status(200).json(favorite);
            })
            .catch((err) => {
              next(err);
            });
        } else {
          Favorite.create({ user: req.user._id })
            .then((favorite) => {
              req.body.forEach((fav) => {
                if (!favorite.campsites.includes(fav._id)) {
                  favorite.campsites.push(fav._id);
                }
              });
              favorite
                .save()
                .then((favorite) => {
                  res.status(200).json(favorite);
                })
                .catch((err) => {
                  next(err);
                });
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status(403).end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOneAndDelete({ user: req.user._id }).then((favorite) => {
      res.status(200).json(favorite);
    });
  });
favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.status(403).end("GET not supported on /favorites/:campsiteId");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId);
        }
        favorite
          .save()
          .then((favorite) => {
            res.status(200).json(favorite);
          })
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status(403).end("PUT not supported on /favorites/:campsiteId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        const index = favorite.campsites.indexOf(req.params.campsiteId);
        if (index >= 0) {
          favorite.campsites.splice(index, 1);
        }
        favorite
          .save()
          .then((favorite) => {
            res.status(200).json(favorite);
          })
          .catch((err) => next(err));
      } else {
        res.status(200).end("You do not have a favorite to delete!");
      }
    });
  });

module.exports = favoriteRouter;