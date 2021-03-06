import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import authConfig from '../config/auth';

const User = mongoose.model('User');

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: ' Validation fails'
      });
    }

    const {
      email,
      password
    } = req.body;
    const user = await User.findOne({
      "email": email
    });
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: 'password does not match'
      });
    }
    const {
      id,
      name
    } = user;
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({
        id
      }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });

  }

}

export default new SessionController();
