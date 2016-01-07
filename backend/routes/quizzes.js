var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth2');

var Quiz = require('../models/quiz');
var User = require('../models/user');
var UserRateQuiz = require('../models/user-rate-quiz');
var UserAnswerQuiz = require('../models/user-answer-quiz');

function getQuizFromRequestBody(requestBody, done) {
    var quiz = requestBody;
    // Convert to correct Date format
    if (quiz.createdAt) {
        quiz.createdAt = new Date(quiz.createdAt);
    } else {
        quiz.createdAt = new Date();
    }

    User.findById(quiz.creator.id, function (err, creator) {
        if (err) {
            return done(err, null);
        }

        quiz.creator = creator;
        return done(null, new Quiz(quiz));
    });
}

module.exports = function (io) {
    router.route('/')
        // Get all quizzes.
        .get(function (req, res) {
            var params = {};

            if (req.query.categories) {
                if (req.query.categories !== 'Tất cả') {
                    params.categories = req.query.categories;
                }
            } else if (req.query.userId) {
                params['creator._id'] = req.query.userId;
            }

            Quiz.find(params).sort({createdAt: -1}).exec(function (err, results) {
                if (err) {
                    return res.status(400).send(err);
                }

                res.json(results);
            });
        })
        // Create a quiz.
        .post(oauth2.isAuthenticated, function (req, res) {
            getQuizFromRequestBody((req.body), function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }

                quiz.save(function (err) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    io.emit('quizzes:new', quiz);
                    res.json({message: 'Quiz created!'});
                });
            });
        });

    router.post('/:id/rating', function (req, res) {
        var quizId = req.params.id;
        var userId = req.body.userId;
        var rating = req.body.rating;
        UserRateQuiz.findOne({userId: userId, quizId: quizId}, function (err, item) {
            if (err) {
                return res.status(400).send(err);
            }
            var message = 'Vote saved!';
            var voted = false;
            if (item) {
                voted = true;
                message = 'You already voted on this quiz!';
            }

            Quiz.findOne({_id: quizId}, function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }
                if (!quiz) {
                    return res.send({message: 'Quiz not found!'});
                }

                quiz.votes += !voted;
                if (item) {
                    quiz.rating = (quiz.rating * quiz.votes) - item.rating;
                    item.rating = rating;
                    item.createdAt = new Date();
                } else {
                    item = new UserRateQuiz({
                        userId: userId,
                        quizId: quizId,
                        rating: rating,
                        createdAt: new Date()
                    });
                }
                item.save();

                quiz.rating = (quiz.rating + rating) / quiz.votes;
                quiz.save();

                io.emit('quizzes:update', quiz);
                res.send({message: message, rating: quiz.rating});
            });
        });
    });

    // Routing for /quizzes/:id
    router.route('/:id')
        // Get quiz info by id.
        .get(function (req, res) {
            Quiz.findOne({_id: req.params.id}, function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }
                res.json(quiz);
            });
        })
        .post(oauth2.isAuthenticated, function (req, res) {
            var userId = req.body.userId;
            var quizId = req.params.id;
            Quiz.findOne({_id: quizId}, function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }
                if (!quiz) {
                    return res.status(400).send(err);
                }
                if (quiz.creator._id === req.body.userId) {
                    return res.json({error: true, message: 'You cannot answer your own quiz!'});
                }

                UserAnswerQuiz.findOne({userId: userId, quizId: quizId}, function (err, item) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    if (item) {
                        if (item.count >= 3) {
                            return res.json({error: true, message: 'You have already answered this quiz 3 times!'});
                        }
                        if (item.correct) {
                            return res.json({error: true, message: 'You have already answered this quiz correctly!'});
                        }
                        item.count += 1;
                        item.userAnswer = req.body.userAnswer;
                        item.userChoices = req.body.choices.map(function (item) {
                            return item.userChoice || true;
                        });
                    } else {
                        item = new UserAnswerQuiz({
                            userId: userId,
                            quizId: quizId,
                            count: 1,
                            userAnswer: req.body.userAnswer,
                            userChoices: req.body.choices.map(function (item) {
                                return item.userChoice || true;
                            })
                        });
                    }
                    item.correct = false;
                    item.createdAt = new Date();
                    item.save();

                    if (quiz.choices && quiz.choices.length > 0) {
                        if (quiz.choices.length !== req.body.choices.length) {
                            return res.send(false);
                        }
                        for (var i = 0; i < quiz.choices.length; i++) {
                            if (req.body.choices[i].userChoice === undefined && !quiz.choices[i].correct) {
                                continue;
                            }
                            if (quiz.choices[i].correct !== req.body.choices[i].userChoice) {
                                return res.send(false);
                            }
                        }
                    } else {
                        if (quiz.answer.toLowerCase() !== req.body.userAnswer.toLowerCase()) {
                            return res.send(false);
                        }
                    }

                    User.findOne({_id: userId}, function (err, user) {
                        if (err) {
                            return res.status(400).send(err);
                        }
                        if (!user) {
                            return res.status(400).send('User not found');
                        }

                        user.score++;
                        user.save();
                        item.correct = true;
                        item.save();
                        return res.send(true);
                    });
                });
            });
        })
        // Update quiz info.
        .put(oauth2.isAuthenticated, function (req, res) {
            getQuizFromRequestBody((req.body), function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }

                Quiz.findOneAndUpdate(
                    {_id: req.params.id},
                    quiz,
                    function (err) {
                        if (err) {
                            return res.status(400).send(err);
                        }
                        res.json({message: 'Quiz modified!'});
                    }
                );
            });

        });

    // Routing for /quizzes/:id
    router.route('/:id/:userId')
        // Delete quiz.
        .delete(oauth2.isAuthenticated, function (req, res) {
            Quiz.findOne({_id: req.params.id}, function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
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
