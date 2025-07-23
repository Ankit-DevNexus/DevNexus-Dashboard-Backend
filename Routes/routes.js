import express from 'express'
import { DashboardController } from '../controllers/DashboardController.js';
import { deleteUser, getAllUsers, login, signup, updateUser } from '../controllers/authUserContoller.js';
import { createLead, fetchAndSaveNewLeads,  getAdsInsights, getAllLeads, getAllLeadsFromDB, updateLead, uploadLeadsFromExcel } from '../controllers/LeadController.js';
import upload from '../middleware/multerMiddleware.js';
import { Authenticate, authorize } from '../middleware/authMiddleware.js';
import { getUserLoginHistory } from '../controllers/UserLoginHistoryController.js';
import { contactus, getAllContactSubmissions } from '../controllers/ContactUsLeadsController.js';
import { forgotPassword, resetPassword } from '../controllers/ForgetPasswordController.js';

const router = express.Router();

router.get('/', DashboardController);


// Apply middleware **before** admin routes
// router.use('/auth', authSessionMiddleware);

router.get('/forgot-password', forgotPassword);
router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);
router.post('/reset-password/:token', resetPassword);

// sign up and login routes
router.post('/auth/api/signup-users', signup);
router.get('/auth/api/signin-users', login);

router.get('/auth/api/get-all-users', getAllUsers);
router.put('/auth/api/update-user/:id',  authorize('admin'), updateUser);
router.delete('/auth/api/delete-user/:id',  authorize('admin'), deleteUser);


// create and get Leads
router.post('/auth/api/Add-leads', Authenticate,  createLead);
router.get('/auth/api/get-all-leads', getAllLeads);
router.post("/auth/api/upload-excel-leads",  upload.single("file"), uploadLeadsFromExcel);

// update leads 
router.patch("/auth/api/get-all-leads/:id",  updateLead);

// get login history
// router.get('/auth/api/user-login-history', authorize('admin'), getUserLoginHistory);
router.get('/auth/api/user-login-history',  getUserLoginHistory);

router.get('/auth/api/meta-ads/fetch-meta-leads',  fetchAndSaveNewLeads);

router.get('/auth/api/meta-ads/all-leads',  getAllLeadsFromDB);

router.get('/auth/api/meta-ads/insights',  getAdsInsights);

router.get('/auth/api/contact', getAllContactSubmissions);

router.post('/auth/api/contact',  contactus);

export default router;