/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'

const router = Router()

/**
 * User Login
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    error: 'Auth no implementado',
    detalle: { ruta: 'register', body: req.body ?? null },
  })
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    error: 'Auth no implementado',
    detalle: { ruta: 'login', body: req.body ?? null },
  })
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    error: 'Auth no implementado',
    detalle: { ruta: 'logout', body: req.body ?? null },
  })
})

export default router
