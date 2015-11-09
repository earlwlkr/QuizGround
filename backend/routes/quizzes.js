var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth2');

var Quiz = require('../models/quiz');

function getQuizFromRequestBody(requestBody) {
    var quiz = requestBody;
    // Convert to correct Date format
    if (quiz.createdAt) {
        quiz.createdAt = new Date(quiz.createdAt);
    }
    if (quiz.creator && quiz.creator.joinDate) {
        quiz.creator.joinDate = new Date(quiz.creator.joinDate);
    }
    return requestBody;
}

// Routing for /quizzes
router.route('/')
    // Get all quizzes.
    .get(function (req, res) {
        Quiz.find(function (err, results) {
            if (err) {
                res.send(err);
            }

            res.json(results);
        });
    })
    // Create a quiz.
    .post(oauth2.isAuthenticated, function (req, res) {
        var quiz = new Quiz(getQuizFromRequestBody(req.body));
        quiz.save(function (err) {
            if (err) {
                res.send(err);
            }

            res.json({message: 'Quiz created!'});
        });
    });

// Routing for /quizzes/:id
router.route('/:id')
    // Get quiz info by id.
    .get(function (req, res) {
        Quiz.findOne({_id: req.params.id}, function (err, quiz) {
            if (err) {
                res.send(err);
            }
            res.json(quiz);
        });
    })
    // Update quiz info.
    .put(oauth2.isAuthenticated, function (req, res) {
        Quiz.findOneAndUpdate(
            {_id: req.params.id},
            getQuizFromRequestBody(req.body),
            function (err) {
                if (err) {
                    res.send(err);
                }
                res.json({message: 'Quiz modified!'});
            }
        );
    })
    // Delete quiz.
    .delete(oauth2.isAuthenticated, function (req, res) {
        Quiz.findOneAndRemove({_id: req.params.id}, function (err) {
            if (err) {
                res.send(err);
            }
            res.json({message: 'Quiz deleted!'});
        });
    });

module.exports = router;