module.exports = {
    quizzes: function (io) {
        return require('./quizzes')(io);
    },
    comments: function (io) {
        return require('./comments')(io);
    },
    clients: require('./clients'),
    users: require('./users'),
    categories: require('./categories')()
};
