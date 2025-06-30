import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import colors from 'colors';
import config from '.';
import { User } from '../app/modules/user/user.model';
import { logger } from '../shared/logger';
import { USER_ROLES } from '../app/modules/user/user.enums';

// Google OAuth Strategy
passport.use(
     new GoogleStrategy(
          {
               clientID: config.social.google_client_id as string,
               clientSecret: config.social.google_client_secret as string,
               callbackURL: `${config.backend_url}/api/v1/auth/google/callback`,
               proxy: true, // Add this line if you're behind a proxy
               passReqToCallback: true, // Add this to access the request object in the callback
          },
          async (accessToken, refreshToken, profile: any, done: any) => {
               try {
                    console.log({ profile });
                    let user = await User.findOne({ googleId: profile.id });
                    let isNewUser = false;

                    if (!user) {
                         const newUser = {
                              googleId: profile?.id,
                              full_name: profile?.displayName,
                              provider: "google",
                              email: profile?.emails && profile?.emails[0]?.value,
                              image: profile?.photos && profile?.photos[0]?.value,
                              verified: true,
                              role: USER_ROLES.USER,
                         };

                         user = await User.create(newUser);
                         isNewUser = true;
                    }

                    // Add the isNewUser flag to the user object
                    const userWithIsNewUser = { ...user.toObject(), isNewUser };

                    return done(null, userWithIsNewUser);
               } catch (error) {
                    logger.error(error, "Error in Google Strategy");
                    done(error, undefined);
               }
          },
     ),
);

// Facebook OAuth Strategy
passport.use(
     new FacebookStrategy(
          {
               clientID: config.social.facebook_client_id as string,
               clientSecret: config.social.facebook_client_secret as string,
               callbackURL: `${config.backend_url}/api/v1/auth/facebook/callback`,
               profileFields: ['id', 'displayName', 'photos', 'email']
          },
          async (accessToken, refreshToken, profile, done) => {
               try {
                    let user = await User.findOne({ facebookId: profile.id });
                    let isNewUser = false;

                    if (!user) {
                         const newUser = {
                              facebookId: profile?.id,
                              full_name: profile?.displayName,
                              provider: "facebook",
                              email: profile?.emails && profile?.emails[0]?.value,
                              image: profile?.photos && profile?.photos[0]?.value,
                              verified: true,
                              role: USER_ROLES.USER,
                         };

                         user = await User.create(newUser);
                         isNewUser = true;
                    }

                    // Add the isNewUser flag to the user object
                    const userWithIsNewUser = { ...user.toObject(), isNewUser };

                    return done(null, userWithIsNewUser);
               } catch (error) {
                    logger.error(error, "Error in Facebook Strategy");
                    done(error, null);
               }
          },
     ),
);

// Serialize & Deserialize User
passport.serializeUser((user: any, done) => {
     try {
          console.log("---------------- inside serializeUser ----------------");
          done(null, user._id); // save the user id to the session
     } catch (error) {
          logger.error(error, "Error in Serialize User");
          done(error, null);
     }
});

passport.deserializeUser(async (id, done) => {
     try {
          console.log("----------------inside deserializeUser----------------, id: ", id, "----------------");
          const user = await User.findById(id);
          if (!user) {
               return done(null, false);
          }
          done(null, user); // save the user to req.user
     } catch (error) {
          logger.error(error, "Error in De-serialize User");
          return done(error);
     }
});

export default passport;
