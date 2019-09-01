import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

// Auth middleware
import authMiddleware from './app/middlewares/auth';

// Controllers
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SessionController from './app/controllers/SessionController';
import SubscriptionController from './app/controllers/SubscriptionController';
import UserController from './app/controllers/UserController';
import OrganizingController from './app/controllers/OrganizingController';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

// File routes
routes.post('/files', upload.single('file'), FileController.store);

// Users routes
routes.put('/users', UserController.update);

// Meetup routes
routes.get('/meetups', MeetupController.index);
routes.put('/meetups/:id', MeetupController.update);
routes.post('/meetups', MeetupController.store);
routes.delete('/meetups/:id', MeetupController.delete);
routes.get('/meetups/:id', MeetupController.show);

routes.get('/organizing', OrganizingController.index);

// Subscription routes
routes.get('/subscriptions', SubscriptionController.index);
routes.post('/meetups/:id/subscription', SubscriptionController.store);
routes.delete('/subscriptions/:id', SubscriptionController.delete);

export default routes;
