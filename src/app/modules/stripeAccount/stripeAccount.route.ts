import express from 'express';
import { stripeAccountController } from './stripeAccount.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';

// import { auth } from "../../middlewares/auth.js";

const stripeAccountRoutes = express.Router();

stripeAccountRoutes
    .post(
        '/create-connected-account',
        auth(USER_ROLES.VENDOR),
        stripeAccountController.createStripeAccount,
    )
    .get('/success-account/:id', stripeAccountController.successPageAccount)
    .get(
        '/refreshAccountConnect/:id',
        stripeAccountController.refreshAccountConnect,
    );

export default stripeAccountRoutes;
