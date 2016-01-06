var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth2');
var mongoose = require('mongoose');

var Quiz = require('../models/quiz');
var User = require('../models/user');

module.exports = function (io) {

    router.route('/:id')
        .post(oauth2.isAuthenticated, function (req, res) {
            Quiz.findOne({_id: req.params.id}, function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }
                if (!quiz) {
                    return res.status(400).send(err);
                }

                var comment = req.body;
                comment._id = mongoose.Types.ObjectId();
                comment.createdAt = new Date();

                User.findById(comment.creator._id, function (err, user) {
                    if (err) {
                        return res.status(400).send(err);
                    }

                    comment.creator = user;
                    quiz.comments.splice(0, 0, comment);
                    quiz.save();

                    comment.quizId = quiz._id;
                    io.emit('comments:new', comment);
                    io.emit('quizzes:update', quiz);
                    return res.json({message: 'Comment saved!'});
                });
            });
        });

    router.route('/:quizId/:commentId/:userId')
        // Delete quiz.
        .delete(oauth2.isAuthenticated, function (req, res) {
            Quiz.findOne({_id: req.params.quizId}, function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }
                if (!quiz) {
                    return res.status(400).send('Quiz not found!');
                }

                User.findOne({_id: req.params.userId}, function (err, user) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    if (!user.isAdmin && user._id != quiz.creator._id) {
                        return res.status(401).json({message: 'You can\'t delete this quiz!'});
                    }

                    quiz.remove();
                    io.emit('quizzes:delete', quiz._id);
                    res.json({message: 'Quiz deleted!'});
                });

            });
        });

    return router;
};
