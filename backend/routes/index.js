module.exports = {
    quizzes: function (io) {
        return require('./quizzes')(io);
    },
    clients: require('./clients'),
    users: require('./users'),
    categories: require('./categories')()
};
