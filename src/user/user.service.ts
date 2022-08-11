import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDTO } from './dtos/user-create.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { ContactUsDTO } from './dtos/contact-us.dto';
const nodemailer = require('nodemailer');
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async findUser(email: string) {
    const user = await this.userRepo.findOneBy({ email: email });
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
    console.log(user);

    const jwtUser = await this.authService.signJWT(user);
    const refreshJwtToken = await this.authService.signRefreshJWT(user);

    // return user;
    return {
      token: jwtUser,
      refreshToken: refreshJwtToken,
      fullName: user.fullName,
      email,
    };
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
    const insertedUser = await this.userRepo.insert(incomingUser);
    
    const user = {
      fullName: createUser.fullName,
      email: createUser.email,
      id: insertedUser.identifiers[0].id
    }
    
    const jwtUser = await this.authService.signJWT(user);
    const refreshJwtToken = await this.authService.signRefreshJWT(user);

    return {
      token: jwtUser,
      refreshToken: refreshJwtToken,
      fullName: createUser.fullName,
      email: createUser.email,
    };

    // return user;
  }

  async deleteUser(email: string) {
    const user = await this.findUser(email);
    if (!user) {
      throw new BadRequestException('User not found!!!');
    }
    const deletedUser = await this.userRepo.delete(user.id);
    return deletedUser;
  }

  async sendMail(
    fromEmail: string,
    toEmail: string,
    subject: string,
    fullName: string,
    text: string,
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailDetails = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text,
    };

    const info = await transporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log('Error Occurs', err);
      } else {
        console.log('Email sent successfully');
      }
    });
  }
  async contactUs(email: string, fullName: string, message: string) {
    this.sendMail(
      email,
      process.env.GMAIL_USERNAME,
      'Message from a client :)',
      fullName,
      message,
    );
  }

  async forgotPassword(userEmail: string) {
    const user = await this.findUser(userEmail);
    if (!user) {
      throw new BadRequestException('User not found!!!');
    }
    const { id, fullName, email } = user;
    const text = `Hi ${fullName},
    You have requested to reset your password.
    Please click on the link below to reset your password.
    ${process.env.BASE_URL}/user/reset-password/${email}
    `;

    // (from email, to email, subject, fullName, text)
    this.sendMail(
      process.env.GMAIL_USERNAME,
      email,
      'Forgot Password',
      fullName,
      text,
    );
    // host: 'smtp.ethereal.email',
    // port: 587,
    // secure: false,
    // auth: {
    //   user: process.env.ETHEREAL_USERNAME,
    //   pass: process.env.ETHEREAL_PASSWORD,
    // },

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
