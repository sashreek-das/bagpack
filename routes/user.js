const express = require("express")

const router = express.Router();

const zod = require("zod");

const { User, Account } = require("../db")

const jwt = require("jsonwebtoken")

const { JWT_SECRET } = require("../config")

const authMiddleware = require("./middleware");
const { route } = require("./account");

const signupBody = zod.object({
    username: zod.string().email(),
    firstname: zod.string(),
    lastname: zod.string(),
    password: zod.string()
})

router.post('/signup', async (req, res) => {
    try {
        const { success } = signupBody.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                mssg: 'email taken/incorrect inputs'
            });
        }
        if (!req.body.username || !req.body.password || !req.body.firstname || !req.body.lastname) {
            return res.status(409).json({
                mssg: 'All fields are required'
            });
        }
        

        const existingUser = await User.findOne({
            username: req.body.username
        });

        if (existingUser) {
            return res.status(409).json({
                mssg: 'email taken'
            });
        }

        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        });

        const userId = user._id;

        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        });

        const token = jwt.sign({ userId }, JWT_SECRET);

        res.json({
            mssg: 'user created',
            token,
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({
            mssg: 'Internal server error'
        });
    }
});
const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post('/signin', async (req, res) => {
    try {
        const { success } = signinBody.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                mssg: 'wrong inputs'
            });
        }

        const user = await User.findOne({
            username: req.body.username,
            password: req.body.password
        });

        if (user) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET);

            return res.json({
                token,
                password: user.password,
                firstname: user.firstname,
                lastname: user.lastname,
                // userId: user._id
            });
        }

        res.status(401).json({
            mssg: 'error in logging in'
        });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({
            mssg: 'Internal server error'
        });
    }
});

const updateBody = zod.object({
    password:String,
    firstName: String,
    lastName: String
})

// router.put("/", authMiddleware, async(req,res) => {
//     const { success } = updateBody.safeParse(req.body);
//     if(!success){
//         return res.status(411).json({
//             mssg:"wrong inputs"
//         })
//     }
//     await User.updateOne({ _id: req.userId },req.body);

//     res.json({
//         mssg:"updated successfully"
//     })

// })

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    let users;
    if (filter) {
        users = await User.find({
            $or: [
                { firstName: { "$regex": filter, "$options": "i" } },
                { lastName: { "$regex": filter, "$options": "i" } }
            ]
        });
    } else {
        users = await User.find({});
    }

    res.json({
        users: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});


module.exports = router