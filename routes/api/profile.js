const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {check, validationResult} = require('express-validator');
const Profile = require("../../models/Profile");
const User =  require("../../models/User");

//@route GET api/profile/me
//@desc Get current users profile
//@access Private

router.get('/me', auth, async function(req, res){
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//@route GET api/profile
//@desc Create or Update user profile
//@access Private

router.post('/',[auth,
    [
        check('status', 'Status is required').not().isEmpty(),
        // check('skills', 'Skills is required').not().isEmpty()
    ]
],
    async function(req, res){
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const{
            company,
            website,
            location,
            bio,
            status,
            // skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;

        // if(skills){
        //     profileFields.skills = skills.split(',').map(skill => skill.trim());
        // }
        // console.log(profileFields.skills);
        // res.send('Hello');

        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if(profile)
            {
                profile = await Profile.findByIdAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server Error");
        }
});

// @route    GET api/profile
// @desc    GET all profiles
// @access  Public

router.get('/', async function(req, res){
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});


// @route    GET api/profile/user/:user_id
// @desc    GET profile by user ID
// @access  Public

router.get('/user/:user_id', async function(req, res){
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile)
        {
            return res.status(400).json({msg: "Profile not found"});
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind == "ObjectId")
        {
            return res.status(400).json({msg: "Profile not found"});
        }
        res.status(500).send("Server Error");
    }
});

// @route   Delete api/profile
// @desc    Delete profile, user & posts
// @access  Private

router.delete('/', async function(req, res){
    try {
        // @todo - remove users posts
        // Remove profile
        await Profile.findOneAndRemove({user: req.user.id});

        // Remove user
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: "User Deleted"});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;