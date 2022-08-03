const router = require('express').Router();
const { Comment } = require('../../models');

// CRUD for comments
// Get comments
router.get('/', (req, res) => {
    Comment.findAll({})
        .then(dbCommentData => res.status(200).json(dbCommentData))
        .catch(err => {
            res.status(500).json(err);
        });
});

// Save a comment
router.post('/', (req, res) => {

    // check the session
    if (req.session) {
        Comment.create({
            comment_text: req.body.comment_text,
            post_id: req.body.post_id,
            // use the id from the session
            user_id: req.session.user_id
        })
            .then(dbCommentData => res.status(200).json(dbCommentData))
            .catch(err => {
                res.status(500).json(err);
            });
    }
});

// Delete a comment
router.delete('/:id',  (req, res) => {
    Comment.destroy({
        where: {
            id: req.params.id
        }
    }).then(dbCommentData => {
            if (!dbCommentData) {
                res.status(404).json({ message: 'Comment does not exist'});
                return;
            }
            res.status(200).json(dbCommentData)})
        .catch(err => {
            res.status(500).json(err);
        });
});

module.exports = router;