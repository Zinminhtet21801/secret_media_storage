import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDTO } from './dtos/user-create.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
const nodemailer = require('nodemailer');
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findUser(email: string) {
    const user = await this.userRepo.findOne({ email: email });
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.findUser(email);
    if (!user) {
      throw new BadRequestException('User not found!!!');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestException('Password is incorrect!!!');
    }
    return user;
  }

  async hashPassword(password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async saveUser(createUser: UserCreateDTO) {
    const existedUser = await this.findUser(createUser.email);
    if (existedUser) {
      throw new BadRequestException('User already exists!!!');
    }
    const incomingUser = {
      ...createUser,
      password: await this.hashPassword(createUser.password),
    };
    const user = await this.userRepo.insert(incomingUser);
    return user;
  }

  async deleteUser(email: string) {
    const user = await this.findUser(email);
    if (!user) {
      throw new BadRequestException('User not found!!!');
    }
    const deletedUser = await this.userRepo.delete(user.id);
    return deletedUser;
  }

  async forgotPassword(userEmail: string) {
    const { id, name, email } = await this.findUser(userEmail);
    if (!email) {
      throw new BadRequestException('User not found!!!');
    }

    // host: 'smtp.ethereal.email',
    // port: 587,
    // secure: false,
    // auth: {
    //   user: process.env.ETHEREAL_USERNAME,
    //   pass: process.env.ETHEREAL_PASSWORD,
    // },

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailDetails = {
      from: process.env.GMAIL_USERNAME,
      to: email,
      subject: 'Forgot Password',
      text: `Hi ${name},
    You have requested to reset your password.
    Please click on the link below to reset your password.
    ${process.env.BASE_URL}/user/reset-password/${email}
    `,
    };

    const info = await transporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log('Error Occurs', err);
      } else {
        console.log('Email sent successfully');
      }
    });
    // console.log('Message sent: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  async resetPassword(inputEmail: string, inputPassword: string) {
    console.log(inputEmail, inputPassword);
    
    const user = await this.findUser(inputEmail);
    if (!user) {
      throw new BadRequestException('User not found!!!');
    }
    const hashedPassword = await this.hashPassword(inputPassword);
    const updatedUser = await this.userRepo.update(user.id, {
      password: hashedPassword,
    });
    return updatedUser;
  }
}
