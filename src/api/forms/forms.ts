import { Router } from 'express';
import {
    registerTeamWithPlayersController
} from './controller.js';

const router = Router();

router.post('/register-team', registerTeamWithPlayersController);


export default router;
