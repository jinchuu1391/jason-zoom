import express from 'express'
import {joinView, joinOldView, joinRoomView} from '../controllers/join';

const router = express.Router();

router.get('/join', joinView)
router.get('/joinold', joinOldView)
router.get('/join/:rooms', joinRoomView)

export default router