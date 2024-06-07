const { default: mongoose } = require('mongoose')
const jwt = require('jsonwebtoken')
const logger = require('../Logger/logger')

const User = require('../Models/userModels')

const createToken = (_id, Role) => {
    return jwt.sign({_id, Role}, process.env.SECRET, {expiresIn: '3d'})
}

const loginUser = async (req,res) => {
    const {Email, Password} = req.body

    try{
        const user = await User.login(Email, Password)
        logger.info('User Logged In!!!')
        const token = createToken(user._id, user.Role)
        logger.info('Token Created!!!')
        res.status(200).json({Email, token})
    }
    catch(error) {
        res.status(400).json({error: error.message})
        logger.error('error: ', error)
    }
}


    const signupUser = async (req,res) => {
        const {Email, Password, Role} = req.body
    
        try{
            const user = await User.signup(Email, Password, Role)
            logger.info('User Signed Up!!!')
            const token = createToken(user._id, Role)
            logger.info('Token created!!!')

            res.status(200).json({Email, token})
    
        } catch(error) {
            res.status(400).json({error: error.message})
            logger.error('error: ', error)
        }
    }

    
    module.exports = {
        loginUser,
        signupUser,
    }