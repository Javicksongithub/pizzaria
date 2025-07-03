import  {  Router } from 'express';

import {CreateUserController}from './controllers/user/CreateUserController'


import{AuthUserController}from './controllers/user/AuthUserController'

const router = Router();
//--ROTAS USER--//
router.post('/users', new CreateUserController().handle)

//--ROTAS AUTH--//
// Rota para autenticação de usuário
// Aqui você pode usar o AuthUserController para lidar com a autenticação


router.post('/session', new AuthUserController().handle)

export { router };
