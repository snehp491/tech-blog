const router = require('express').Router();
const { User } = require('../../models');

// CRUD operations
// Get users
router.get('/', (req, res) => {
    User.findAll({
        attributes: { exclude: ['password'] },
    })
        .then((dbUserData) => res.status(200).json(dbUserData))
        .catch((err) => {
            res.status(500).json(err);
        });
});

// Fetch specific user by id
router.get('/:id', (req, res) => {
    User.findOne({
        attributes: { exclude: ['password'] },
        where: {
            id: req.params.id,
        },
        include: [
            {
                model: Post,
                attributes: ['id', 'title', 'post_text', 'created_at'],
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title'],
                },
            },
        ],
    }).then((dbUserData) => {
            if (!dbUserData) {
                res.status(404).json({ message: 'User does not exist' });
                return;
            }
            res.status(200).json(dbUserData);
        }).catch((err) => {
            res.status(500).json(err);
        });
});

// Create user
router.post('/', (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    })
        .then((dbUserData) => {
            req.session.save(() => {
                req.session.user_id = dbUserData.id;
                req.session.username = dbUserData.username;
                req.session.loggedIn = true;

                res.status(200).json(dbUserData);
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

// Update specific user by id
router.put('/:id', (req, res) => {
    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id,
        },
    })
        .then((dbUserData) => {
            if (!dbUserData[0]) {
                res.status(404).json({ message: 'User does not exist' });
                return;
            }
            res.status(200).json(dbUserData);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

// Delete user by id
router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
            id: req.params.id,
        },
    })
        .then((dbUserData) => {
            if (!dbUserData) {
                res.status(404).json({ message: 'User does not exist' });
                return;
            }
            res.status(200).json(dbUserData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// User Auth
router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ where: { username: req.body.username }
        });

        if (!userData) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        const validPassword = await userData.checkPassword(req.body.password);

        if (!validPassword) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.username = userData.username;
            req.session.logged_in = true;

            res.json({ user: userData, message: 'You are now logged in!' });
        });

    } catch (err) {
        res.status(400).json(err);
    }
});

router.post('/logout', async (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;