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

                var index = -1;
                for (var i = 0; i < quiz.comments.length; i++) {
                    if (quiz.comments[i]._id.toString() === req.params.commentId) {
                        index = i;
                        break;
                    }
                }
                if (index === -1) {
                    return res.status(400).send('Comment not found!');
                }

                User.findOne({_id: req.params.userId}, function (err, user) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    if (!user.isAdmin && user._id != quiz.comments[index].creator._id) {
                        return res.status(401).send('You can\'t delete this comment!');
                    }

                    quiz.comments.splice(index, 1);
                    quiz.save();
                    io.emit('quizzes:update', quiz);
                    res.json({message: 'Quiz deleted!'});
                });

            });
        });

    return router;
};
