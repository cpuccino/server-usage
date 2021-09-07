import express from 'express';
import { getHome } from '../controller/home';

export const router = express.Router();
router.get('/', getHome);
